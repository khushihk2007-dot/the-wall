/**
 * Mock Data for The Wall - Overview Dashboard
 * Centralized dataset representing manufacturing, quality control, farm telemetry,
 * water storage metrics, activity logs, and alerts.
 * 
 * NOTE: Sensor readings are explicitly marked as [SIMULATED] in accordance with
 * SRS verification and transparency standards.
 */

export const OVERVIEW_KPIS = [
  {
    id: 'kpi-beds',
    title: 'Total Beds Manufactured',
    value: '1,420',
    unit: 'units',
    iconName: 'Layers',
    changeLabel: '+140 beds this month',
    trend: 'up',
  },
  {
    id: 'kpi-qa',
    title: 'Quality Approved',
    value: '97.4%',
    unit: 'approval rate',
    iconName: 'CheckCircle2',
    changeLabel: '38 of 39 batches passed',
    trend: 'neutral',
  },
  {
    id: 'kpi-farms',
    title: 'Active Farm Installations',
    value: '24',
    unit: 'sites',
    iconName: 'Sprout',
    changeLabel: '6 commercial partner farms',
    trend: 'up',
  },
  {
    id: 'kpi-devices',
    title: 'Connected Devices',
    value: '18 / 20',
    unit: 'gateways active',
    iconName: 'Radio',
    changeLabel: '2 offline (scheduled maint.)',
    trend: 'warning',
  },
];

export const MANUFACTURING_SUMMARY = {
  totalBatches: 39,
  inProgress: 6,
  completed: 33,
  batchStages: [
    { stage: 'Materials Prep', count: 2 },
    { stage: 'Mixing & Layering', count: 1 },
    { stage: 'Compression', count: 1 },
    { stage: 'Drying / Curing', count: 2 },
    { stage: 'Quality Testing', count: 1 },
  ],
  monthlyProduction: [
    { month: 'Jun', beds: 180, approved: 175 },
    { month: 'Jul', beds: 210, approved: 205 },
    { month: 'Aug', beds: 240, approved: 238 },
    { month: 'Sep', beds: 220, approved: 216 },
    { month: 'Oct', beds: 280, approved: 275 },
    { month: 'Nov', beds: 290, approved: 286 },
  ],
};

export const QUALITY_CONTROL_SUMMARY = {
  passed: 38,
  failed: 1,
  pending: 2,
  grades: [
    { name: 'Grade A (Premium)', count: 28, color: '#1B4332' },
    { name: 'Grade B (Standard)', count: 10, color: '#8B633A' },
    { name: 'Grade C (Rejected)', count: 1, color: '#DC2626' },
  ],
  averageAbsorption: 412.5, // % dry weight basis
  averageRetention: 78.4,   // % water retained after 24h
};

export const FARM_TELEMETRY_SUMMARY = {
  isSimulated: true, // Explicitly tagged
  lastSyncTimestamp: new Date().toISOString(),
  metrics: {
    averageMoisture: {
      value: 64.2,
      unit: '%',
      topLayer: 68.0,
      bottomLayer: 60.4,
      rootZoneSoil: 58.1,
      status: 'Optimal',
    },
    averageTemperature: {
      value: 26.8,
      unit: '°C',
      status: 'Normal',
      range: '22°C - 31°C',
    },
    averageHumidity: {
      value: 68.5,
      unit: '% RH',
      status: 'Good',
      range: '60% - 75%',
    },
  },
};

export const WATER_INTELLIGENCE_SUMMARY = {
  availableWater: 18450, // Litres
  dailyRequirement: 1240, // Litres / day
  estimatedRunwayDays: 14.8,
  status: 'Adequate Storage',
  statusVariant: 'success',
  storageCapacity: 25000, // Litres
  storagePercentage: 73.8, // %
  note: 'Runway calculated across 24 active beds in Phase 1 sector.',
};

export const RECENT_ACTIVITIES = [
  {
    id: 'act-1',
    type: 'manufacturing',
    title: 'Batch CP-2026-B12 initialized',
    description: 'Cotton-Coir 40/60 formulation for structural layer dispatched to compression stage.',
    timestamp: '25 mins ago',
    iconName: 'Factory',
    category: 'Manufacturing',
  },
  {
    id: 'act-2',
    type: 'quality',
    title: 'Inspection Passed: Batch CP-2026-B11',
    description: 'Lab test confirmed 428% water absorption and 81.2% retention. Awarded Grade A.',
    timestamp: '2 hours ago',
    iconName: 'CheckCircle2',
    category: 'Quality Control',
  },
  {
    id: 'act-3',
    type: 'farm',
    title: 'Installation Recorded: Green Valley Farm',
    description: '120 growing beds registered to Sector B (Drip line calibration verified).',
    timestamp: '5 hours ago',
    iconName: 'Sprout',
    category: 'Farm Deployment',
  },
  {
    id: 'act-4',
    type: 'device',
    title: 'Gateway ESP32-Sector-04 reconnected',
    description: 'Telemetry heartbeat restored with 100% signal strength via LoRa/MQTT bridge.',
    timestamp: '8 hours ago',
    iconName: 'Radio',
    category: 'Device Management',
  },
];

export const SYSTEM_ALERTS = [
  {
    id: 'alt-1',
    severity: 'warning',
    title: 'Low Water Level Warning: Tank #3',
    message: 'Primary reservoir at 28% capacity at Solan Polyhouse. Water Runway estimated at 3.2 days.',
    timestamp: '15 mins ago',
  },
  {
    id: 'alt-2',
    severity: 'critical',
    title: 'Pump Runtime Limit Triggered: Zone 4',
    message: 'Scarcity safety interlock auto-halted pump #2 after 45-minute continuous run.',
    timestamp: '1 hour ago',
  },
  {
    id: 'alt-3',
    severity: 'info',
    title: 'ESP32 Firmware Update Available',
    message: 'OTA package v1.2 ready for 18 connected field telemetry nodes.',
    timestamp: '3 hours ago',
  },
];
