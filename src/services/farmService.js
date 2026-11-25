import {
  INITIAL_FARMS,
  INITIAL_INSTALLATIONS,
  INITIAL_DEVICES,
  INITIAL_THRESHOLDS,
  INITIAL_CALIBRATIONS,
  INITIAL_FARM_ALERTS,
} from '../constants/mockFarmData';
import { mockSensorData } from '../constants/mockSensorData';
import { manufacturingService } from './manufacturingService';

const FARMS_KEY = 'thewall_farms_v1';
const INSTALLATIONS_KEY = 'thewall_installations_v1';
const DEVICES_KEY = 'thewall_devices_v1';
const THRESHOLDS_KEY = 'thewall_thresholds_v1';
const CALIBRATIONS_KEY = 'thewall_calibrations_v1';
const ALERTS_KEY = 'thewall_farm_alerts_v1';

export const farmService = {
  // --- FARMS ---
  getFarms() {
    try {
      const stored = localStorage.getItem(FARMS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_FARMS;
  },

  saveFarms(farms) {
    try {
      localStorage.setItem(FARMS_KEY, JSON.stringify(farms));
    } catch (e) {
      console.warn('Failed to save farms to localStorage:', e);
    }
  },

  createFarm(data) {
    const farms = this.getFarms();
    const nextNum = farms.length + 1;
    const farmId = `FARM-${String(nextNum).padStart(3, '0')}`;

    const newFarm = {
      id: farmId,
      name: data.name || 'Unnamed Farm',
      farmerName: data.farmerName || 'Operator',
      location: data.location || 'Local Region',
      area: Number(data.area) || 1.0,
      areaUnit: data.areaUnit || 'Acres',
      cropCategory: data.cropCategory || 'General',
      contact: data.contact || '',
      notes: data.notes || '',
      registeredDate: new Date().toISOString().split('T')[0],
    };

    const updated = [newFarm, ...farms];
    this.saveFarms(updated);
    return { farm: newFarm, all: updated };
  },

  updateFarm(id, data) {
    const farms = this.getFarms();
    const idx = farms.findIndex((f) => f.id === id);
    if (idx === -1) throw new Error(`Farm ${id} not found.`);

    const updatedFarm = { ...farms[idx], ...data };
    farms[idx] = updatedFarm;
    this.saveFarms(farms);
    return { farm: updatedFarm, all: farms };
  },

  // --- INSTALLATIONS ---
  getInstallations() {
    try {
      const stored = localStorage.getItem(INSTALLATIONS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_INSTALLATIONS;
  },

  saveInstallations(insts) {
    try {
      localStorage.setItem(INSTALLATIONS_KEY, JSON.stringify(insts));
    } catch (e) {
      console.warn('Failed to save installations to localStorage:', e);
    }
  },

  createInstallation(data) {
    // Validate manufacturing batch exists
    const batches = manufacturingService.getCachedBatches();
    const batchExists = batches.some((b) => b.id === data.batchId);
    if (!batchExists) {
      throw new Error(`Manufacturing Batch ${data.batchId} does not exist in the platform.`);
    }

    const insts = this.getInstallations();
    const nextNum = insts.length + 1;
    const instId = `INST-${String(nextNum).padStart(3, '0')}`;

    const newInst = {
      id: instId,
      farmId: data.farmId,
      batchId: data.batchId,
      productId: data.productId || `CP-BED-${data.batchId.slice(-3)}-${String(nextNum * 15).padStart(3, '0')}`,
      installationDate: data.installationDate || new Date().toISOString().split('T')[0],
      cropType: data.cropType || 'Vegetable Bed',
      dimensions: data.dimensions || '100cm x 30cm x 3.5cm',
      location: data.location || 'Plot A',
      deviceId: data.deviceId || null,
      status: data.status || 'Registered',
      notes: data.notes || '',
    };

    const updated = [newInst, ...insts];
    this.saveInstallations(updated);
    return { installation: newInst, all: updated };
  },

  updateInstallation(id, data) {
    const insts = this.getInstallations();
    const idx = insts.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error(`Installation ${id} not found.`);

    const updatedInst = { ...insts[idx], ...data };
    insts[idx] = updatedInst;
    this.saveInstallations(insts);
    return { installation: updatedInst, all: insts };
  },

  // --- DEVICES ---
  getDevices() {
    try {
      const stored = localStorage.getItem(DEVICES_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_DEVICES;
  },

  saveDevices(devices) {
    try {
      localStorage.setItem(DEVICES_KEY, JSON.stringify(devices));
    } catch (e) {
      console.warn('Failed to save devices to localStorage:', e);
    }
  },

  // --- THRESHOLDS ---
  getThresholds() {
    try {
      const stored = localStorage.getItem(THRESHOLDS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_THRESHOLDS;
  },

  saveThresholds(thresholds) {
    try {
      localStorage.setItem(THRESHOLDS_KEY, JSON.stringify(thresholds));
    } catch (e) {
      console.warn('Failed to save thresholds to localStorage:', e);
    }
  },

  updateThresholdsForCategory(category, values) {
    const current = this.getThresholds();
    current[category] = { ...current[category], ...values, cropCategory: category };
    this.saveThresholds(current);
    return current;
  },

  // --- CALIBRATIONS ---
  getCalibrations() {
    try {
      const stored = localStorage.getItem(CALIBRATIONS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_CALIBRATIONS;
  },

  saveCalibrations(calibs) {
    try {
      localStorage.setItem(CALIBRATIONS_KEY, JSON.stringify(calibs));
    } catch (e) {
      console.warn('Failed to save calibrations to localStorage:', e);
    }
  },

  addCalibration(data) {
    const calibs = this.getCalibrations();
    const nextNum = calibs.length + 1;
    const newCalib = {
      id: `CAL-${String(nextNum).padStart(3, '0')}`,
      sensorId: data.sensorId || `SENSOR-${nextNum}`,
      sensorName: data.sensorName || 'Sensor Probe',
      sensorType: data.sensorType || 'Moisture',
      status: 'Calibrated',
      calibrationDate: data.calibrationDate || new Date().toISOString().split('T')[0],
      method: data.method || 'Standard Bench Calibration',
      notes: data.notes || '',
      nextDueDate: data.nextDueDate || '2027-02-01',
    };

    const updated = [newCalib, ...calibs];
    this.saveCalibrations(updated);
    return { calibration: newCalib, all: updated };
  },

  // --- ALERTS ---
  getAlerts() {
    try {
      const stored = localStorage.getItem(ALERTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_FARM_ALERTS;
  },

  saveAlerts(alerts) {
    try {
      localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
    } catch (e) {
      console.warn('Failed to save alerts to localStorage:', e);
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

  // --- TELEMETRY SNAPSHOT & HISTORICAL ---
  getLiveSnapshot(installationId, deviceId) {
    const devices = this.getDevices();
    const device = devices.find((d) => d.id === deviceId);
    const status = device ? device.connectionStatus : 'Not Registered';
    return mockSensorData.getLiveSnapshot(installationId, status);
  },

  getHistoricalReadings(installationId, timeFilter, deviceId) {
    return mockSensorData.getHistoricalReadings(installationId, timeFilter, !!deviceId);
  },

  // --- RESET DEMO ---
  resetAllDemoData() {
    try {
      localStorage.removeItem(FARMS_KEY);
      localStorage.removeItem(INSTALLATIONS_KEY);
      localStorage.removeItem(DEVICES_KEY);
      localStorage.removeItem(THRESHOLDS_KEY);
      localStorage.removeItem(CALIBRATIONS_KEY);
      localStorage.removeItem(ALERTS_KEY);
    } catch {
      // ignore
    }
    return {
      farms: INITIAL_FARMS,
      installations: INITIAL_INSTALLATIONS,
      devices: INITIAL_DEVICES,
      thresholds: INITIAL_THRESHOLDS,
      calibrations: INITIAL_CALIBRATIONS,
      alerts: INITIAL_FARM_ALERTS,
    };
  },
};
