/**
 * Telemetry and Historical Sensor Data Generator - The Wall
 * 
 * TRANSPARENCY SPECIFICATION:
 * - Current physical hardware prototype contains only ONE soil moisture sensor channel.
 * - Channels 2 and 3 are explicitly returned as "Not Connected".
 * - Ultrasonic distance is in cm; water volume is NOT estimated without geometry calibration.
 * - All generated points are tagged with isSimulated = true.
 */

export const mockSensorData = {
  getLiveSnapshot(installationId, deviceStatus = 'Connected') {
    if (deviceStatus === 'Disconnected' || deviceStatus === 'Not Registered') {
      return {
        isConnected: false,
        deviceStatus,
        lastUpdated: deviceStatus === 'Disconnected' ? '3 days ago' : 'Never',
        isSimulated: true,
        moisture: {
          channel1: {
            name: 'Top Layer Substrate Probe',
            value: null,
            unit: '%',
            rawAdc: null,
            status: 'Offline',
            isConnected: false,
          },
          channel2: {
            name: 'Bottom Layer Coir Buffer',
            value: null,
            unit: '%',
            rawAdc: null,
            status: 'Not Connected',
            isConnected: false,
            note: 'Channel 2 hardware probe not installed on single-probe prototype.',
          },
          channel3: {
            name: 'Root-Zone Soil Probe',
            value: null,
            unit: '%',
            rawAdc: null,
            status: 'Not Connected',
            isConnected: false,
            note: 'Separate ground soil probe not installed.',
          },
        },
        bedTemperature: {
          value: null,
          unit: '°C',
          status: 'Offline',
        },
        environment: {
          airTemp: null,
          humidity: null,
          status: 'Offline',
        },
        ultrasonic: {
          distanceCm: null,
          purpose: 'Water Tank Level Monitoring',
          status: 'Offline',
          isGeometryConfigured: false,
        },
        gps: {
          hasFix: false,
          status: 'Offline',
          latitude: null,
          longitude: null,
        },
      };
    }

    // Active Connected Demo Snapshot
    return {
      isConnected: true,
      deviceStatus,
      lastUpdated: '1 min ago (Live Demo Simulation)',
      isSimulated: true,
      moisture: {
        channel1: {
          name: 'Top Layer Substrate Probe (Single Channel)',
          value: 64.2,
          unit: '%',
          rawAdc: 2180, // out of 4095 (12-bit ESP32 ADC)
          status: 'Normal',
          trend: 'Stable',
          isConnected: true,
        },
        channel2: {
          name: 'Bottom Layer Coir Buffer Probe',
          value: null,
          unit: '%',
          rawAdc: null,
          status: 'Not Connected',
          isConnected: false,
          note: 'Hardware expansion channel 2 pending secondary probe assembly.',
        },
        channel3: {
          name: 'Root-Zone Ground Soil Probe',
          value: null,
          unit: '%',
          rawAdc: null,
          status: 'Not Connected',
          isConnected: false,
          note: 'Growing bed is elevated; ground soil probe not physically connected.',
        },
      },
      bedTemperature: {
        name: 'Substrate Core Temperature (DS18B20)',
        value: 24.6,
        unit: '°C',
        status: 'Optimal',
        range: '18°C - 28°C',
        isConnected: true,
      },
      environment: {
        name: 'Ambient Air Climate (SHT30)',
        airTemp: 27.2,
        airTempUnit: '°C',
        humidity: 66.8,
        humidityUnit: '% RH',
        status: 'Normal',
        isConnected: true,
      },
      ultrasonic: {
        name: 'Ultrasonic Depth Sensor (HC-SR04)',
        distanceCm: 48.5,
        unit: 'cm',
        purpose: 'Water Tank Level Monitoring',
        status: 'Operational (Distance Only)',
        isGeometryConfigured: false,
        calibrationNote: 'Distance measured from sensor head. Water volume requires tank dimensions calibration.',
      },
      gps: {
        name: 'GPS Telemetry Module (NEO-6M)',
        hasFix: true,
        status: '3D Fix (8 Satellites)',
        latitude: 30.9045,
        longitude: 77.0967,
        accuracyMeters: 4.5,
        lastFixTime: '2026-11-25 15:30',
        note: 'Simulated demonstration coordinate for Solan Polyhouse.',
      },
    };
  },

  /**
   * Generates time-series data for historical charts based on selected filter
   */
  getHistoricalReadings(installationId, timeFilter = '24h', hasDevice = true) {
    if (!hasDevice) {
      return []; // Return empty array if no device assigned
    }

    const points = [];

    if (timeFilter === '1h') {
      for (let i = 11; i >= 0; i--) {
        const minsAgo = i * 5;
        const baseMoisture = 64.0 + Math.sin(i / 2) * 1.5;
        points.push({
          time: `${minsAgo === 0 ? 'Now' : `-${minsAgo}m`}`,
          moisture: Number(baseMoisture.toFixed(1)),
          bedTemp: Number((24.5 + Math.cos(i) * 0.3).toFixed(1)),
          airTemp: Number((27.0 + Math.sin(i) * 0.5).toFixed(1)),
          humidity: Number((66.5 + Math.cos(i / 2) * 1.2).toFixed(1)),
          distanceCm: Number((48.5 + (i * 0.05)).toFixed(1)),
        });
      }
      return points;
    }

    if (timeFilter === '24h') {
      for (let i = 23; i >= 0; i--) {
        const hour = (new Date().getHours() - i + 24) % 24;
        const timeLabel = `${String(hour).padStart(2, '0')}:00`;
        // Daytime temperature curve
        const tempVariation = Math.sin((hour - 8) / 4) * 3.5;
        const moistVariation = -Math.sin((hour - 8) / 4) * 4.0;

        points.push({
          time: timeLabel,
          moisture: Number((63.5 + moistVariation).toFixed(1)),
          bedTemp: Number((24.0 + (tempVariation * 0.6)).toFixed(1)),
          airTemp: Number((25.5 + tempVariation).toFixed(1)),
          humidity: Number((68.0 - (tempVariation * 1.8)).toFixed(1)),
          distanceCm: Number((47.0 + (i * 0.15)).toFixed(1)),
        });
      }
      return points;
    }

    if (timeFilter === '7d') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      for (let i = 6; i >= 0; i--) {
        const d = days[(new Date().getDay() - i + 7) % 7];
        points.push({
          time: d,
          moisture: Number((62.0 + Math.sin(i) * 5.0).toFixed(1)),
          bedTemp: Number((24.2 + Math.cos(i) * 1.2).toFixed(1)),
          airTemp: Number((26.5 + Math.sin(i) * 2.0).toFixed(1)),
          humidity: Number((65.0 + Math.cos(i) * 4.0).toFixed(1)),
          distanceCm: Number((46.0 + i * 0.8).toFixed(1)),
        });
      }
      return points;
    }

    // 30d or custom
    for (let i = 29; i >= 0; i -= 2) {
      points.push({
        time: `Day -${i}`,
        moisture: Number((63.0 + Math.sin(i / 3) * 6.0).toFixed(1)),
        bedTemp: Number((24.0 + Math.cos(i / 4) * 1.5).toFixed(1)),
        airTemp: Number((26.0 + Math.sin(i / 4) * 2.5).toFixed(1)),
        humidity: Number((67.0 + Math.cos(i / 3) * 5.0).toFixed(1)),
        distanceCm: Number((45.0 + i * 0.3).toFixed(1)),
      });
    }

    return points;
  },
};
