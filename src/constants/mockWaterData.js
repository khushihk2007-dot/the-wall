/**
 * Centralized Mock Water Storage, Reservoir Tanks, and Usage Data - The Wall
 * Water Runway Module
 * 
 * IMPORTANT: All simulated sensor readings and telemetry are tagged as [DEMO DATA].
 * Physical hardware list does NOT include a flow sensor, so water consumption
 * is logged manually. Ultrasonic distance is measured in cm and requires tank
 * geometry calibration to compute volume.
 */

export const INITIAL_TANKS = [
  {
    id: 'TANK-001',
    name: 'Primary Polyhouse Reservoir',
    farmId: 'FARM-001',
    farmName: 'Green Valley Organics',
    installationId: 'INST-001',
    deviceId: 'ESP32-DEV-001',
    totalCapacityLitres: 5000,
    tankHeightCm: 200,
    sensorMountOffsetCm: 10,
    isCalibrated: true,
    shape: 'Vertical Cylindrical',
    lowThresholdPct: 30,
    criticalThresholdPct: 15,
    location: 'Sector 3 Reservoir Shed',
    lastUpdated: '1 min ago (Live Demo Simulation)',
    ultrasonicSensorId: 'USONIC-01',
    notes: 'Rain-harvesting and bore-well buffer tank with micro-drip intake line.',
  },
];

export const INITIAL_WATER_USAGE = [
  {
    id: 'USE-2026-001',
    tankId: 'TANK-001',
    farmId: 'FARM-001',
    farmName: 'Green Valley Organics',
    installationId: 'INST-001',
    timestamp: '2026-11-25T07:30:00',
    amountLitres: 180,
    purpose: 'Morning Drip Irrigation',
    recordedBy: 'Vikram Mehta (Farm Lead)',
    notes: 'Polyhouse Tunnel A - regular scheduled drip run cycle.',
  },
  {
    id: 'USE-2026-002',
    tankId: 'TANK-001',
    farmId: 'FARM-001',
    farmName: 'Green Valley Organics',
    installationId: 'INST-002',
    timestamp: '2026-11-24T17:00:00',
    amountLitres: 130,
    purpose: 'Evening Root Hydration',
    recordedBy: 'Ramesh K. (Field Tech)',
    notes: 'Tunnel B bell pepper bed lines evening top-up.',
  },
  {
    id: 'USE-2026-003',
    tankId: 'TANK-001',
    farmId: 'FARM-001',
    farmName: 'Green Valley Organics',
    installationId: 'INST-001',
    timestamp: '2026-11-24T08:00:00',
    amountLitres: 195,
    purpose: 'Morning Drip Irrigation',
    recordedBy: 'Vikram Mehta (Farm Lead)',
    notes: 'Full morning cycle across all active bed rows.',
  },
  {
    id: 'USE-2026-004',
    tankId: 'TANK-001',
    farmId: 'FARM-001',
    farmName: 'Green Valley Organics',
    installationId: 'INST-001',
    timestamp: '2026-11-23T16:15:00',
    amountLitres: 145,
    purpose: 'Substrate Bed Priming',
    recordedBy: 'Vikram Mehta (Farm Lead)',
    notes: 'Pre-wetting new biodegradable coir bed installation.',
  },
  {
    id: 'USE-2026-005',
    tankId: 'TANK-001',
    farmId: 'FARM-001',
    farmName: 'Green Valley Organics',
    installationId: 'INST-001',
    timestamp: '2026-11-23T07:45:00',
    amountLitres: 190,
    purpose: 'Morning Drip Irrigation',
    recordedBy: 'Ramesh K. (Field Tech)',
    notes: 'Morning micro-emitter cycle.',
  },
  {
    id: 'USE-2026-006',
    tankId: 'TANK-001',
    farmId: 'FARM-001',
    farmName: 'Green Valley Organics',
    installationId: 'INST-002',
    timestamp: '2026-11-22T08:15:00',
    amountLitres: 185,
    purpose: 'Morning Drip Irrigation',
    recordedBy: 'Vikram Mehta (Farm Lead)',
    notes: 'Standard morning irrigation pulse.',
  },
];

export const USAGE_PURPOSES = [
  'Morning Drip Irrigation',
  'Evening Root Hydration',
  'Growing Bed Priming',
  'Seedling Misting',
  'Fertigation Dosing',
  'Tank Flush & Maintenance',
  'Other Agricultural Use',
];
