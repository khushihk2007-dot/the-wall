import { criteriaService } from './criteriaService';
import { DEFAULT_QUALITY_CRITERIA, CROP_PROFILES } from '../constants/qualityCriteria';

/**
 * Quality Grading Engine - Pure JavaScript (Deterministic & Explainable)
 * Strictly evaluates laboratory measurements against active validated thresholds.
 */
export const gradingService = {
  /**
   * 1. Water Absorption Test
   * Formula: ((Wet Weight - Dry Weight) / Dry Weight) * 100 (%)
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
   * 2. Water Retention Test
   * Formula: (Retained Water / Absorbed Water) * 100 (%)
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
   * 3. Moisture Distribution Test
   * Formula: ((Highest - Lowest Moisture) / Average Moisture) * 100 (% variation)
   */
  calculateMoistureDistribution(top, mid, bottom) {
    const t = Number(top);
    const m = Number(mid);
    const b = Number(bottom);

    if (isNaN(t) || isNaN(m) || isNaN(b) || t < 0 || m < 0 || b < 0) {
      return { average: null, spread: null, variationPct: null, value: null, isValid: false, error: 'Layer moisture values must be non-negative' };
    }

    const average = (t + m + b) / 3;
    const spread = Math.max(t, m, b) - Math.min(t, m, b);
    const variationPct = average > 0 ? (spread / average) * 100 : 0;

    return {
      average: Number(average.toFixed(1)),
      spread: Number(spread.toFixed(1)),
      variationPct: Number(variationPct.toFixed(1)),
      value: Number(variationPct.toFixed(1)),
      isValid: true,
    };
  },

  /**
   * 4. Structural Stability Test
   * Formula: ((Initial Thickness - Final Thickness) / Initial Thickness) * 100 (% deformation under load)
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
   * 5. Drying Behaviour Test
   * Formula: ((Initial Wet Weight - Final Weight) / Initial Wet Weight) * 100 (% weight loss over target drying duration)
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
   * Evaluates a single test result against criteria thresholds
   */
  evaluateSingleTest(testKey, value, criteriaTestConfig) {
    if (value === null || value === undefined || isNaN(value)) {
      return {
        testKey,
        value: null,
        grade: 'Insufficient Data',
        isCriticalFail: false,
        reason: 'Measurement missing',
      };
    }

    const numVal = Number(value);
    const cfg = criteriaTestConfig;

    if (!cfg) {
      return {
        testKey,
        value: numVal,
        grade: 'Criteria Not Configured',
        isCriticalFail: false,
        reason: 'No criteria threshold available',
      };
    }

    // 1. Water Absorption (higher is better)
    if (testKey === 'absorption') {
      if (numVal < cfg.criticalMin) {
        return {
          testKey,
          value: numVal,
          unit: cfg.unit || '%',
          grade: 'Failed',
          isCriticalFail: true,
          reason: `Absorption ${numVal}% is below critical threshold (${cfg.criticalMin}%). Matrix lacks capillary porosity.`,
        };
      }
      if (numVal >= cfg.gradeA) {
        return { testKey, value: numVal, unit: cfg.unit, grade: 'Grade A', isCriticalFail: false, reason: `Absorption ${numVal}% meets Grade A (≥ ${cfg.gradeA}%).` };
      }
      if (numVal >= cfg.gradeB) {
        return { testKey, value: numVal, unit: cfg.unit, grade: 'Grade B', isCriticalFail: false, reason: `Absorption ${numVal}% meets Grade B (≥ ${cfg.gradeB}%).` };
      }
      if (numVal >= cfg.gradeC) {
        return { testKey, value: numVal, unit: cfg.unit, grade: 'Grade C', isCriticalFail: false, reason: `Absorption ${numVal}% meets Grade C (≥ ${cfg.gradeC}%).` };
      }
      return { testKey, value: numVal, unit: cfg.unit, grade: 'Failed', isCriticalFail: true, reason: `Absorption ${numVal}% failed minimum criteria.` };
    }

    // 2. Water Retention (higher is better)
    if (testKey === 'retention') {
      if (numVal < cfg.criticalMin) {
        return {
          testKey,
          value: numVal,
          unit: cfg.unit || '%',
          grade: 'Failed',
          isCriticalFail: true,
          reason: `Water retention ${numVal}% is below critical threshold (${cfg.criticalMin}%). Excessive drainage loss.`,
        };
      }
      if (numVal >= cfg.gradeA) {
        return { testKey, value: numVal, unit: cfg.unit, grade: 'Grade A', isCriticalFail: false, reason: `Retention ${numVal}% meets Grade A (≥ ${cfg.gradeA}%).` };
      }
      if (numVal >= cfg.gradeB) {
        return { testKey, value: numVal, unit: cfg.unit, grade: 'Grade B', isCriticalFail: false, reason: `Retention ${numVal}% meets Grade B (≥ ${cfg.gradeB}%).` };
      }
      if (numVal >= cfg.gradeC) {
        return { testKey, value: numVal, unit: cfg.unit, grade: 'Grade C', isCriticalFail: false, reason: `Retention ${numVal}% meets Grade C (≥ ${cfg.gradeC}%).` };
      }
      return { testKey, value: numVal, unit: cfg.unit, grade: 'Failed', isCriticalFail: true, reason: `Retention ${numVal}% failed minimum criteria.` };
    }

    // 3. Moisture Distribution (lower variation is better)
    if (testKey === 'moistureDist') {
      if (numVal > cfg.criticalMax) {
        return {
          testKey,
          value: numVal,
          unit: cfg.unit || '% variation',
          grade: 'Failed',
          isCriticalFail: true,
          reason: `Moisture variation ${numVal}% exceeds critical limit (${cfg.criticalMax}%). Severe moisture stratification.`,
        };
      }
      if (numVal <= cfg.gradeA) {
        return { testKey, value: numVal, unit: cfg.unit, grade: 'Grade A', isCriticalFail: false, reason: `Moisture variation ${numVal}% meets Grade A (≤ ${cfg.gradeA}%).` };
      }
      if (numVal <= cfg.gradeB) {
        return { testKey, value: numVal, unit: cfg.unit, grade: 'Grade B', isCriticalFail: false, reason: `Moisture variation ${numVal}% meets Grade B (≤ ${cfg.gradeB}%).` };
      }
      if (numVal <= cfg.gradeC) {
        return { testKey, value: numVal, unit: cfg.unit, grade: 'Grade C', isCriticalFail: false, reason: `Moisture variation ${numVal}% meets Grade C (≤ ${cfg.gradeC}%).` };
      }
      return { testKey, value: numVal, unit: cfg.unit, grade: 'Failed', isCriticalFail: true, reason: `Moisture variation ${numVal}% failed maximum limit.` };
    }

    // 4. Structural Stability (lower deformation is better)
    if (testKey === 'stability') {
      if (numVal > cfg.criticalMax) {
        return {
          testKey,
          value: numVal,
          unit: cfg.unit || '% deformation',
          grade: 'Failed',
          isCriticalFail: true,
          reason: `Deformation ${numVal}% exceeds critical tolerance (${cfg.criticalMax}%). Substrate structural collapse risk.`,
        };
      }
      if (numVal <= cfg.gradeA) {
        return { testKey, value: numVal, unit: cfg.unit, grade: 'Grade A', isCriticalFail: false, reason: `Deformation ${numVal}% meets Grade A (≤ ${cfg.gradeA}%).` };
      }
      if (numVal <= cfg.gradeB) {
        return { testKey, value: numVal, unit: cfg.unit, grade: 'Grade B', isCriticalFail: false, reason: `Deformation ${numVal}% meets Grade B (≤ ${cfg.gradeB}%).` };
      }
      if (numVal <= cfg.gradeC) {
        return { testKey, value: numVal, unit: cfg.unit, grade: 'Grade C', isCriticalFail: false, reason: `Deformation ${numVal}% meets Grade C (≤ ${cfg.gradeC}%).` };
      }
      return { testKey, value: numVal, unit: cfg.unit, grade: 'Failed', isCriticalFail: true, reason: `Deformation ${numVal}% failed tolerance.` };
    }

    // 5. Drying Behaviour (within acceptable range)
    if (testKey === 'drying') {
      if (numVal < cfg.criticalMin) {
        return {
          testKey,
          value: numVal,
          unit: cfg.unit || '% weight loss',
          grade: 'Failed',
          isCriticalFail: true,
          reason: `Drying weight loss ${numVal}% is below critical minimum (${cfg.criticalMin}%). Stagnant waterlogging risk.`,
        };
      }
      if (numVal > cfg.criticalMax) {
        return {
          testKey,
          value: numVal,
          unit: cfg.unit || '% weight loss',
          grade: 'Failed',
          isCriticalFail: true,
          reason: `Drying weight loss ${numVal}% exceeds critical maximum (${cfg.criticalMax}%). Rapid root desiccation risk.`,
        };
      }
      if (numVal >= cfg.gradeA.min && numVal <= cfg.gradeA.max) {
        return { testKey, value: numVal, unit: cfg.unit, grade: 'Grade A', isCriticalFail: false, reason: `Drying loss ${numVal}% within Grade A target (${cfg.gradeA.min}% - ${cfg.gradeA.max}%).` };
      }
      if (numVal >= cfg.gradeB.min && numVal <= cfg.gradeB.max) {
        return { testKey, value: numVal, unit: cfg.unit, grade: 'Grade B', isCriticalFail: false, reason: `Drying loss ${numVal}% within Grade B target (${cfg.gradeB.min}% - ${cfg.gradeB.max}%).` };
      }
      if (numVal >= cfg.gradeC.min && numVal <= cfg.gradeC.max) {
        return { testKey, value: numVal, unit: cfg.unit, grade: 'Grade C', isCriticalFail: false, reason: `Drying loss ${numVal}% within Grade C target (${cfg.gradeC.min}% - ${cfg.gradeC.max}%).` };
      }
      return { testKey, value: numVal, unit: cfg.unit, grade: 'Failed', isCriticalFail: true, reason: `Drying loss ${numVal}% outside acceptable drying targets.` };
    }

    return { testKey, value: numVal, grade: 'Grade B', isCriticalFail: false, reason: 'Evaluated' };
  },

  /**
   * Automatic Grading Evaluation for an Individual Bed
   * Strict adherence to requirements:
   * - A – Premium: All 5 tests meet Grade A criteria.
   * - B – Good: All 5 meet at least Grade B criteria, but not all meet Grade A.
   * - C – Basic: At least 1 test falls below Grade B but meets Grade C usability criteria, with no critical failure.
   * - Failed: A critical structural, safety, or usability condition is violated.
   * - Insufficient Test Data: Missing measurements.
   * - Criteria Not Configured / Awaiting Experimental Validation: If active criteria is not validated.
   */
  evaluateBedGrade(measurements, criteriaVersion) {
    const criteria = criteriaService.getCriteriaByVersion(criteriaVersion);

    // 1. Check if criteria is validated
    if (!criteria || !criteria.isValidated || criteria.validationStatus !== 'Validated') {
      return {
        grade: 'Criteria Not Configured',
        status: 'Awaiting Experimental Validation',
        isComplete: false,
        summary: 'Active grading criteria is awaiting experimental laboratory validation.',
        reasons: ['Testing criteria has not been validated by authorized agricultural standards committee.'],
        criteriaVersion: criteria?.version || 'UNVALIDATED',
        testResults: {},
      };
    }

    // 2. Check if measurements are present
    if (!measurements) {
      return {
        grade: 'Insufficient Test Data',
        status: 'Insufficient Test Data',
        isComplete: false,
        summary: 'No measurement records found for this growing bed.',
        reasons: ['No physical test data recorded.'],
        criteriaVersion: criteria.version,
        testResults: {},
      };
    }

    const { absorption, retention, moistureDist, stability, drying } = measurements;

    // Check completeness of calculations for all 5 tests
    const missing = [];
    if (!absorption || absorption.value === null || !absorption.isValid) missing.push('Water Absorption');
    if (!retention || retention.value === null || !retention.isValid) missing.push('Water Retention');
    if (!moistureDist || (moistureDist.value === null && moistureDist.variationPct === null) || !moistureDist.isValid) missing.push('Moisture Distribution');
    if (!stability || stability.value === null || !stability.isValid) missing.push('Structural Stability');
    if (!drying || drying.value === null || !drying.isValid) missing.push('Drying Behaviour');

    if (missing.length > 0) {
      return {
        grade: 'Insufficient Test Data',
        status: 'Insufficient Test Data',
        isComplete: false,
        summary: `Missing laboratory test measurements: ${missing.join(', ')}.`,
        reasons: missing.map((m) => `${m} measurement is incomplete.`),
        criteriaVersion: criteria.version,
        testResults: {},
      };
    }

    // 3. Evaluate each of the 5 tests against criteria
    const cTests = criteria.tests;

    const absResult = this.evaluateSingleTest('absorption', absorption.value, cTests.absorption);
    const retResult = this.evaluateSingleTest('retention', retention.value, cTests.retention);
    const moistVal = moistureDist.value !== null ? moistureDist.value : moistureDist.variationPct;
    const moistResult = this.evaluateSingleTest('moistureDist', moistVal, cTests.moistureDist);
    const stabResult = this.evaluateSingleTest('stability', stability.value, cTests.stability);
    const dryResult = this.evaluateSingleTest('drying', drying.value, cTests.drying);

    const testResults = {
      absorption: absResult,
      retention: retResult,
      moistureDist: moistResult,
      stability: stabResult,
      drying: dryResult,
    };

    const resultsList = [absResult, retResult, moistResult, stabResult, dryResult];

    // Check critical failures
    const criticalFailures = resultsList.filter((r) => r.isCriticalFail || r.grade === 'Failed');
    if (criticalFailures.length > 0) {
      return {
        grade: 'Failed',
        status: 'Failed',
        isComplete: true,
        summary: 'Critical structural, safety or usability condition violated. Batch cannot be released.',
        reasons: criticalFailures.map((cf) => cf.reason),
        criteriaVersion: criteria.version,
        testResults,
      };
    }

    // Check Grade A (All 5 must be Grade A)
    const isAllGradeA = resultsList.every((r) => r.grade === 'Grade A');
    if (isAllGradeA) {
      return {
        grade: 'Grade A',
        status: 'Premium',
        isComplete: true,
        summary: 'All five standardized tests meet Grade A premium criteria.',
        reasons: resultsList.map((r) => r.reason),
        criteriaVersion: criteria.version,
        testResults,
      };
    }

    // Check Grade B (All 5 must be at least Grade B: Grade A or Grade B)
    const isAllAtLeastGradeB = resultsList.every((r) => r.grade === 'Grade A' || r.grade === 'Grade B');
    if (isAllAtLeastGradeB) {
      return {
        grade: 'Grade B',
        status: 'Good',
        isComplete: true,
        summary: 'All five tests meet at least Grade B standard criteria.',
        reasons: resultsList.map((r) => r.reason),
        criteriaVersion: criteria.version,
        testResults,
      };
    }

    // Check Grade C (At least one falls to Grade C, but no critical failure)
    const isGradeC = resultsList.some((r) => r.grade === 'Grade C');
    if (isGradeC) {
      return {
        grade: 'Grade C',
        status: 'Basic',
        isComplete: true,
        summary: 'At least one test falls to Grade C usability criteria with no critical failure.',
        reasons: resultsList.map((r) => r.reason),
        criteriaVersion: criteria.version,
        testResults,
      };
    }

    return {
      grade: 'Grade B',
      status: 'Good',
      isComplete: true,
      summary: 'Physical performance satisfies standard operational criteria.',
      reasons: resultsList.map((r) => r.reason),
      criteriaVersion: criteria.version,
      testResults,
    };
  },

  /**
   * Alias for backwards compatibility with batch-level caller
   */
  evaluateBatchGrade(measurements, criteriaVersion) {
    return this.evaluateBedGrade(measurements, criteriaVersion);
  },

  /**
   * Crop-Specific Suitability Assessment
   */
  evaluateCropSuitability(measurements, calculatedGrade) {
    if (!measurements || calculatedGrade === 'Insufficient Test Data' || calculatedGrade === 'Criteria Not Configured') {
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
    const moistVal = moistureDist?.value || moistureDist?.variationPct || moistureDist?.spread || 0;
    const deformVal = stability?.value || 0;

    return [
      {
        profileId: 'nursery',
        name: 'Nursery & Seed Germination',
        status: moistVal <= 18 && retVal >= 72 ? 'Suitable' : moistVal <= 28 ? 'Conditionally Suitable' : 'Not Suitable',
        notes: moistVal <= 18 ? 'Uniform moisture distribution supports delicate seedling rootlets.' : 'Moisture variation may cause dry pockets in shallow plugs.',
        supportingResults: [`Moisture variation: ${moistVal}%`, `Retention: ${retVal}%`],
        limitingFactors: moistVal > 18 ? ['Higher layer variation than ideal for fine nurseries'] : [],
      },
      {
        profileId: 'leafy',
        name: 'Leafy Vegetables',
        status: retVal >= 75 && absVal >= 350 ? 'Suitable' : retVal >= 68 ? 'Conditionally Suitable' : 'Not Suitable',
        notes: retVal >= 75 ? 'Superior water retention ensures stable root-zone turgor pressure.' : 'Moderate water retention requires tighter irrigation cycles.',
        supportingResults: [`Retention: ${retVal}%`, `Absorption: ${absVal}%`],
        limitingFactors: retVal < 75 ? ['Requires increased irrigation frequency for high-transpiration greens'] : [],
      },
      {
        profileId: 'fruiting',
        name: 'Fruiting Vegetables',
        status: deformVal <= 12 && absVal >= 350 ? 'Suitable' : deformVal <= 20 ? 'Conditionally Suitable' : 'Not Suitable',
        notes: deformVal <= 12 ? 'High compressive strength supports heavy top-growth and root anchors.' : 'Compressive deformation higher than recommended for 5-month vine crops.',
        supportingResults: [`Deformation: ${deformVal}% under load`, `Structural absorption: ${absVal}%`],
        limitingFactors: deformVal > 12 ? ['Higher compaction under heavy crop weight'] : [],
      },
    ];
  },
};
