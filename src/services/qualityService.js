import { INITIAL_QC_TESTS } from '../constants/mockQualityData';
import { manufacturingService } from './manufacturingService';
import { gradingService } from './gradingService';
import { criteriaService } from './criteriaService';

const STORAGE_KEY = 'thewall_qc_records_v2';

export const qualityService = {
  getTests() {
    try {
      // Clean up legacy v1 key if present
      localStorage.removeItem('thewall_qc_records_v1');

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Keep at most 4 beds
          return parsed.slice(0, 4);
        }
      }
    } catch {
      // fallback to initial
    }
    return INITIAL_QC_TESTS;
  },

  saveTests(tests) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
    } catch (e) {
      console.warn('Failed to save QC records to localStorage:', e);
    }
  },

  resetToDefault() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    return INITIAL_QC_TESTS;
  },

  /**
   * Returns list of available manufacturing batches and their current tested beds
   */
  getAvailableBatches(batchesOverride) {
    const batches = batchesOverride || manufacturingService.getCachedBatches();
    const tests = this.getTests();

    // Map which batches have active or completed tests
    const batchMap = new Map();
    tests.forEach((t) => {
      if (!batchMap.has(t.batchId)) {
        batchMap.set(t.batchId, []);
      }
      batchMap.get(t.batchId).push(t);
    });

    return batches.map((b) => {
      const batchTests = batchMap.get(b.id) || [];
      const hasActive = batchTests.some(
        (t) => t.status === 'Pending' || t.status === 'In Progress' || t.status === 'Awaiting Review'
      );
      return {
        ...b,
        hasActiveQc: hasActive,
        testedBedsCount: batchTests.length,
        testedBeds: batchTests.map((t) => t.bedId || 'Sample Bed'),
      };
    });
  },

  /**
   * Creates an independent test record for an individual bed from a batch.
   * Multiple beds from the same batch can be tested independently.
   */
  createTest({ batchId, bedId, sampleQuantity, testDate, reviewer, notes }) {
    const batches = manufacturingService.getCachedBatches();
    const batch = batches.find((b) => b.id === batchId);

    if (!batch) {
      throw new Error(`Manufacturing batch ${batchId} does not exist.`);
    }

    const tests = this.getTests();
    const existingForBatch = tests.filter((t) => t.batchId === batchId);
    
    // Auto-generate bedId if not provided (e.g. BED-01, BED-02, etc.)
    const assignedBedId = bedId && bedId.trim()
      ? bedId.trim()
      : `BED-${String(existingForBatch.length + 1).padStart(2, '0')}`;

    // Verify this specific bedId doesn't already exist for this batch
    const duplicateBed = existingForBatch.find((t) => t.bedId?.toUpperCase() === assignedBedId.toUpperCase());
    if (duplicateBed) {
      throw new Error(`Bed ${assignedBedId} for batch ${batchId} already has a test record (${duplicateBed.id}). Each bed must have a distinct Sample ID.`);
    }

    const activeCriteria = criteriaService.getActiveCriteria();
    const nextNum = tests.length + 1;
    const testId = `QC-2026-${String(nextNum).padStart(3, '0')}`;
    const dateStr = testDate || new Date().toISOString().split('T')[0];

    const newTest = {
      id: testId,
      batchId,
      bedId: assignedBedId,
      testDate: dateStr,
      sampleQuantity: Number(sampleQuantity) || 1,
      status: 'Pending',
      grade: 'Insufficient Test Data',
      reviewer: reviewer || 'Unassigned',
      reviewerNotes: notes || `Requisition logged for Bed ${assignedBedId} from Batch ${batchId}.`,
      criteriaVersion: activeCriteria.version,
      evaluationDate: null,
      measurements: null,
      testResults: {},
      cropSuitability: gradingService.evaluateCropSuitability(null, 'Insufficient Test Data'),
      history: [
        {
          previousStatus: 'None',
          newStatus: 'Pending',
          timestamp: new Date().toLocaleString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
          user: reviewer || 'QC Tech',
          note: `Independent test requisition initialized for Bed ${assignedBedId} (Batch: ${batchId}). Criteria: ${activeCriteria.version}.`,
        },
      ],
    };

    const updated = [newTest, ...tests];
    this.saveTests(updated);
    return { test: newTest, all: updated };
  },

  /**
   * Updates laboratory physical measurements for an individual bed and calculates grades.
   */
  updateMeasurements(testId, rawData, reviewerNotes) {
    const tests = this.getTests();
    const index = tests.findIndex((t) => t.id === testId);

    if (index === -1) {
      throw new Error(`QC record ${testId} not found.`);
    }

    const test = tests[index];
    if (test.status === 'Approved') {
      throw new Error('Approved QC records are permanently certified and cannot be edited.');
    }

    // 1. Water Absorption calculation
    const absorptionCalc = gradingService.calculateAbsorption(
      rawData.dryWeight,
      rawData.wetWeight
    );

    // 2. Water Retention calculation
    const retentionCalc = gradingService.calculateRetention(
      rawData.waterAbsorbed,
      rawData.waterRetained
    );

    // 3. Moisture Distribution calculation (variation %)
    const moistureCalc = gradingService.calculateMoistureDistribution(
      rawData.topLayerMoisture,
      rawData.midLayerMoisture,
      rawData.bottomLayerMoisture
    );

    // 4. Structural Stability calculation (% deformation under load)
    const stabilityCalc = gradingService.calculateDeformation(
      rawData.initialThickness,
      rawData.finalThickness
    );

    // 5. Drying Behaviour calculation (% weight loss over target duration)
    const dryingCalc = gradingService.calculateDryingWeightLoss(
      rawData.dryingInitialWet,
      rawData.dryingFinalWeight
    );

    const computedMeasurements = {
      absorption: {
        dryWeight: Number(rawData.dryWeight) || 0,
        wetWeight: Number(rawData.wetWeight) || 0,
        value: absorptionCalc.value,
        isValid: absorptionCalc.isValid,
        error: absorptionCalc.error,
      },
      retention: {
        waterAbsorbed: Number(rawData.waterAbsorbed) || 0,
        waterRetained: Number(rawData.waterRetained) || 0,
        durationMinutes: Number(rawData.drainageDuration) || 30,
        value: retentionCalc.value,
        isValid: retentionCalc.isValid,
        error: retentionCalc.error,
      },
      moistureDist: {
        topLayer: Number(rawData.topLayerMoisture) || 0,
        middleLayer: Number(rawData.midLayerMoisture) || 0,
        bottomLayer: Number(rawData.bottomLayerMoisture) || 0,
        average: moistureCalc.average,
        spread: moistureCalc.spread,
        variationPct: moistureCalc.variationPct,
        value: moistureCalc.value,
        isValid: moistureCalc.isValid,
        error: moistureCalc.error,
      },
      stability: {
        initialThickness: Number(rawData.initialThickness) || 0,
        finalThickness: Number(rawData.finalThickness) || 0,
        compressionForceN: Number(rawData.compressionForce) || 450,
        durationHours: Number(rawData.loadDurationHours) || 24,
        observations: rawData.structuralObservations || '',
        value: stabilityCalc.value,
        isValid: stabilityCalc.isValid,
        error: stabilityCalc.error,
      },
      drying: {
        initialWetWeight: Number(rawData.dryingInitialWet) || 0,
        finalWeight: Number(rawData.dryingFinalWeight) || 0,
        durationHours: Number(rawData.dryingDuration) || 24,
        temperatureC: Number(rawData.dryingTemp) || 32,
        observations: rawData.dryingObservations || '',
        value: dryingCalc.value,
        isValid: dryingCalc.isValid,
        error: dryingCalc.error,
      },
    };

    // Evaluate grade using the criteria version preserved on the test (or fallback to active)
    const evaluation = gradingService.evaluateBedGrade(
      computedMeasurements,
      test.criteriaVersion
    );

    const suitability = gradingService.evaluateCropSuitability(
      computedMeasurements,
      evaluation.grade
    );

    // Auto-advance status to In Progress if currently Pending
    let nextStatus = test.status;
    if (test.status === 'Pending') {
      nextStatus = 'In Progress';
    }

    const updatedTest = {
      ...test,
      status: nextStatus,
      grade: evaluation.grade,
      evaluationSummary: evaluation.summary,
      evaluationReasons: evaluation.reasons,
      evaluationDate: new Date().toLocaleString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      measurements: computedMeasurements,
      testResults: evaluation.testResults || {},
      cropSuitability: suitability,
      reviewerNotes: reviewerNotes !== undefined ? reviewerNotes : test.reviewerNotes,
    };

    tests[index] = updatedTest;
    this.saveTests(tests);
    return { test: updatedTest, all: tests };
  },

  transitionStatus(testId, newStatus, user, note) {
    const tests = this.getTests();
    const index = tests.findIndex((t) => t.id === testId);

    if (index === -1) {
      throw new Error(`QC record ${testId} not found.`);
    }

    const test = tests[index];

    // Validation: Cannot approve incomplete or failed test
    if (newStatus === 'Approved') {
      if (test.grade === 'Insufficient Test Data' || !test.measurements) {
        throw new Error('Cannot approve a test with "Insufficient Test Data". Complete all 5 physical suites first.');
      }
      if (test.grade === 'Failed') {
        throw new Error('Cannot approve a test that evaluated to "Failed". Reject the lot or re-test an independent sample bed.');
      }
      if (test.grade === 'Criteria Not Configured') {
        throw new Error('Cannot approve a test when grading criteria is unvalidated or awaiting experimental calibration.');
      }
    }

    const historyEntry = {
      previousStatus: test.status,
      newStatus,
      timestamp: new Date().toLocaleString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      user: user || 'QC Reviewer',
      note: note || `Status transitioned to ${newStatus}.`,
    };

    const updatedTest = {
      ...test,
      status: newStatus,
      reviewer: user || test.reviewer,
      history: [...(test.history || []), historyEntry],
    };

    tests[index] = updatedTest;
    this.saveTests(tests);
    return { test: updatedTest, all: tests };
  },
};
