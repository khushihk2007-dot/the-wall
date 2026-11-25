import { TEST_CRITERIA_THRESHOLDS, QUALITY_CRITERIA_METADATA } from '../constants/qualityCriteria';

/**
 * Quality Grading Engine - Pure JavaScript
 * Handles calculations and non-arbitrary grading rule evaluation.
 */

export const gradingService = {
  /**
   * Water Absorption Test
   * Formula: ((wet - dry) / dry) * 100
   */
  calculateAbsorption(dryWeight, wetWeight) {
    const dry = Number(dryWeight);
    const wet = Number(wetWeight);

    if (isNaN(dry) || isNaN(wet) || dry <= 0) {
      return { value: null, isValid: false, error: 'Initial dry weight must be greater than 0' };
    }
    if (wet < dry) {
      return { value: null, isValid: false, error: 'Final wet weight cannot be less than initial dry weight' };
    }

    const value = ((wet - dry) / dry) * 100;
    return { value: Number(value.toFixed(1)), isValid: true };
  },

  /**
   * Water Retention Test
   * Formula: (retained / absorbed) * 100
   */
  calculateRetention(waterAbsorbed, waterRetained) {
    const absorbed = Number(waterAbsorbed);
    const retained = Number(waterRetained);

    if (isNaN(absorbed) || isNaN(retained) || absorbed <= 0) {
      return { value: null, isValid: false, error: 'Water absorbed must be greater than 0' };
    }
    if (retained < 0) {
      return { value: null, isValid: false, error: 'Water retained cannot be negative' };
    }
    if (retained > absorbed) {
      return { value: null, isValid: false, error: 'Water retained cannot exceed water absorbed' };
    }

    const value = (retained / absorbed) * 100;
    return { value: Number(value.toFixed(1)), isValid: true };
  },

  /**
   * Moisture Distribution Test
   * Calculates layer average and spread (max - min)
   */
  calculateMoistureDistribution(top, mid, bottom) {
    const t = Number(top);
    const m = Number(mid);
    const b = Number(bottom);

    if (isNaN(t) || isNaN(m) || isNaN(b) || t < 0 || m < 0 || b < 0) {
      return { average: null, spread: null, isValid: false, error: 'Layer moisture values must be non-negative' };
    }

    const average = (t + m + b) / 3;
    const spread = Math.max(t, m, b) - Math.min(t, m, b);

    return {
      average: Number(average.toFixed(1)),
      spread: Number(spread.toFixed(1)),
      isValid: true,
    };
  },

  /**
   * Structural Stability / Deformation Test
   * Formula: ((initial - final) / initial) * 100
   */
  calculateDeformation(initialThickness, finalThickness) {
    const init = Number(initialThickness);
    const fin = Number(finalThickness);

    if (isNaN(init) || isNaN(fin) || init <= 0) {
      return { value: null, isValid: false, error: 'Initial thickness must be greater than 0' };
    }
    if (fin < 0) {
      return { value: null, isValid: false, error: 'Final thickness cannot be negative' };
    }
    if (fin > init) {
      return { value: null, isValid: false, error: 'Final thickness after compression cannot exceed initial thickness' };
    }

    const value = ((init - fin) / init) * 100;
    return { value: Number(value.toFixed(1)), isValid: true };
  },

  /**
   * Drying Behaviour Test
   * Formula: ((initialWet - finalWeight) / initialWet) * 100
   */
  calculateDryingWeightLoss(initialWet, finalWeight) {
    const init = Number(initialWet);
    const fin = Number(finalWeight);

    if (isNaN(init) || isNaN(fin) || init <= 0) {
      return { value: null, isValid: false, error: 'Initial wet weight must be greater than 0' };
    }
    if (fin < 0) {
      return { value: null, isValid: false, error: 'Final weight cannot be negative' };
    }
    if (fin > init) {
      return { value: null, isValid: false, error: 'Weight after drying cannot exceed initial wet weight' };
    }

    const value = ((init - fin) / init) * 100;
    return { value: Number(value.toFixed(1)), isValid: true };
  },

  /**
   * Evaluates overall batch quality grade using experimental thresholds
   */
  evaluateBatchGrade(measurements) {
    if (!measurements) {
      return {
        grade: 'Insufficient Test Data',
        status: 'Insufficient Test Data',
        isComplete: false,
        summary: 'No measurement records found.',
        reasons: ['No test data recorded.'],
        criteriaVersion: QUALITY_CRITERIA_METADATA.version,
      };
    }

    const { absorption, retention, moistureDist, stability, drying } = measurements;

    // Check completeness of calculations
    const missing = [];
    if (!absorption || absorption.value === null || !absorption.isValid) missing.push('Water Absorption');
    if (!retention || retention.value === null || !retention.isValid) missing.push('Water Retention');
    if (!moistureDist || moistureDist.spread === null || !moistureDist.isValid) missing.push('Moisture Distribution');
    if (!stability || stability.value === null || !stability.isValid) missing.push('Structural Stability');
    if (!drying || drying.value === null || !drying.isValid) missing.push('Drying Behaviour');

    if (missing.length > 0) {
      return {
        grade: 'Insufficient Test Data',
        status: 'Insufficient Test Data',
        isComplete: false,
        summary: `Missing or invalid test suites: ${missing.join(', ')}.`,
        reasons: missing.map((m) => `${m} measurement is incomplete.`),
        criteriaVersion: QUALITY_CRITERIA_METADATA.version,
      };
    }

    const absVal = absorption.value;
    const retVal = retention.value;
    const spreadVal = moistureDist.spread;
    const deformVal = stability.value;

    const t = TEST_CRITERIA_THRESHOLDS;

    // 1. Critical Failure Check
    const criticalFailures = [];
    if (absVal < t.absorption.criticalMin) {
      criticalFailures.push(`Absorption ${absVal}% is below critical threshold (${t.absorption.criticalMin}%).`);
    }
    if (retVal < t.retention.criticalMin) {
      criticalFailures.push(`Retention ${retVal}% is below critical threshold (${t.retention.criticalMin}%).`);
    }
    if (spreadVal > t.distributionSpread.criticalMaxDiff) {
      criticalFailures.push(`Moisture layer spread ${spreadVal}% exceeds critical limit (${t.distributionSpread.criticalMaxDiff}%).`);
    }
    if (deformVal > t.deformation.criticalMaxDeform) {
      criticalFailures.push(`Deformation ${deformVal}% exceeds structural tolerance (${t.deformation.criticalMaxDeform}%).`);
    }

    if (criticalFailures.length >= 2) {
      return {
        grade: 'Failed',
        status: 'Failed',
        isComplete: true,
        summary: 'Multiple critical quality thresholds failed.',
        reasons: criticalFailures,
        criteriaVersion: QUALITY_CRITERIA_METADATA.version,
      };
    }

    if (criticalFailures.length === 1) {
      return {
        grade: 'Grade C',
        status: 'Low Quality',
        isComplete: true,
        summary: 'One critical minimum requirement failed. Usable only with severe agricultural limitations.',
        reasons: criticalFailures,
        criteriaVersion: QUALITY_CRITERIA_METADATA.version,
      };
    }

    // 2. Check Premium (Grade A) conditions
    const premiumChecks = [
      { name: 'Absorption', passed: absVal >= t.absorption.premiumMin, req: `>= ${t.absorption.premiumMin}%`, actual: `${absVal}%` },
      { name: 'Retention', passed: retVal >= t.retention.premiumMin, req: `>= ${t.retention.premiumMin}%`, actual: `${retVal}%` },
      { name: 'Moisture Spread', passed: spreadVal <= t.distributionSpread.premiumMaxDiff, req: `<= ${t.distributionSpread.premiumMaxDiff}%`, actual: `${spreadVal}%` },
      { name: 'Deformation', passed: deformVal <= t.deformation.premiumMaxDeform, req: `<= ${t.deformation.premiumMaxDeform}%`, actual: `${deformVal}%` },
    ];

    const failedPremium = premiumChecks.filter((p) => !p.passed);

    if (failedPremium.length === 0) {
      return {
        grade: 'Grade A',
        status: 'Premium Quality',
        isComplete: true,
        summary: 'Meets all critical minimum and premium physical targets.',
        reasons: ['All parameters satisfied premium performance criteria.'],
        criteriaVersion: QUALITY_CRITERIA_METADATA.version,
      };
    }

    // 3. Otherwise Grade B (Standard Acceptable)
    return {
      grade: 'Grade B',
      status: 'Acceptable Quality',
      isComplete: true,
      summary: `Meets all critical standards, but missed ${failedPremium.length} premium criteria.`,
      reasons: failedPremium.map((f) => `${f.name}: actual ${f.actual} did not reach premium ${f.req}.`),
      criteriaVersion: QUALITY_CRITERIA_METADATA.version,
    };
  },

  /**
   * Crop-Specific Suitability Assessment
   */
  evaluateCropSuitability(measurements, calculatedGrade) {
    if (!measurements || calculatedGrade === 'Insufficient Test Data') {
      return [
        {
          profileId: 'nursery',
          name: 'Nursery & Seed Germination',
          status: 'Insufficient Data',
          notes: 'Complete test suite required before nursery evaluation.',
          supportingResults: [],
          limitingFactors: ['Full physical lab measurements required.'],
        },
        {
          profileId: 'leafy',
          name: 'Leafy Vegetables',
          status: 'Insufficient Data',
          notes: 'Complete test suite required before leafy greens evaluation.',
          supportingResults: [],
          limitingFactors: ['Full physical lab measurements required.'],
        },
        {
          profileId: 'fruiting',
          name: 'Fruiting Vegetables',
          status: 'Insufficient Data',
          notes: 'Complete test suite required before fruiting crops evaluation.',
          supportingResults: [],
          limitingFactors: ['Full physical lab measurements required.'],
        },
      ];
    }

    const { absorption, retention, moistureDist, stability } = measurements;
    const absVal = absorption?.value || 0;
    const retVal = retention?.value || 0;
    const spreadVal = moistureDist?.spread || 0;
    const deformVal = stability?.value || 0;

    return [
      {
        profileId: 'nursery',
        name: 'Nursery & Seed Germination',
        status: spreadVal <= 14 && retVal >= 72 ? 'Suitable' : spreadVal <= 22 ? 'Conditionally Suitable' : 'Not Suitable',
        notes: spreadVal <= 14 ? 'Uniform moisture distribution supports delicate seedling rootlets.' : 'Layer moisture spread may cause dry pockets in shallow plugs.',
        supportingResults: [`Moisture spread: ${spreadVal}%`, `Retention: ${retVal}%`],
        limitingFactors: spreadVal > 14 ? ['Higher layer variation than ideal for fine nurseries'] : [],
      },
      {
        profileId: 'leafy',
        name: 'Leafy Vegetables',
        status: retVal >= 75 && absVal >= 380 ? 'Suitable' : retVal >= 68 ? 'Conditionally Suitable' : 'Not Suitable',
        notes: retVal >= 75 ? 'Superior water retention ensures stable root-zone turgor pressure.' : 'Moderate water retention requires tighter irrigation cycles.',
        supportingResults: [`Retention: ${retVal}%`, `Absorption: ${absVal}%`],
        limitingFactors: retVal < 75 ? ['Requires increased irrigation frequency for high-transpiration greens'] : [],
      },
      {
        profileId: 'fruiting',
        name: 'Fruiting Vegetables',
        status: deformVal <= 12 && absVal >= 370 ? 'Suitable' : deformVal <= 20 ? 'Conditionally Suitable' : 'Not Suitable',
        notes: deformVal <= 12 ? 'High compressive strength supports heavy top-growth and root anchors.' : 'Compressive deformation higher than recommended for 5-month vine crops.',
        supportingResults: [`Deformation: ${deformVal}% under load`, `Structural absorption: ${absVal}%`],
        limitingFactors: deformVal > 12 ? ['Higher compaction under heavy crop weight'] : [],
      },
    ];
  },
};
