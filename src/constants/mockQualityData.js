/**
 * Initial Mock QC Test Records - The Wall (Module 3)
 * Demonstrates independent bed-level testing across manufacturing batches.
 * Contains 4 independently tested growing beds representing key quality classifications.
 */

export const INITIAL_QC_TESTS = [
  // 1. Batch 036 - Bed 01 (Premium Grade A)
  {
    id: 'QC-2026-001',
    batchId: 'TW-BATCH-2026-036',
    bedId: 'BED-01',
    testDate: '2026-11-22',
    sampleQuantity: 1,
    status: 'Approved',
    grade: 'Grade A',
    reviewer: 'Dr. K. Patel',
    reviewerNotes: 'Exceeds all baseline water absorption targets (422%). Structural integrity under 450N compression is exceptional (8% deformation).',
    criteriaVersion: '1.0-VALIDATED',
    evaluationDate: '2026-11-22 16:30',
    measurements: {
      absorption: {
        dryWeight: 250,
        wetWeight: 1305,
        value: 422.0,
        isValid: true,
      },
      retention: {
        waterAbsorbed: 1055,
        waterRetained: 839,
        durationMinutes: 30,
        value: 79.5,
        isValid: true,
      },
      moistureDist: {
        topLayer: 68.0,
        middleLayer: 63.5,
        bottomLayer: 59.0,
        average: 63.5,
        spread: 9.0,
        variationPct: 14.2,
        value: 14.2,
        isValid: true,
      },
      stability: {
        initialThickness: 35.0,
        finalThickness: 32.2,
        compressionForceN: 450,
        durationHours: 24,
        observations: 'No delamination observed under 450N load over 24h.',
        value: 8.0,
        isValid: true,
      },
      drying: {
        initialWetWeight: 1305,
        finalWeight: 450,
        durationHours: 24,
        temperatureC: 32,
        observations: 'Smooth moisture release without warping.',
        value: 65.5,
        isValid: true,
      },
    },
    testResults: {
      absorption: { testKey: 'absorption', value: 422.0, unit: '%', grade: 'Grade A', isCriticalFail: false, reason: 'Absorption 422% meets Grade A (≥ 400%).' },
      retention: { testKey: 'retention', value: 79.5, unit: '%', grade: 'Grade A', isCriticalFail: false, reason: 'Retention 79.5% meets Grade A (≥ 78%).' },
      moistureDist: { testKey: 'moistureDist', value: 14.2, unit: '% variation', grade: 'Grade A', isCriticalFail: false, reason: 'Moisture variation 14.2% meets Grade A (≤ 15%).' },
      stability: { testKey: 'stability', value: 8.0, unit: '% deformation', grade: 'Grade A', isCriticalFail: false, reason: 'Deformation 8% meets Grade A (≤ 10%).' },
      drying: { testKey: 'drying', value: 65.5, unit: '% weight loss', grade: 'Grade A', isCriticalFail: false, reason: 'Drying loss 65.5% within Grade A target (55% - 75%).' },
    },
    cropSuitability: [
      { profileId: 'nursery', name: 'Nursery & Seed Germination', status: 'Suitable', notes: 'Low 14.2% layer variation prevents dry pockets in seedling cells.', supportingResults: ['Moisture variation: 14.2%', 'Retention: 79.5%'], limitingFactors: [] },
      { profileId: 'leafy', name: 'Leafy Vegetables', status: 'Suitable', notes: 'High water retention capacity sustains consistent transpiration.', supportingResults: ['Retention: 79.5%', 'Absorption: 422%'], limitingFactors: [] },
      { profileId: 'fruiting', name: 'Fruiting Vegetables', status: 'Suitable', notes: 'Compressive deformation within 8% allows heavy root structures.', supportingResults: ['Deformation: 8% under load', 'Structural absorption: 422%'], limitingFactors: [] },
    ],
    history: [
      { previousStatus: 'Pending', newStatus: 'In Progress', timestamp: '2026-11-22 10:00', user: 'Lab Tech R. Sharma', note: 'Bed BED-01 retrieved from curing tunnel.' },
      { previousStatus: 'In Progress', newStatus: 'Approved', timestamp: '2026-11-22 16:30', user: 'Dr. K. Patel', note: 'Batch bed certified with Grade A Premium rating.' },
    ],
  },

  // 2. Batch 036 - Bed 02 (Independently tested sample from SAME batch - Grade B)
  {
    id: 'QC-2026-002',
    batchId: 'TW-BATCH-2026-036',
    bedId: 'BED-02',
    testDate: '2026-11-23',
    sampleQuantity: 1,
    status: 'Approved',
    grade: 'Grade B',
    reviewer: 'Dr. K. Patel',
    reviewerNotes: 'Good water retention and absorption. Slightly higher layer variation (20.4%) places this unit in Grade B Standard.',
    criteriaVersion: '1.0-VALIDATED',
    evaluationDate: '2026-11-23 14:15',
    measurements: {
      absorption: {
        dryWeight: 255,
        wetWeight: 1224,
        value: 380.0,
        isValid: true,
      },
      retention: {
        waterAbsorbed: 969,
        waterRetained: 727,
        durationMinutes: 30,
        value: 75.0,
        isValid: true,
      },
      moistureDist: {
        topLayer: 65.0,
        middleLayer: 58.0,
        bottomLayer: 53.0,
        average: 58.7,
        spread: 12.0,
        variationPct: 20.4,
        value: 20.4,
        isValid: true,
      },
      stability: {
        initialThickness: 35.0,
        finalThickness: 30.5,
        compressionForceN: 450,
        durationHours: 24,
        observations: 'Minor surface impression under 450N load over 24h.',
        value: 12.9,
        isValid: true,
      },
      drying: {
        initialWetWeight: 1224,
        finalWeight: 465,
        durationHours: 24,
        temperatureC: 32,
        observations: 'Normal drying curve.',
        value: 62.0,
        isValid: true,
      },
    },
    testResults: {
      absorption: { testKey: 'absorption', value: 380.0, unit: '%', grade: 'Grade B', isCriticalFail: false, reason: 'Absorption 380% meets Grade B (≥ 350%).' },
      retention: { testKey: 'retention', value: 75.0, unit: '%', grade: 'Grade B', isCriticalFail: false, reason: 'Retention 75% meets Grade B (≥ 72%).' },
      moistureDist: { testKey: 'moistureDist', value: 20.4, unit: '% variation', grade: 'Grade B', isCriticalFail: false, reason: 'Moisture variation 20.4% meets Grade B (≤ 25%).' },
      stability: { testKey: 'stability', value: 12.9, unit: '% deformation', grade: 'Grade B', isCriticalFail: false, reason: 'Deformation 12.9% meets Grade B (≤ 18%).' },
      drying: { testKey: 'drying', value: 62.0, unit: '% weight loss', grade: 'Grade A', isCriticalFail: false, reason: 'Drying loss 62% within Grade A target (55% - 75%).' },
    },
    cropSuitability: [
      { profileId: 'nursery', name: 'Nursery & Seed Germination', status: 'Conditionally Suitable', notes: 'Moderate moisture spread requires careful seedling hydration.', supportingResults: ['Moisture variation: 20.4%'], limitingFactors: ['Moisture spread higher than Grade A target'] },
      { profileId: 'leafy', name: 'Leafy Vegetables', status: 'Suitable', notes: 'Adequate hydration support.', supportingResults: ['Retention: 75%'], limitingFactors: [] },
      { profileId: 'fruiting', name: 'Fruiting Vegetables', status: 'Suitable', notes: 'Good compressive strength.', supportingResults: ['Deformation: 12.9%'], limitingFactors: [] },
    ],
    history: [
      { previousStatus: 'Pending', newStatus: 'Approved', timestamp: '2026-11-23 14:15', user: 'Dr. K. Patel', note: 'Second sample from batch 036 evaluated independently.' },
    ],
  },

  // 3. Batch 037 - Bed 01 (Grade C Basic Quality)
  {
    id: 'QC-2026-003',
    batchId: 'TW-BATCH-2026-037',
    bedId: 'BED-01',
    testDate: '2026-11-24',
    sampleQuantity: 1,
    status: 'Approved',
    grade: 'Grade C',
    reviewer: 'Lab Tech R. Sharma',
    reviewerNotes: 'Bed exhibits higher moisture stratification (31.4% variation) and higher deformation (22.9%), rating Grade C Basic.',
    criteriaVersion: '1.0-VALIDATED',
    evaluationDate: '2026-11-24 15:45',
    measurements: {
      absorption: { dryWeight: 260, wetWeight: 1118, value: 330.0, isValid: true },
      retention: { waterAbsorbed: 858, waterRetained: 583, durationMinutes: 30, value: 68.0, isValid: true },
      moistureDist: { topLayer: 66.0, middleLayer: 51.0, bottomLayer: 44.0, average: 53.7, spread: 22.0, variationPct: 31.4, value: 31.4, isValid: true },
      stability: { initialThickness: 35.0, finalThickness: 27.0, compressionForceN: 450, durationHours: 24, observations: 'Noticeable compression under load.', value: 22.9, isValid: true },
      drying: { initialWetWeight: 1118, finalWeight: 570, durationHours: 24, temperatureC: 32, observations: 'Slower moisture release.', value: 49.0, isValid: true },
    },
    testResults: {
      absorption: { testKey: 'absorption', value: 330.0, unit: '%', grade: 'Grade C', isCriticalFail: false, reason: 'Absorption 330% meets Grade C (≥ 300%).' },
      retention: { testKey: 'retention', value: 68.0, unit: '%', grade: 'Grade C', isCriticalFail: false, reason: 'Retention 68% meets Grade C (≥ 65%).' },
      moistureDist: { testKey: 'moistureDist', value: 31.4, unit: '% variation', grade: 'Grade C', isCriticalFail: false, reason: 'Moisture variation 31.4% meets Grade C (≤ 35%).' },
      stability: { testKey: 'stability', value: 22.9, unit: '% deformation', grade: 'Grade C', isCriticalFail: false, reason: 'Deformation 22.9% meets Grade C (≤ 25%).' },
      drying: { testKey: 'drying', value: 49.0, unit: '% weight loss', grade: 'Grade B', isCriticalFail: false, reason: 'Drying loss 49% within Grade B target.' },
    },
    cropSuitability: [
      { profileId: 'nursery', name: 'Nursery & Seed Germination', status: 'Not Suitable', notes: 'Excessive layer variation.', supportingResults: ['Variation: 31.4%'], limitingFactors: ['Layer variation exceeds 28%'] },
      { profileId: 'leafy', name: 'Leafy Vegetables', status: 'Conditionally Suitable', notes: 'Requires tight irrigation schedule.', supportingResults: ['Retention: 68%'], limitingFactors: ['Retention at lower limit'] },
      { profileId: 'fruiting', name: 'Fruiting Vegetables', status: 'Not Suitable', notes: 'Excessive deformation under heavy root weight.', supportingResults: ['Deformation: 22.9%'], limitingFactors: ['Compression exceeds 20%'] },
    ],
    history: [
      { previousStatus: 'Pending', newStatus: 'Approved', timestamp: '2026-11-24 15:45', user: 'Lab Tech R. Sharma', note: 'Independent bed testing completed.' },
    ],
  },

  // 4. Batch 038 - Bed 01 (Failed Lot - Critical Failure in Stability and Absorption)
  {
    id: 'QC-2026-004',
    batchId: 'TW-BATCH-2026-038',
    bedId: 'BED-01',
    testDate: '2026-11-25',
    sampleQuantity: 1,
    status: 'Rejected',
    grade: 'Failed',
    reviewer: 'Dr. K. Patel',
    reviewerNotes: 'Critical structural collapse: 31.4% deformation exceeds critical limit (28%). Absorption (275%) below 300% critical minimum.',
    criteriaVersion: '1.0-VALIDATED',
    evaluationDate: '2026-11-25 09:30',
    measurements: {
      absorption: { dryWeight: 280, wetWeight: 1050, value: 275.0, isValid: true },
      retention: { waterAbsorbed: 770, waterRetained: 477, durationMinutes: 30, value: 62.0, isValid: true },
      moistureDist: { topLayer: 58.0, middleLayer: 40.0, bottomLayer: 33.0, average: 43.7, spread: 25.0, variationPct: 41.5, value: 41.5, isValid: true },
      stability: { initialThickness: 35.0, finalThickness: 24.0, compressionForceN: 450, durationHours: 24, observations: 'Severe structural compaction and fiber delamination under 450N.', value: 31.4, isValid: true },
      drying: { initialWetWeight: 1050, finalWeight: 756, durationHours: 24, temperatureC: 32, observations: 'Dense compaction trapped stagnant water.', value: 28.0, isValid: true },
    },
    testResults: {
      absorption: { testKey: 'absorption', value: 275.0, unit: '%', grade: 'Failed', isCriticalFail: true, reason: 'Absorption 275% is below critical threshold (300%). Matrix lacks capillary porosity.' },
      retention: { testKey: 'retention', value: 62.0, unit: '%', grade: 'Failed', isCriticalFail: true, reason: 'Water retention 62% is below critical threshold (65%). Excessive drainage loss.' },
      moistureDist: { testKey: 'moistureDist', value: 41.5, unit: '% variation', grade: 'Failed', isCriticalFail: true, reason: 'Moisture variation 41.5% exceeds critical limit (40%). Severe stratification.' },
      stability: { testKey: 'stability', value: 31.4, unit: '% deformation', grade: 'Failed', isCriticalFail: true, reason: 'Deformation 31.4% exceeds critical tolerance (28%). Substrate structural collapse risk.' },
      drying: { testKey: 'drying', value: 28.0, unit: '% weight loss', grade: 'Failed', isCriticalFail: true, reason: 'Drying weight loss 28% is below critical minimum (30%). Stagnant waterlogging risk.' },
    },
    cropSuitability: [
      { profileId: 'nursery', name: 'Nursery & Seed Germination', status: 'Not Suitable', notes: 'Critical structural and moisture failures.', supportingResults: [], limitingFactors: ['Critical quality failure'] },
      { profileId: 'leafy', name: 'Leafy Vegetables', status: 'Not Suitable', notes: 'Critical structural and moisture failures.', supportingResults: [], limitingFactors: ['Critical quality failure'] },
      { profileId: 'fruiting', name: 'Fruiting Vegetables', status: 'Not Suitable', notes: 'Critical structural and moisture failures.', supportingResults: [], limitingFactors: ['Critical quality failure'] },
    ],
    history: [
      { previousStatus: 'Pending', newStatus: 'In Progress', timestamp: '2026-11-25 08:30', user: 'Dr. K. Patel', note: 'Sample bed BED-01 tested.' },
      { previousStatus: 'In Progress', newStatus: 'Rejected', timestamp: '2026-11-25 09:30', user: 'Dr. K. Patel', note: 'Multiple critical failures recorded. Batch rejected.' },
    ],
  },
];
