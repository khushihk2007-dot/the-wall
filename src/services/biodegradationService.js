import {
  INITIAL_BIODEGRADATION_SAMPLES,
  INITIAL_OBSERVATION_RECORDS,
  INITIAL_EVALUATION_CRITERIA,
  INITIAL_BIODEGRADATION_ALERTS,
} from '../constants/mockBiodegradationData';
import { manufacturingService } from './manufacturingService';

const SAMPLES_KEY = 'thewall_biodegradation_samples_v1';
const OBSERVATIONS_KEY = 'thewall_biodegradation_observations_v1';
const CRITERIA_KEY = 'thewall_biodegradation_criteria_v1';
const ALERTS_KEY = 'thewall_biodegradation_alerts_v1';

export const biodegradationService = {
  // --- SAMPLES ---
  getSamples() {
    try {
      const stored = localStorage.getItem(SAMPLES_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_BIODEGRADATION_SAMPLES;
  },

  saveSamples(samples) {
    try {
      localStorage.setItem(SAMPLES_KEY, JSON.stringify(samples));
    } catch (e) {
      console.warn('Failed to save biodegradation samples to localStorage:', e);
    }
  },

  getSampleById(id) {
    const samples = this.getSamples();
    return samples.find((s) => s.id === id) || null;
  },

  getSamplesByBatchId(batchId) {
    const samples = this.getSamples();
    return samples.filter((s) => s.batchId === batchId);
  },

  createSample(data) {
    // Validate manufacturing batch exists if linked
    if (data.batchId) {
      const batches = manufacturingService.getCachedBatches();
      const batchExists = batches.some((b) => b.id === data.batchId);
      if (!batchExists) {
        throw new Error(`Manufacturing Batch ${data.batchId} does not exist.`);
      }
    }

    const samples = this.getSamples();
    const nextNum = samples.length + 1;
    const sampleId = `BIO-SMP-${String(nextNum).padStart(3, '0')}`;
    const initialMass = Number(data.initialDryMass);

    if (isNaN(initialMass) || initialMass <= 0) {
      throw new Error('Initial dry mass must be a positive number in grams.');
    }

    const newSample = {
      id: sampleId,
      batchId: data.batchId || '',
      productId: data.productId || `CP-BED-EXP-${String(nextNum).padStart(3, '0')}`,
      sampleName: data.sampleName || `Specimen ${sampleId}`,
      materialComposition: data.materialComposition || '40% Cotton, 60% Coconut Coir, Natural Binder',
      sampleCollectionDate: data.sampleCollectionDate || new Date().toISOString().split('T')[0],
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      environment: data.environment || 'Soil burial',
      location: data.location || 'Local Experimental Plot',
      cropApplication: data.cropApplication || 'Field Growing Bed Residual',
      responsibleObserver: data.responsibleObserver || 'QC Observer',
      status: data.status || 'Under Observation',
      nextObservationDate: data.nextObservationDate || null,
      initialDryMass: initialMass,
      initialDimensions: {
        lengthMm: Number(data.lengthMm) || 300,
        widthMm: Number(data.widthMm) || 150,
        thicknessMm: Number(data.thicknessMm) || 35,
      },
      notes: data.notes || '',
      statusHistory: [
        {
          status: data.status || 'Under Observation',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          note: 'Initial specimen registration and baseline parameters logged.',
          updatedBy: data.responsibleObserver || 'QC Observer',
        },
      ],
    };

    const updated = [newSample, ...samples];
    this.saveSamples(updated);

    // Automatically create baseline Day 0 observation
    this.addObservation(sampleId, {
      observationDate: newSample.startDate,
      currentDryMass: initialMass,
      physicalAppearance: 'No visible change',
      structuralIntegrity: 'Intact',
      lengthMm: newSample.initialDimensions.lengthMm,
      widthMm: newSample.initialDimensions.widthMm,
      thicknessMm: newSample.initialDimensions.thicknessMm,
      temperatureC: 24.0,
      relativeHumidityPct: 65.0,
      soilMoisturePct: 55.0,
      soilPh: 6.8,
      measurementMethod: 'Baseline balance weighing & digital caliper recording',
      notes: 'Baseline observation at test start. Specimen unweathered.',
      observer: newSample.responsibleObserver,
    });

    return { sample: newSample, all: updated };
  },

  updateSample(id, data) {
    const samples = this.getSamples();
    const idx = samples.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error(`Sample ${id} not found.`);

    const updatedSample = {
      ...samples[idx],
      ...data,
      initialDryMass: data.initialDryMass !== undefined ? Number(data.initialDryMass) : samples[idx].initialDryMass,
    };

    samples[idx] = updatedSample;
    this.saveSamples(samples);
    return { sample: updatedSample, all: samples };
  },

  updateSampleStatus(id, newStatus, reasonNotes = '', updatedBy = 'QC Observer') {
    const samples = this.getSamples();
    const idx = samples.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error(`Sample ${id} not found.`);

    const historyEntry = {
      status: newStatus,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      note: reasonNotes || `Status transitioned to ${newStatus}.`,
      updatedBy,
    };

    const updatedSample = {
      ...samples[idx],
      status: newStatus,
      statusHistory: [...(samples[idx].statusHistory || []), historyEntry],
    };

    samples[idx] = updatedSample;
    this.saveSamples(samples);
    return { sample: updatedSample, all: samples };
  },

  archiveSample(id) {
    return this.updateSampleStatus(id, 'Observation Completed', 'Sample archived from active monitoring.', 'Administrator');
  },

  // --- OBSERVATIONS ---
  getAllObservations() {
    try {
      const stored = localStorage.getItem(OBSERVATIONS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_OBSERVATION_RECORDS;
  },

  saveObservations(observations) {
    try {
      localStorage.setItem(OBSERVATIONS_KEY, JSON.stringify(observations));
    } catch (e) {
      console.warn('Failed to save biodegradation observations to localStorage:', e);
    }
  },

  getObservations(sampleId) {
    const all = this.getAllObservations();
    return all
      .filter((o) => o.sampleId === sampleId)
      .sort((a, b) => new Date(a.observationDate) - new Date(b.observationDate));
  },

  calculateMassLoss(initialDryMass, currentDryMass) {
    if (!initialDryMass || initialDryMass <= 0 || currentDryMass === undefined || currentDryMass === null) {
      return 0.0;
    }
    const loss = ((initialDryMass - currentDryMass) / initialDryMass) * 100;
    return Number(loss.toFixed(1));
  },

  addObservation(sampleId, data) {
    const sample = this.getSampleById(sampleId);
    if (!sample) throw new Error(`Sample ${sampleId} not found.`);

    const currentMass = Number(data.currentDryMass);
    if (isNaN(currentMass) || currentMass < 0) {
      throw new Error('Current dry mass must be a non-negative number.');
    }

    if (currentMass > sample.initialDryMass && !data.isMeasurementCorrection) {
      throw new Error(
        `Current dry mass (${currentMass}g) exceeds initial dry mass (${sample.initialDryMass}g). Check measurement or enable "Measurement Correction".`
      );
    }

    const massLossPct = this.calculateMassLoss(sample.initialDryMass, currentMass);

    // Calculate days since start
    const startDate = new Date(sample.startDate);
    const obsDate = new Date(data.observationDate || new Date());
    const diffTime = Math.max(0, obsDate - startDate);
    const daysSinceStart = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // Dimension changes
    const curLen = Number(data.lengthMm) || sample.initialDimensions.lengthMm;
    const curWid = Number(data.widthMm) || sample.initialDimensions.widthMm;
    const curThk = Number(data.thicknessMm) || sample.initialDimensions.thicknessMm;

    const allObs = this.getAllObservations();
    const nextNum = allObs.length + 1;
    const obsId = `OBS-${sampleId.replace('BIO-SMP-', '')}-${String(nextNum).padStart(2, '0')}`;

    const newObs = {
      id: obsId,
      sampleId,
      observationDate: data.observationDate || new Date().toISOString().split('T')[0],
      daysSinceStart,
      currentDryMass: currentMass,
      massLossPct,
      physicalAppearance: data.physicalAppearance || 'No visible change',
      structuralIntegrity: data.structuralIntegrity || 'Intact',
      photoUrl: data.photoUrl || null,
      dimensions: {
        lengthMm: curLen,
        widthMm: curWid,
        thicknessMm: curThk,
        lengthChangeMm: curLen - sample.initialDimensions.lengthMm,
        widthChangeMm: curWid - sample.initialDimensions.widthMm,
        thicknessChangeMm: curThk - sample.initialDimensions.thicknessMm,
      },
      environmentalConditions: {
        temperatureC: data.temperatureC !== '' && data.temperatureC !== undefined ? Number(data.temperatureC) : null,
        relativeHumidityPct: data.relativeHumidityPct !== '' && data.relativeHumidityPct !== undefined ? Number(data.relativeHumidityPct) : null,
        soilMoisturePct: data.soilMoisturePct !== '' && data.soilMoisturePct !== undefined ? Number(data.soilMoisturePct) : null,
        soilPh: data.soilPh !== '' && data.soilPh !== undefined ? Number(data.soilPh) : null,
        measurementMethod: data.measurementMethod || 'Standard oven dry and analytical balance',
      },
      notes: data.notes || '',
      observer: data.observer || sample.responsibleObserver,
      isMeasurementCorrection: !!data.isMeasurementCorrection,
    };

    const updatedAll = [...allObs, newObs];
    this.saveObservations(updatedAll);
    return { observation: newObs, sampleObservations: this.getObservations(sampleId) };
  },

  deleteObservation(obsId) {
    const all = this.getAllObservations();
    const filtered = all.filter((o) => o.id !== obsId);
    this.saveObservations(filtered);
    return filtered;
  },

  // --- KPIS & ANALYTICS ---
  getKPIs() {
    const samples = this.getSamples();
    const totalSamples = samples.length;
    const underObservation = samples.filter((s) => s.status === 'Under Observation').length;
    const completed = samples.filter((s) => s.status === 'Observation Completed').length;
    const requiringAttention = samples.filter((s) => s.status === 'Requires Review' || s.status === 'Observation Paused').length;

    // Calculate Average Mass Loss (%) from latest recorded observations
    let totalLatestMassLoss = 0;
    let measuredSampleCount = 0;

    samples.forEach((sample) => {
      const obs = this.getObservations(sample.id);
      if (obs.length > 0) {
        // Latest observation
        const latest = obs[obs.length - 1];
        if (typeof latest.massLossPct === 'number' && !isNaN(latest.massLossPct)) {
          totalLatestMassLoss += latest.massLossPct;
          measuredSampleCount++;
        }
      }
    });

    const avgMassLoss = measuredSampleCount > 0 ? Number((totalLatestMassLoss / measuredSampleCount).toFixed(1)) : 0;

    return {
      totalSamples,
      underObservation,
      completed,
      requiringAttention,
      avgMassLoss,
      measuredSampleCount,
    };
  },

  // --- CRITERIA ---
  getEvaluationCriteria() {
    try {
      const stored = localStorage.getItem(CRITERIA_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_EVALUATION_CRITERIA;
  },

  saveEvaluationCriteria(criteria) {
    try {
      localStorage.setItem(CRITERIA_KEY, JSON.stringify(criteria));
    } catch (e) {
      console.warn('Failed to save criteria to localStorage:', e);
    }
  },

  updateEvaluationCriteria(updates) {
    const current = this.getEvaluationCriteria();
    const updated = { ...current, ...updates };
    this.saveEvaluationCriteria(updated);
    return updated;
  },

  // --- ALERTS ---
  getAlerts() {
    try {
      const stored = localStorage.getItem(ALERTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_BIODEGRADATION_ALERTS;
  },

  saveAlerts(alerts) {
    try {
      localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
    } catch (e) {
      console.warn('Failed to save biodegradation alerts to localStorage:', e);
    }
  },

  acknowledgeAlert(id) {
    const alerts = this.getAlerts();
    const idx = alerts.findIndex((a) => a.id === id);
    if (idx !== -1) {
      alerts[idx].status = 'Acknowledged';
      this.saveAlerts(alerts);
    }
    return alerts;
  },

  resolveAlert(id) {
    const alerts = this.getAlerts();
    const idx = alerts.findIndex((a) => a.id === id);
    if (idx !== -1) {
      alerts[idx].status = 'Resolved';
      this.saveAlerts(alerts);
    }
    return alerts;
  },

  // --- RESET DEMO ---
  resetAllDemoData() {
    try {
      localStorage.removeItem(SAMPLES_KEY);
      localStorage.removeItem(OBSERVATIONS_KEY);
      localStorage.removeItem(CRITERIA_KEY);
      localStorage.removeItem(ALERTS_KEY);
    } catch {
      // ignore
    }
    return {
      samples: INITIAL_BIODEGRADATION_SAMPLES,
      observations: INITIAL_OBSERVATION_RECORDS,
      criteria: INITIAL_EVALUATION_CRITERIA,
      alerts: INITIAL_BIODEGRADATION_ALERTS,
    };
  },
};
