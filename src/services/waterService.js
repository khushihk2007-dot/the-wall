import { INITIAL_TANKS, INITIAL_WATER_USAGE } from '../constants/mockWaterData';
import { mockSensorData } from '../constants/mockSensorData';

const TANKS_KEY = 'thewall_water_tanks_v1';
const USAGE_KEY = 'thewall_water_usage_v1';

export const waterService = {
  // --- TANKS ---
  getTanks() {
    try {
      const stored = localStorage.getItem(TANKS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const validIds = new Set(INITIAL_TANKS.map((t) => t.id));
        const filtered = parsed.filter((t) => validIds.has(t.id));
        if (filtered.length > 0) return filtered;
      }
    } catch (e) {
      console.warn('Failed to parse water tanks from localStorage:', e);
    }
    return INITIAL_TANKS;
  },

  saveTanks(tanks) {
    try {
      localStorage.setItem(TANKS_KEY, JSON.stringify(tanks));
    } catch (e) {
      console.warn('Failed to save water tanks to localStorage:', e);
    }
  },

  updateTank(tankId, updates) {
    const tanks = this.getTanks();
    const idx = tanks.findIndex((t) => t.id === tankId);
    if (idx === -1) throw new Error(`Tank ${tankId} not found.`);

    const updated = { ...tanks[idx], ...updates };
    tanks[idx] = updated;
    this.saveTanks(tanks);
    return { tank: updated, all: tanks };
  },

  // --- USAGE RECORDS ---
  getUsageRecords() {
    try {
      const stored = localStorage.getItem(USAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse water usage from localStorage:', e);
    }
    return INITIAL_WATER_USAGE;
  },

  saveUsageRecords(records) {
    try {
      localStorage.setItem(USAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.warn('Failed to save water usage to localStorage:', e);
    }
  },

  addUsageRecord(data) {
    const records = this.getUsageRecords();
    const nextNum = records.length + 1;
    const year = new Date().getFullYear();
    const id = `USE-${year}-${String(nextNum).padStart(3, '0')}`;

    const newRecord = {
      id,
      tankId: data.tankId || 'TANK-001',
      farmId: data.farmId || 'FARM-001',
      farmName: data.farmName || '',
      installationId: data.installationId || null,
      timestamp: data.timestamp || new Date().toISOString(),
      amountLitres: Number(data.amountLitres) || 0,
      purpose: data.purpose || 'General Irrigation',
      recordedBy: data.recordedBy || 'Operator (Manual Entry)',
      notes: data.notes || '',
    };

    const updated = [newRecord, ...records];
    this.saveUsageRecords(updated);
    return { record: newRecord, all: updated };
  },

  deleteUsageRecord(id) {
    const records = this.getUsageRecords();
    const updated = records.filter((r) => r.id !== id);
    this.saveUsageRecords(updated);
    return updated;
  },

  clearUsageRecords(tankId = null) {
    const records = this.getUsageRecords();
    const updated = tankId ? records.filter((r) => r.tankId !== tankId) : [];
    this.saveUsageRecords(updated);
    return updated;
  },

  // --- SENSOR & CALCULATION ENGINE ---
  getTankTelemetry(tank) {
    if (!tank.installationId) {
      return {
        isConnected: false,
        deviceStatus: 'No Device Assigned',
        distanceCm: null,
        lastUpdated: tank.lastUpdated || 'Manual Mode',
      };
    }

    const liveSnapshot = mockSensorData.getLiveSnapshot(tank.installationId);
    return {
      isConnected: liveSnapshot.isConnected,
      deviceStatus: liveSnapshot.deviceStatus,
      distanceCm: liveSnapshot.ultrasonic ? liveSnapshot.ultrasonic.distanceCm : null,
      lastUpdated: liveSnapshot.lastUpdated || tank.lastUpdated,
    };
  },

  calculateTankMetrics(tank, usageRecords = []) {
    const telemetry = this.getTankTelemetry(tank);

    // If tank is not calibrated, we cannot compute volume or depth in litres
    if (!tank.isCalibrated) {
      return {
        isCalibrated: false,
        telemetry,
        rawDistanceCm: telemetry.distanceCm,
        waterDepthCm: null,
        waterLevelPct: null,
        availableLitres: null,
        totalCapacityLitres: tank.totalCapacityLitres,
        status: 'Uncalibrated',
        averageDailyConsumptionLitres: 0,
        totalRecordedUsageLitres: 0,
        runwayDays: null,
        isInsufficientData: false,
        activeDaysCount: 0,
        statusMessage: 'Awaiting Physical Tank Calibration. Sensor distance cannot be converted to litres without configured geometry.',
      };
    }

    // Calibrated geometry calculation
    const usableHeightCm = Math.max(1, tank.tankHeightCm - (tank.sensorMountOffsetCm || 0));
    let waterDepthCm = null;
    let waterLevelPct = null;
    let availableLitres = null;

    if (telemetry.distanceCm !== null && telemetry.distanceCm !== undefined) {
      // Distance from top sensor to water surface
      const depth = tank.tankHeightCm - telemetry.distanceCm;
      waterDepthCm = Math.max(0, Math.min(usableHeightCm, depth));
      waterLevelPct = Math.round(((waterDepthCm / usableHeightCm) * 100) * 10) / 10;
      availableLitres = Math.round((waterLevelPct / 100) * tank.totalCapacityLitres);
    } else {
      // If hardware is offline/not connected, use simulated safe estimate for display
      waterLevelPct = 68.5;
      waterDepthCm = Math.round((usableHeightCm * 0.685) * 10) / 10;
      availableLitres = Math.round(tank.totalCapacityLitres * 0.685);
    }

    // Status classification based on configured thresholds
    let status = 'Normal';
    let recommendations = [];

    if (waterLevelPct < (tank.criticalThresholdPct || 15)) {
      status = 'Critical';
      recommendations = [
        'Enforce deficit irrigation — switch to minimum crop survival moisture thresholds only.',
        'Suspend non-critical bed flushing, substrate priming, and auxiliary cleaning cycles.',
        'Arrange immediate emergency reservoir refill or switch to backup water source.',
      ];
    } else if (waterLevelPct < (tank.lowThresholdPct || 30)) {
      status = 'Low';
      recommendations = [
        'Reduce irrigation frequency and avoid midday application to limit evaporation losses.',
        'Prioritize active root-zone hydration over newly planted or fallow sections.',
        'Inspect drip line emitters and pipe joints for micro-leaks or clogs.',
      ];
    } else {
      recommendations = [
        'Sufficient water available. Standard irrigation cycles permitted.',
        'Regular bed moisture monitoring recommended.',
      ];
    }

    // Consumption & Runway calculations
    const tankUsage = usageRecords.filter((r) => r.tankId === tank.id);
    const totalRecordedUsageLitres = tankUsage.reduce((acc, curr) => acc + (Number(curr.amountLitres) || 0), 0);

    // Compute unique active calendar days
    const uniqueDates = new Set(
      tankUsage.map((r) => {
        try {
          return new Date(r.timestamp).toISOString().split('T')[0];
        } catch {
          return r.timestamp.split('T')[0] || r.timestamp;
        }
      })
    );

    const activeDaysCount = uniqueDates.size;
    let averageDailyConsumptionLitres = 0;
    let runwayDays = null;
    let isInsufficientData = true;

    if (activeDaysCount > 0 && totalRecordedUsageLitres > 0) {
      averageDailyConsumptionLitres = Math.round((totalRecordedUsageLitres / activeDaysCount) * 10) / 10;
      if (averageDailyConsumptionLitres > 0 && availableLitres !== null) {
        runwayDays = Math.round((availableLitres / averageDailyConsumptionLitres) * 10) / 10;
        isInsufficientData = false;
      }
    }

    return {
      isCalibrated: true,
      telemetry,
      rawDistanceCm: telemetry.distanceCm,
      waterDepthCm,
      waterLevelPct,
      availableLitres,
      totalCapacityLitres: tank.totalCapacityLitres,
      status,
      recommendations,
      averageDailyConsumptionLitres,
      totalRecordedUsageLitres,
      runwayDays,
      isInsufficientData,
      activeDaysCount,
      usageCount: tankUsage.length,
      statusMessage: status === 'Normal' ? 'Normal – Sufficient water available in reservoir.' : status === 'Low' ? 'Low – Water conservation warning active.' : 'Critical – Water scarcity alert active!',
    };
  },

  resetAllDemoData() {
    this.saveTanks(INITIAL_TANKS);
    this.saveUsageRecords(INITIAL_WATER_USAGE);
    return {
      tanks: INITIAL_TANKS,
      usage: INITIAL_WATER_USAGE,
    };
  },
};
