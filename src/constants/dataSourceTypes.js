/**
 * The Wall - Global Real Data and Demo Data Classification System
 * Defines source classifications, filter modes, and metadata attributes.
 */

export const DATA_SOURCES = {
  REAL: 'REAL',
  DEMO: 'DEMO',
  UNAVAILABLE: 'UNAVAILABLE',
  UNVERIFIED: 'UNVERIFIED',
};

export const SOURCE_TYPES = {
  ESP32: 'ESP32',
  DATABASE: 'DATABASE',
  MANUAL_ENTRY: 'MANUAL_ENTRY',
  MOCK: 'MOCK',
};

export const FILTER_MODES = {
  ALL: 'ALL',
  REAL: 'REAL',
  DEMO: 'DEMO',
};

// Known seeded demo identifiers
export const KNOWN_DEMO_BATCH_IDS = new Set([
  'TW-2026-B001',
  'TW-2026-B002',
  'TW-2026-B003',
  'TW-2026-B004',
  'TW-2026-B005',
  'TW-2026-B006',
  'TW-2026-B007',
  'TW-BATCH-2026-039',
  'TW-BATCH-2026-038',
  'TW-BATCH-2026-037',
  'TW-BATCH-2026-036',
  'TW-BATCH-2026-035',
  'TW-BATCH-2026-034',
]);

export const KNOWN_DEMO_QC_IDS = new Set([
  'QC-2026-001',
  'QC-2026-002',
  'QC-2026-003',
  'QC-2026-004',
]);

export const KNOWN_DEMO_BIO_SAMPLE_IDS = new Set([
  'BIO-SMP-001',
  'BIO-SMP-002',
  'BIO-SMP-003',
  'BIO-SMP-004',
  'BIO-SMP-005',
]);

export const KNOWN_DEMO_USAGE_IDS = new Set([
  'USE-2026-001',
  'USE-2026-002',
  'USE-2026-003',
  'USE-2026-004',
  'USE-2026-005',
  'USE-2026-006',
  'USE-2026-007',
  'USE-2026-008',
  'USE-2026-009',
  'USE-2026-010',
  'USE-2026-011',
  'USE-2026-012',
]);

/**
 * Classifies an arbitrary entity record based on origin metadata
 * @param {Object} item - Record object
 * @param {'batch'|'qc'|'bio_sample'|'bio_obs'|'water_usage'|'sensor'|'farm'} domain - Entity domain
 * @returns {string} One of DATA_SOURCES (REAL, DEMO, UNAVAILABLE, UNVERIFIED)
 */
export function classifyRecord(item, domain) {
  if (!item) return DATA_SOURCES.UNAVAILABLE;

  // Explicit flag takes priority if set on the record
  if (item.dataSource) return item.dataSource;
  if (item.isDemo === true || item.is_demo === true) return DATA_SOURCES.DEMO;
  if (item.isReal === true || item.is_real === true) return DATA_SOURCES.REAL;

  switch (domain) {
    case 'batch':
      if (item.id && KNOWN_DEMO_BATCH_IDS.has(item.id)) return DATA_SOURCES.DEMO;
      if (item.id && item.id.startsWith('TW-BATCH-2026-')) return DATA_SOURCES.DEMO;
      if (item.isUserCreated) return DATA_SOURCES.REAL;
      if (item.notes && item.notes.toLowerCase().includes('demo')) return DATA_SOURCES.DEMO;
      // If we cannot verify whether an existing backend record is physical or test
      return DATA_SOURCES.UNVERIFIED;

    case 'qc':
      if (item.id && KNOWN_DEMO_QC_IDS.has(item.id)) return DATA_SOURCES.DEMO;
      if (item.criteriaVersion && item.criteriaVersion.includes('EXPERIMENTAL')) return DATA_SOURCES.DEMO;
      if (item.isUserCreated) return DATA_SOURCES.REAL;
      return DATA_SOURCES.UNVERIFIED;

    case 'water_usage':
      if (item.id && KNOWN_DEMO_USAGE_IDS.has(item.id)) return DATA_SOURCES.DEMO;
      if (item.isUserCreated || (item.recordedBy && item.recordedBy.includes('Manual Entry'))) {
        return DATA_SOURCES.REAL;
      }
      return DATA_SOURCES.DEMO;

    case 'bio_sample':
      if (item.id && KNOWN_DEMO_BIO_SAMPLE_IDS.has(item.id)) return DATA_SOURCES.DEMO;
      if (item.isUserCreated) return DATA_SOURCES.REAL;
      return DATA_SOURCES.UNVERIFIED;

    case 'bio_obs':
      if (item.id && (item.id.startsWith('OBS-00') || item.id.startsWith('OBS-01') || item.id.startsWith('OBS-02'))) {
        return DATA_SOURCES.DEMO;
      }
      if (item.isUserCreated) return DATA_SOURCES.REAL;
      return DATA_SOURCES.UNVERIFIED;

    case 'sensor':
      if (item.isConnected && item.liveValue !== null && item.liveValue !== undefined) {
        return item.isStale ? DATA_SOURCES.UNAVAILABLE : DATA_SOURCES.REAL;
      }
      return DATA_SOURCES.UNAVAILABLE;

    default:
      return item.isUserCreated ? DATA_SOURCES.REAL : DATA_SOURCES.DEMO;
  }
}
