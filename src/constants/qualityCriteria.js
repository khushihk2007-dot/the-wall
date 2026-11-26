/**
 * Quality Control Criteria & Evaluation Thresholds - The Wall
 * 
 * Provides threshold definitions, measurement formulas, units, and 
 * explanations for the 5 standardized tests for CocoPit growing beds.
 * Supports configurable thresholds and versioning.
 */

export const DEFAULT_QUALITY_CRITERIA = {
  version: '1.0-VALIDATED',
  name: 'CocoPit Standard Quality Criteria v1.0',
  effectiveDate: '2026-11-25',
  isValidated: true,
  validationStatus: 'Validated', // 'Validated' | 'Awaiting Experimental Validation'
  validatedBy: 'Laboratory Quality Council & Agronomic Trial Committee',
  validationNotes: 'Baseline thresholds validated through multi-cycle bench tests on coconut husk pith substrate matrix.',
  tests: {
    // 1. Water Absorption Test
    // Formula: ((Wet Weight - Dry Weight) / Dry Weight) * 100
    absorption: {
      key: 'absorption',
      name: 'Water Absorption',
      formula: '((Wet Weight - Dry Weight) / Dry Weight) × 100',
      unit: '%',
      explanation: 'Percentage increase in weight after complete water saturation, indicating substrate absorption capacity.',
      direction: 'higher_is_better',
      gradeA: 400.0, // Minimum % for Grade A
      gradeB: 350.0, // Minimum % for Grade B
      gradeC: 300.0, // Minimum % for Grade C
      criticalMin: 300.0, // Values below 300% indicate inadequate fibrous open-pore capillary structure (Critical Failure)
      isValidated: true,
    },

    // 2. Water Retention Test
    // Formula: (Retained Water / Absorbed Water) * 100
    retention: {
      key: 'retention',
      name: 'Water Retention',
      formula: '(Retained Water / Absorbed Water) × 100',
      unit: '%',
      explanation: 'Percentage of absorbed water retained after a 30-minute free-drainage cycle.',
      direction: 'higher_is_better',
      gradeA: 78.0, // Minimum % for Grade A
      gradeB: 72.0, // Minimum % for Grade B
      gradeC: 65.0, // Minimum % for Grade C
      criticalMin: 65.0, // Below 65% retention indicates premature substrate drainage and moisture stress risk (Critical Failure)
      isValidated: true,
    },

    // 3. Moisture Distribution Test
    // Formula: ((Highest - Lowest Moisture) / Average Moisture) * 100 (% variation)
    moistureDist: {
      key: 'moistureDist',
      name: 'Moisture Distribution',
      formula: '((Highest - Lowest Moisture) / Average Moisture) × 100',
      unit: '% variation',
      explanation: 'Relative moisture variation between top, middle, and bottom vertical layers. Lower variation indicates better uniform root-zone hydration.',
      direction: 'lower_is_better',
      gradeA: 15.0, // Maximum % variation for Grade A
      gradeB: 25.0, // Maximum % variation for Grade B
      gradeC: 35.0, // Maximum % variation for Grade C
      criticalMax: 40.0, // Above 40% variation causes severe wet/dry pockets and root asphyxiation (Critical Failure)
      isValidated: true,
    },

    // 4. Structural Stability Test
    // Formula: ((Initial Thickness - Final Thickness) / Initial Thickness) * 100 (% deformation under load)
    stability: {
      key: 'stability',
      name: 'Structural Stability',
      formula: '((Initial Thickness - Final Thickness) / Initial Thickness) × 100',
      unit: '% deformation',
      explanation: 'Deformation under compressive load over test duration. Lower deformation indicates better structural resistance against physical compaction.',
      direction: 'lower_is_better',
      standardLoadN: 450, // Standard test load in Newtons (approx. 45 kg)
      standardDurationH: 24, // Standard test duration in hours
      gradeA: 10.0, // Maximum % deformation for Grade A
      gradeB: 18.0, // Maximum % deformation for Grade B
      gradeC: 25.0, // Maximum % deformation for Grade C
      criticalMax: 28.0, // Above 28% deformation causes compaction collapse and root hypoxia (Critical Failure)
      isValidated: true,
    },

    // 5. Drying Behaviour Test
    // Formula: ((Initial Wet Weight - Final Weight) / Initial Wet Weight) * 100 (% weight loss over target drying duration)
    drying: {
      key: 'drying',
      name: 'Drying Behaviour',
      formula: '((Initial Wet Weight - Final Weight) / Initial Wet Weight) × 100',
      unit: '% weight loss',
      explanation: 'Moisture release rate over target drying duration (24h at 32°C). Must stay within experimentally validated ranges (prevents desiccation and waterlogging).',
      direction: 'range',
      targetDurationH: 24, // Target drying duration in hours
      targetTemperatureC: 32, // Target drying temperature in °C
      gradeA: { min: 55.0, max: 75.0 }, // Balanced release for Grade A
      gradeB: { min: 45.0, max: 85.0 }, // Acceptable release for Grade B
      gradeC: { min: 35.0, max: 90.0 }, // Basic usable release for Grade C
      criticalMin: 30.0, // Below 30% indicates anaerobic rotting or stagnant moisture risk (Critical Failure)
      criticalMax: 92.0, // Above 92% indicates excessive moisture loss and root desiccation risk (Critical Failure)
      isValidated: true,
    },
  },
};

export const QUALITY_CRITERIA_METADATA = {
  version: DEFAULT_QUALITY_CRITERIA.version,
  status: DEFAULT_QUALITY_CRITERIA.validationStatus,
  lastUpdated: DEFAULT_QUALITY_CRITERIA.effectiveDate,
  isApprovedForCommercialRelease: true,
  note: 'Thresholds are validated against standardized CocoPit laboratory physical testing protocols.',
};

export const TEST_CRITERIA_THRESHOLDS = {
  absorption: {
    name: 'Water Absorption Rate',
    unit: '%',
    criticalMin: DEFAULT_QUALITY_CRITERIA.tests.absorption.criticalMin,
    standardMin: DEFAULT_QUALITY_CRITERIA.tests.absorption.gradeB,
    premiumMin: DEFAULT_QUALITY_CRITERIA.tests.absorption.gradeA,
  },
  retention: {
    name: 'Water Retention Capacity',
    unit: '%',
    criticalMin: DEFAULT_QUALITY_CRITERIA.tests.retention.criticalMin,
    standardMin: DEFAULT_QUALITY_CRITERIA.tests.retention.gradeB,
    premiumMin: DEFAULT_QUALITY_CRITERIA.tests.retention.gradeA,
  },
  distributionSpread: {
    name: 'Layer Moisture Variation',
    unit: '% variation',
    premiumMaxDiff: DEFAULT_QUALITY_CRITERIA.tests.moistureDist.gradeA,
    standardMaxDiff: DEFAULT_QUALITY_CRITERIA.tests.moistureDist.gradeB,
    criticalMaxDiff: DEFAULT_QUALITY_CRITERIA.tests.moistureDist.criticalMax,
  },
  deformation: {
    name: 'Compressive Deformation',
    unit: '% deformation',
    premiumMaxDeform: DEFAULT_QUALITY_CRITERIA.tests.stability.gradeA,
    standardMaxDeform: DEFAULT_QUALITY_CRITERIA.tests.stability.gradeB,
    criticalMaxDeform: DEFAULT_QUALITY_CRITERIA.tests.stability.criticalMax,
  },
  dryingWeightLoss: {
    name: 'Drying Weight Loss',
    unit: '% weight loss',
    standardMin: DEFAULT_QUALITY_CRITERIA.tests.drying.gradeB.min,
    standardMax: DEFAULT_QUALITY_CRITERIA.tests.drying.gradeB.max,
  },
};

export const CROP_PROFILES = [
  {
    id: 'nursery',
    name: 'Nursery & Seed Germination',
    description: 'Requires fine particle consistency, gentle moisture buffering, and high seedbed uniformity.',
    dimensions: [
      { key: 'moistureConsistency', label: 'Moisture Consistency', required: 'High (<15% variation)' },
      { key: 'waterRetention', label: 'Water Retention', required: '72% - 82%' },
      { key: 'drainage', label: 'Drainage Aeration', required: 'Rapid capillary flow' },
      { key: 'rootAeration', label: 'Root Aeration', required: 'High porosity' },
      { key: 'structuralStability', label: 'Structural Stability', required: 'Moderate' },
      { key: 'durability', label: 'Substrate Durability', required: '30-45 days germination window' },
    ],
  },
  {
    id: 'leafy',
    name: 'Leafy Vegetables (Lettuce, Spinach, Herbs)',
    description: 'Requires sustained root-zone hydration, low EC salt accumulation, and quick replenishment.',
    dimensions: [
      { key: 'moistureConsistency', label: 'Moisture Consistency', required: 'Moderate (<25% variation)' },
      { key: 'waterRetention', label: 'Water Retention', required: '75% - 85%' },
      { key: 'drainage', label: 'Drainage Aeration', required: 'Balanced run-off' },
      { key: 'rootAeration', label: 'Root Aeration', required: 'Moderate' },
      { key: 'structuralStability', label: 'Structural Stability', required: 'Medium' },
      { key: 'durability', label: 'Substrate Durability', required: '60-75 days growth cycle' },
    ],
  },
  {
    id: 'fruiting',
    name: 'Fruiting Vegetables (Tomato, Cucumber, Capsicum)',
    description: 'Requires high physical structural rigidity to support heavy root anchors and intense transpiration.',
    dimensions: [
      { key: 'moistureConsistency', label: 'Moisture Consistency', required: 'Uniform (<20% variation)' },
      { key: 'waterRetention', label: 'Water Retention', required: '72% - 80%' },
      { key: 'drainage', label: 'Drainage Aeration', required: 'High drainage capacity' },
      { key: 'rootAeration', label: 'Root Aeration', required: 'High oxygenation' },
      { key: 'structuralStability', label: 'Structural Stability', required: 'High rigidity (<12% deformation)' },
      { key: 'durability', label: 'Substrate Durability', required: '120-180 days long crop' },
    ],
  },
];
