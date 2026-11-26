import QRCode from 'qrcode';
import { apiClient } from './apiClient';
import { manufacturingService } from './manufacturingService';
import { qualityService } from './qualityService';
import { TRACEABILITY_CONFIG } from '../constants/traceabilityConfig';

const STORAGE_KEY = 'thewall_qr_traceability_v1';

/**
 * Service to manage Product QR Passports, Traceability Identities, and public verification records.
 * Integrates directly with manufacturingService and qualityService without duplicating batch data.
 */
export const traceabilityService = {
  getStoredRegistry() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return {};
  },

  saveRegistry(registry) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(registry));
    } catch (e) {
      console.warn('Failed to save QR traceability registry to localStorage:', e);
    }
  },

  resetRegistry() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  },

  /**
   * Helper to derive a stable, non-changing traceability identifier for a batch.
   */
  deriveTraceabilityId(batchId) {
    // e.g. "TW-BATCH-2026-036" -> "TR-TW-2026-036"
    return `TR-${batchId.replace('BATCH-', '')}`;
  },

  /**
   * Generates QR code images (both DataURL PNG and SVG) using real QRCode library.
   */
  async generateQrAssets(publicUrl) {
    const pngDataUrl = await QRCode.toDataURL(publicUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: '#1B4332', // The Wall primary forest green
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });

    const svgString = await QRCode.toString(publicUrl, {
      type: 'svg',
      margin: 2,
      color: {
        dark: '#1B4332',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });

    return { pngDataUrl, svgString };
  },

  /**
   * Ensures default QR records are populated for initial batches on first load.
   * Also automatically regenerates any existing QR records that were generated
   * on localhost/127.0.0.1 so they use the canonical production URL.
   */
  async ensureInitialQrRecords() {
    try {
      const registry = this.getStoredRegistry();
      let batches = [];
      try {
        batches = await manufacturingService.getBatches();
      } catch {
        batches = manufacturingService.getCachedBatches();
      }

      let modified = false;

      for (const batch of batches) {
        const existing = registry[batch.id];
        const traceabilityId = existing?.traceabilityId || this.deriveTraceabilityId(batch.id);
        const expectedPublicUrl = TRACEABILITY_CONFIG.getPublicTraceUrl(traceabilityId);

        const hasLocalhostUrl = existing?.publicUrl && 
          (existing.publicUrl.includes('localhost') || existing.publicUrl.includes('127.0.0.1'));
        const isUrlMismatched = existing && existing.publicUrl !== expectedPublicUrl;

        // Provision missing records or regenerate stale localhost/mismatched URLs
        if (!existing || hasLocalhostUrl || isUrlMismatched) {
          try {
            const { pngDataUrl, svgString } = await this.generateQrAssets(expectedPublicUrl);
            registry[batch.id] = {
              ...(existing || {}),
              batchId: batch.id,
              traceabilityId,
              publicUrl: expectedPublicUrl,
              qrGeneratedAt: existing?.qrGeneratedAt || new Date().toLocaleString('en-GB', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              }),
              qrDataUrl: pngDataUrl,
              qrSvg: svgString,
              status: 'Active',
            };
            modified = true;
          } catch (err) {
            console.error(`Failed to generate/update QR for ${batch.id}:`, err);
          }
        }
      }

      if (modified) {
        this.saveRegistry(registry);
      }
      return registry;
    } catch {
      return this.getStoredRegistry();
    }
  },

  /**
   * Fetches the official public product passport from the dedicated backend API.
   * Returns null if the batch/passport does not exist in the database (404).
   * Falls back gracefully to local demo cache if offline or in preview.
   */
  async getPublicPassport(traceabilityId) {
    if (!traceabilityId) return null;
    const decodedId = decodeURIComponent(traceabilityId).trim();

    try {
      const response = await apiClient.get(`/traceability/${encodeURIComponent(decodedId)}`);
      if (response && response.passport) {
        const p = response.passport;
        return {
          productName: p.productName,
          brand: p.brand,
          batchId: p.batchId,
          traceabilityId: p.traceabilityId,
          verificationStatus: p.verificationStatus,
          batch: {
            id: p.batchId,
            createdAt: p.manufacturedDate || p.productionDate,
            quantity: p.quantity,
            stage: p.stage,
            status: p.status,
            materials: p.materials,
            history: p.history,
          },
          qcTest: p.qcTest,
          hardwareDevice: p.hardwareDevice,
        };
      }
    } catch (err) {
      const errMsg = err?.message || '';
      // If server explicitly returned 404 Not Found, return null (record not found)
      if (errMsg.includes('404')) {
        return null;
      }
      console.warn(`Could not fetch passport from API for ${decodedId}:`, errMsg);
    }

    // Fallback: check local synchronous resolver
    return this.getByTraceabilityId(decodedId);
  },

  /**
   * Returns merged traceability status for all manufacturing batches.
   * Ensures publicUrl always reflects the active production base URL.
   */
  getAllBatchesTraceability() {
    const batches = manufacturingService.getCachedBatches();
    const tests = qualityService.getTests();
    const registry = this.getStoredRegistry();

    return batches.map((batch) => {
      const qrRecord = registry[batch.id] || null;
      const qcTest = tests.find((t) => t.batchId === batch.id) || null;
      const verificationStatus = this.calculateVerificationStatus(batch, qcTest);
      const traceabilityId = qrRecord ? qrRecord.traceabilityId : this.deriveTraceabilityId(batch.id);
      const canonicalPublicUrl = TRACEABILITY_CONFIG.getPublicTraceUrl(traceabilityId);

      return {
        batch,
        batchId: batch.id,
        productionDate: batch.createdAt,
        quantity: batch.quantity,
        manufacturingStatus: batch.status,
        stage: batch.stage,
        qcTest,
        qualityStatus: qcTest ? qcTest.status : 'Not Tested',
        qualityGrade: qcTest ? qcTest.grade : '—',
        qrRecord: qrRecord ? {
          ...qrRecord,
          publicUrl: canonicalPublicUrl,
        } : null,
        hasQr: !!qrRecord,
        traceabilityId,
        publicUrl: canonicalPublicUrl,
        verificationStatus,
      };
    });
  },

  /**
   * Generates or regenerates a QR code for a specific batch.
   */
  async generateQrForBatch(batchId) {
    const batches = manufacturingService.getCachedBatches();
    const batch = batches.find((b) => b.id === batchId);

    if (!batch) {
      throw new Error(`Batch ${batchId} does not exist in Manufacturing Management.`);
    }

    const registry = this.getStoredRegistry();
    const existing = registry[batchId];

    // Maintain permanent traceabilityId
    const traceabilityId = existing?.traceabilityId || this.deriveTraceabilityId(batchId);
    const publicUrl = TRACEABILITY_CONFIG.getPublicTraceUrl(traceabilityId);

    const { pngDataUrl, svgString } = await this.generateQrAssets(publicUrl);

    const qrRecord = {
      batchId,
      traceabilityId,
      publicUrl,
      qrGeneratedAt: new Date().toLocaleString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      qrDataUrl: pngDataUrl,
      qrSvg: svgString,
      status: 'Active',
    };

    registry[batchId] = qrRecord;
    this.saveRegistry(registry);

    return qrRecord;
  },

  /**
   * Fetches public traceability dossier for /trace/:traceabilityId.
   */
  getByTraceabilityId(traceabilityId) {
    if (!traceabilityId) return null;

    const registry = this.getStoredRegistry();
    const decodedId = decodeURIComponent(traceabilityId).trim();

    // Find in registry
    let matchedBatchId = null;
    let qrRecord = null;

    for (const [bId, record] of Object.entries(registry)) {
      if (record.traceabilityId.toLowerCase() === decodedId.toLowerCase()) {
        matchedBatchId = bId;
        qrRecord = record;
        break;
      }
    }

    // Fallback: check if the traceabilityId directly maps to a batch ID
    if (!matchedBatchId) {
      const batches = manufacturingService.getCachedBatches();
      const match = batches.find(
        (b) => this.deriveTraceabilityId(b.id).toLowerCase() === decodedId.toLowerCase()
      );
      if (match) {
        matchedBatchId = match.id;
      }
    }

    if (!matchedBatchId) {
      return null; // Record Not Found
    }

    const batches = manufacturingService.getCachedBatches();
    const batch = batches.find((b) => b.id === matchedBatchId);
    if (!batch) return null;

    const tests = qualityService.getTests();
    const qcTest = tests.find((t) => t.batchId === matchedBatchId) || null;

    const verificationStatus = this.calculateVerificationStatus(batch, qcTest);

    return {
      productName: TRACEABILITY_CONFIG.productName,
      brand: TRACEABILITY_CONFIG.appBrand,
      batchId: batch.id,
      traceabilityId: qrRecord?.traceabilityId || this.deriveTraceabilityId(batch.id),
      qrRecord,
      batch,
      qcTest,
      verificationStatus,
      // Prepared Hardware Gateway mapping for future IoT integration
      hardwareDevice: {
        isAvailable: false, // Explicitly tagged: no fake hardware data
        statusMessage: 'Hardware Monitoring Not Yet Available',
        note: 'Live IoT telemetry sensors have not yet been assigned to this specific physical bed.',
      },
    };
  },

  /**
   * Computes accurate verification status based on actual records.
   */
  calculateVerificationStatus(batch, qcTest) {
    if (!batch) return 'Record Not Found';

    if (qcTest) {
      if (qcTest.status === 'Approved') {
        if (qcTest.grade === 'Grade A' || qcTest.grade === 'Grade B') {
          return 'Quality Approved';
        }
        if (qcTest.grade === 'Grade C') {
          return 'Quality Approved (Standard C)';
        }
      }
      if (qcTest.status === 'Rejected' || qcTest.grade === 'Failed') {
        return 'Quality Rejected';
      }
      if (qcTest.status === 'Pending' || qcTest.status === 'In Progress' || qcTest.status === 'Awaiting Review') {
        return 'Awaiting Quality Approval';
      }
    }

    if (batch.stage === 'Completed') {
      return 'Awaiting Quality Approval';
    }

    return 'Manufacturing In Progress';
  },
};
