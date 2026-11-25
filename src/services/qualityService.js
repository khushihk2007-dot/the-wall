import { INITIAL_QC_TESTS } from '../constants/mockQualityData';
import { manufacturingService } from './manufacturingService';
import { gradingService } from './gradingService';
import { QUALITY_CRITERIA_METADATA } from '../constants/qualityCriteria';

const STORAGE_KEY = 'thewall_qc_records_v1';

export const qualityService = {
  getTests() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
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

  getAvailableBatches(batchesOverride) {
    const batches = batchesOverride || manufacturingService.getCachedBatches();
    const tests = this.getTests();

    // Map which batches currently have active (non-finalized) QC tests
    const activeTestBatchIds = new Set(
      tests
        .filter((t) => t.status === 'Pending' || t.status === 'In Progress' || t.status === 'Awaiting Review')
        .map((t) => t.batchId)
    );

    return batches.map((b) => ({
      ...b,
      hasActiveQc: activeTestBatchIds.has(b.id),
    }));
  },

  createTest({ batchId, sampleQuantity, testDate, reviewer, notes }) {
    const batches = manufacturingService.getCachedBatches();
    const batch = batches.find((b) => b.id === batchId);

    if (!batch) {
      throw new Error(`Manufacturing batch ${batchId} does not exist.`);
    }

    const tests = this.getTests();
    const hasActive = tests.some(
      (t) => t.batchId === batchId && (t.status === 'Pending' || t.status === 'In Progress' || t.status === 'Awaiting Review')
    );

    if (hasActive) {
      throw new Error(`Batch ${batchId} already has an active QC test in progress.`);
    }

    const nextNum = tests.length + 1;
    const testId = `QC-2026-${String(nextNum).padStart(3, '0')}`;
    const dateStr = testDate || new Date().toISOString().split('T')[0];

    const newTest = {
      id: testId,
      batchId,
      testDate: dateStr,
      sampleQuantity: Number(sampleQuantity) || 3,
      status: 'Pending',
      grade: 'Insufficient Test Data',
      reviewer: reviewer || 'Unassigned',
      reviewerNotes: notes || 'New laboratory QC requisition logged.',
      criteriaVersion: QUALITY_CRITERIA_METADATA.version,
      evaluationDate: null,
      measurements: null,
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
          note: `Requisition created for ${sampleQuantity || 3} sample beds from ${batchId}.`,
        },
      ],
    };

    const updated = [newTest, ...tests];
    this.saveTests(updated);
    return { test: newTest, all: updated };
  },

  updateMeasurements(testId, rawData, reviewerNotes) {
    const tests = this.getTests();
    const index = tests.findIndex((t) => t.id === testId);

    if (index === -1) {
      throw new Error(`QC record ${testId} not found.`);
    }

    const test = tests[index];
    if (test.status === 'Approved') {
      throw new Error('Approved QC records are locked and cannot be edited.');
    }

    // Calculate all 5 suites
    const absorptionCalc = gradingService.calculateAbsorption(
      rawData.dryWeight,
      rawData.wetWeight
    );

    const retentionCalc = gradingService.calculateRetention(
      rawData.waterAbsorbed,
      rawData.waterRetained
    );

    const moistureCalc = gradingService.calculateMoistureDistribution(
      rawData.topLayerMoisture,
      rawData.midLayerMoisture,
      rawData.bottomLayerMoisture
    );

    const stabilityCalc = gradingService.calculateDeformation(
      rawData.initialThickness,
      rawData.finalThickness
    );

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
        isValid: moistureCalc.isValid,
        error: moistureCalc.error,
      },
      stability: {
        initialThickness: Number(rawData.initialThickness) || 0,
        finalThickness: Number(rawData.finalThickness) || 0,
        compressionForceN: Number(rawData.compressionForce) || 450,
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

    // Evaluate grade and suitability
    const evaluation = gradingService.evaluateBatchGrade(computedMeasurements);
    const suitability = gradingService.evaluateCropSuitability(computedMeasurements, evaluation.grade);

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

    // Validation: Cannot approve incomplete test
    if (newStatus === 'Approved') {
      if (test.grade === 'Insufficient Test Data' || !test.measurements) {
        throw new Error('Cannot approve a test with "Insufficient Test Data". Complete all 5 physical suites first.');
      }
      if (test.grade === 'Failed') {
        throw new Error('Cannot approve a test that evaluated to "Failed". Reject or re-test the batch.');
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
