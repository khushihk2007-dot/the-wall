import QRCode from 'qrcode';
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
   */
  async ensureInitialQrRecords() {
    const registry = this.getStoredRegistry();
    const batches = await manufacturingService.getBatches();

    let modified = false;

    // Automatically provision initial QR records for completed / active batches if missing
    for (const batch of batches) {
      if (!registry[batch.id]) {
        const traceabilityId = this.deriveTraceabilityId(batch.id);
        const publicUrl = TRACEABILITY_CONFIG.getPublicTraceUrl(traceabilityId);

        try {
          const { pngDataUrl, svgString } = await this.generateQrAssets(publicUrl);
          registry[batch.id] = {
            batchId: batch.id,
            traceabilityId,
            publicUrl,
            qrGeneratedAt: '2026-11-23 11:00',
            qrDataUrl: pngDataUrl,
            qrSvg: svgString,
            status: 'Active',
          };
          modified = true;
        } catch (err) {
          console.error(`Failed to generate initial QR for ${batch.id}:`, err);
        }
      }
    }

    if (modified) {
      this.saveRegistry(registry);
    }
    return registry;
  },

  /**
   * Returns merged traceability status for all manufacturing batches.
   */
  getAllBatchesTraceability() {
    const batches = manufacturingService.getCachedBatches();
    const tests = qualityService.getTests();
    const registry = this.getStoredRegistry();

    return batches.map((batch) => {
      const qrRecord = registry[batch.id] || null;
      const qcTest = tests.find((t) => t.batchId === batch.id) || null;
      const verificationStatus = this.calculateVerificationStatus(batch, qcTest);

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
        qrRecord,
        hasQr: !!qrRecord,
        traceabilityId: qrRecord ? qrRecord.traceabilityId : null,
        publicUrl: qrRecord ? qrRecord.publicUrl : null,
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
