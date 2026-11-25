/**
 * Quality Control Criteria & Evaluation Thresholds - The Wall
 * 
 * IMPORTANT DISCLAIMER:
 * These criteria and thresholds are EXPERIMENTAL / PLACEHOLDER guidelines for development.
 * True agronomic thresholds must be physically established and calibrated through
 * standardized laboratory ASTM/ISO testing and field crop trials.
 * 
 * Version: 1.0-EXPERIMENTAL
 */

export const QUALITY_CRITERIA_METADATA = {
  version: '1.0-EXPERIMENTAL',
  status: 'Experimental / Subject to Lab Calibration',
  lastUpdated: '2026-11-25',
  isApprovedForCommercialRelease: false,
  note: 'Criteria are provisional engineering targets. Not verified for certified organic compliance or statutory agricultural sale.',
};

export const TEST_CRITERIA_THRESHOLDS = {
  // Water Absorption Test (% dry weight basis)
  absorption: {
    name: 'Water Absorption Rate',
    unit: '%',
    criticalMin: 300.0, // Below this is critical failure
    standardMin: 350.0, // Minimum for Grade B
    premiumMin: 400.0,  // Minimum for Grade A
  },

  // Water Retention Test (% of absorbed water held after drainage)
  retention: {
    name: 'Water Retention Capacity',
    unit: '%',
    criticalMin: 65.0,  // Below this is critical failure
    standardMin: 72.0,  // Minimum for Grade B
    premiumMin: 78.0,   // Minimum for Grade A
  },

  // Moisture Distribution Spread (% difference between max and min layer)
  distributionSpread: {
    name: 'Layer Moisture Spread (Max - Min)',
    unit: '%',
    premiumMaxDiff: 12.0,  // Very uniform (<12% delta between top, mid, bottom)
    standardMaxDiff: 20.0, // Acceptable uniformity (<20% delta)
    criticalMaxDiff: 30.0, // Excessive dry/wet pockets (>30% delta fails)
  },

  // Structural Stability / Deformation (% reduction under load)
  deformation: {
    name: 'Compressive Deformation',
    unit: '%',
    premiumMaxDeform: 10.0,  // Grade A (< 10% compression)
    standardMaxDeform: 18.0, // Grade B (< 18% compression)
    criticalMaxDeform: 28.0, // Grade C/Fail (> 28% collapse)
  },

  // Drying Behavior / Weight Loss (%)
  dryingWeightLoss: {
    name: 'Drying Weight Loss',
    unit: '%',
    standardMin: 45.0,
    standardMax: 85.0,
  },
};

export const CROP_PROFILES = [
  {
    id: 'nursery',
    name: 'Nursery & Seed Germination',
    description: 'Requires fine particle consistency, gentle moisture buffering, and high seedbed uniformity.',
    dimensions: [
      { key: 'moistureConsistency', label: 'Moisture Consistency', required: 'High (<12% spread)' },
      { key: 'waterRetention', label: 'Water Retention', required: '70% - 82%' },
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
      { key: 'moistureConsistency', label: 'Moisture Consistency', required: 'Moderate (<18% spread)' },
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
      { key: 'moistureConsistency', label: 'Moisture Consistency', required: 'Uniform (<15% spread)' },
      { key: 'waterRetention', label: 'Water Retention', required: '72% - 80%' },
      { key: 'drainage', label: 'Drainage Aeration', required: 'High drainage capacity' },
      { key: 'rootAeration', label: 'Root Aeration', required: 'High oxygenation' },
      { key: 'structuralStability', label: 'Structural Stability', required: 'High rigidity (<12% deformation)' },
      { key: 'durability', label: 'Substrate Durability', required: '120-180 days long crop' },
    ],
  },
];
