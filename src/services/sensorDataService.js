/**
 * Central Sensor Data Service - The Wall
 * Manages raw communication and data normalization for the physical ESP32 sensor hardware.
 */

const DEFAULT_SENSOR_URL = 'http://10.244.183.187/data';
const REQUEST_TIMEOUT_MS = 6000;
const POLLING_INTERVAL_MS = 15000;

/**
 * Standard hardware snapshot representing user-supplied ESP32 real-time telemetry.
 * Used as immediate fallback and default baseline when node is offline or initializing.
 */
export const DEFAULT_HARDWARE_SNAPSHOT = {
  device: 'CocoPit-ESP32',
  wifiConnected: true,
  ip: '10.244.183.187',
  ipAddress: '10.244.183.187',
  moisture: 100,
  soilMoisturePercent: 100,
  soilRaw: 0,
  t1: 28,
  temperature1: 28,
  h1: 65,
  humidity1: 65,
  t2: 27,
  temperature2: 27,
  h2: 64,
  humidity2: 64,
  gasRaw: 0,
  rain: false,
  rainDetected: false,
  ultrasonicCm: 21.4,
  ultrasonicDistanceCm: 21.4,
  ultrasonicSim: true,
  waterLiters: 4680,
  estimatedWaterLiters: 4680,
  flowLpm: 0.45,
  estimatedNetWaterChangeLpm: 0.45,
  pumpOn: false,
  pumpMode: 'AUTO',
  fanOn: true,
  fanMode: 'FORCE ON',
  uptimeMs: 48200,
  lastDataUpdateMs: 47900,
};

/**
 * Resolves sensor value with rule: if value is null, undefined, 0, or -1, convert into mock data.
 */
function resolveSensorValue(val, mockFallback) {
  if (
    val === null ||
    val === undefined ||
    val === '' ||
    val === 0 ||
    val === -1 ||
    val === '0' ||
    val === '-1'
  ) {
    return {
      value: mockFallback,
      rawValue: val,
      isMock: true,
      isLive: false,
    };
  }
  const num = Number(val);
  if (!Number.isFinite(num)) {
    return {
      value: mockFallback,
      rawValue: val,
      isMock: true,
      isLive: false,
    };
  }
  return {
    value: num,
    rawValue: num,
    isMock: false,
    isLive: true,
  };
}

export const sensorDataService = {
  /**
   * Resolves the configured sensor endpoint.
   * Priority:
   * 1. Backend mode if configured via VITE_SENSOR_MODE === 'backend'
   * 2. import.meta.env.VITE_SENSOR_API_URL
   * 3. Default hardware IP http://10.244.183.187/data
   */
  getApiUrl() {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      if (import.meta.env.VITE_SENSOR_MODE === 'backend') {
        return import.meta.env.VITE_SENSOR_BACKEND_URL || '/api/sensors/data';
      }
      if (import.meta.env.VITE_SENSOR_API_URL) {
        return import.meta.env.VITE_SENSOR_API_URL;
      }
    }
    return DEFAULT_SENSOR_URL;
  },

  getPollingInterval() {
    return POLLING_INTERVAL_MS;
  },

  getRequestTimeout() {
    return REQUEST_TIMEOUT_MS;
  },

  /**
   * Safely fetches sensor readings from the hardware node with an explicit timeout.
   * @param {AbortSignal} [externalSignal] - Optional parent abort signal.
   * @returns {Promise<Object>} Normalized sensor readings payload.
   */
  async fetchSensorData(externalSignal) {
    const url = this.getApiUrl();
    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    // Link external cancellation if passed
    if (externalSignal) {
      externalSignal.addEventListener('abort', () => controller.abort());
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const raw = await response.json();
      return this.normalizeSensorPayload(raw);
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error(`ESP32 sensor request timed out after ${REQUEST_TIMEOUT_MS / 1000}s`);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  },

  /**
   * Normalizes incoming raw ESP32 JSON into a strictly typed, null-safe data contract.
   * Supports both short keys (moisture, t1, h1, ultrasonicCm, etc.) and long keys.
   * If a value is null, 0, or -1, converts it into sensible mock data with isMock flag.
   */
  normalizeSensorPayload(raw = {}) {
    const toNumOrNull = (val) => {
      if (val === null || val === undefined || val === '') return null;
      const num = Number(val);
      return Number.isFinite(num) ? num : null;
    };

    const toBool = (val) => Boolean(val);

    // Extract raw fields supporting both short-form and long-form keys
    const rawIp = raw.ip || raw.ipAddress || '10.244.183.187';
    const rawMoisture = raw.moisture !== undefined ? raw.moisture : raw.soilMoisturePercent;
    const rawSoil = raw.soilRaw;
    const rawT1 = raw.t1 !== undefined ? raw.t1 : raw.temperature1;
    const rawH1 = raw.h1 !== undefined ? raw.h1 : raw.humidity1;
    const rawT2 = raw.t2 !== undefined ? raw.t2 : raw.temperature2;
    const rawH2 = raw.h2 !== undefined ? raw.h2 : raw.humidity2;
    const rawGas = raw.gasRaw;
    const rawRain = raw.rain !== undefined ? raw.rain : raw.rainDetected;
    const rawUltra = raw.ultrasonicCm !== undefined ? raw.ultrasonicCm : raw.ultrasonicDistanceCm;
    const rawLiters = raw.waterLiters !== undefined ? raw.waterLiters : raw.estimatedWaterLiters;
    const rawFlow = raw.flowLpm !== undefined ? raw.flowLpm : raw.estimatedNetWaterChangeLpm;

    // Apply rule: if value is null, 0, or -1, convert into mock data
    const moistureRes = resolveSensorValue(rawMoisture, 64.2);
    const soilRawRes = resolveSensorValue(rawSoil, 1840);
    const t1Res = resolveSensorValue(rawT1, 24.5);
    const h1Res = resolveSensorValue(rawH1, 58);
    const t2Res = resolveSensorValue(rawT2, 26.2);
    const h2Res = resolveSensorValue(rawH2, 68);
    const gasRes = resolveSensorValue(rawGas, 412);
    const ultraRes = resolveSensorValue(rawUltra, 21.4);
    const litersRes = resolveSensorValue(rawLiters, 4680);
    const flowRes = resolveSensorValue(rawFlow, 0.45);

    // GPS validation
    const gpsValid = toBool(raw.gpsValid);
    const latitude = gpsValid ? toNumOrNull(raw.latitude) : null;
    const longitude = gpsValid ? toNumOrNull(raw.longitude) : null;

    return {
      // Hardware & Connectivity metadata
      device: raw.device || 'CocoPit-ESP32',
      wifiConnected: raw.wifiConnected !== undefined ? toBool(raw.wifiConnected) : true,
      ipAddress: rawIp,
      ip: rawIp,
      uptimeMs: toNumOrNull(raw.uptimeMs) || 48200,
      lastDataUpdateMs: toNumOrNull(raw.lastDataUpdateMs) || 47900,

      // Soil Moisture (Channel 1)
      soilMoisturePercent: moistureRes.value,
      rawSoilMoisturePercent: moistureRes.rawValue,
      isMoistureMock: moistureRes.isMock,
      soilValid: true,

      // Soil Raw ADC
      soilRaw: soilRawRes.value,
      rawSoilRaw: soilRawRes.rawValue,
      isSoilRawMock: soilRawRes.isMock,

      // Temperature 1 & Humidity 1 (Substrate)
      temperature1: t1Res.value,
      rawTemperature1: t1Res.rawValue,
      isTemp1Mock: t1Res.isMock,
      dht1Valid: !t1Res.isMock,

      humidity1: h1Res.value,
      rawHumidity1: h1Res.rawValue,
      isHum1Mock: h1Res.isMock,

      // Temperature 2 & Humidity 2 (Ambient)
      temperature2: t2Res.value,
      rawTemperature2: t2Res.rawValue,
      isTemp2Mock: t2Res.isMock,
      dht2Valid: !t2Res.isMock,

      humidity2: h2Res.value,
      rawHumidity2: h2Res.rawValue,
      isHum2Mock: h2Res.isMock,

      // Gas Sensor
      gasRaw: gasRes.value,
      rawGasRaw: gasRes.rawValue,
      isGasMock: gasRes.isMock,

      // Rain Sensor
      rainDetected: toBool(rawRain),
      rain: toBool(rawRain),

      // Ultrasonic Distance & Simulation flag
      ultrasonicDistanceCm: ultraRes.value,
      rawUltrasonicDistanceCm: ultraRes.rawValue,
      isUltrasonicMock: ultraRes.isMock,
      ultrasonicValid: !ultraRes.isMock,
      ultrasonicSim: raw.ultrasonicSim !== undefined ? toBool(raw.ultrasonicSim) : false,

      // Water Reservoir & Flow Telemetry
      estimatedWaterLiters: litersRes.value,
      rawEstimatedWaterLiters: litersRes.rawValue,
      isWaterLitersMock: litersRes.isMock,

      estimatedNetWaterChangeLpm: flowRes.value,
      rawEstimatedNetWaterChangeLpm: flowRes.rawValue,

      // Actuators & Control states (Real values from ESP32)
      pumpOn: raw.pumpOn !== undefined ? toBool(raw.pumpOn) : true,
      pumpMode: raw.pumpMode || 'FORCE ON',
      fanOn: raw.fanOn !== undefined ? toBool(raw.fanOn) : true,
      fanMode: raw.fanMode || 'FORCE ON',

      // Satellite GPS Telemetry
      gpsValid,
      latitude,
      longitude,

      rawResponse: raw,
      receivedAt: new Date().toISOString(),
    };
  },

  /**
   * Helper to format uptime into human-readable duration
   */
  formatUptime(uptimeMs) {
    if (!uptimeMs || uptimeMs <= 0) return '0m';
    const totalSec = Math.floor(uptimeMs / 1000);
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  },
};
