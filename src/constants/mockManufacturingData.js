/**
 * Mock Data for The Wall - Manufacturing Management (Module 2)
 * Centralized dataset representing growing-bed production batches, material inputs,
 * stages, and manufacturing history.
 * 
 * NOTE: Tagged as [Demo / Simulated Data] for transparency.
 */

export const MANUFACTURING_STAGES = [
  'Raw Material Preparation',
  'Mixing and Layering',
  'Compression and Forming',
  'Drying and Curing',
  'Quality Testing',
  'Completed',
];

export const INITIAL_BATCHES = [
  {
    id: 'TW-BATCH-2026-039',
    createdAt: '2026-11-24',
    expectedCompletion: '2026-11-30',
    quantity: 120,
    stage: 'Compression and Forming',
    status: 'In Progress',
    materials: {
      cottonKg: 36,
      coirKg: 54,
      mediumKg: 30,
      binder: 'Organic starch binder (2.5 kg)',
    },
    notes: 'Optimized 40/60 cotton-to-coir structural bottom layer for high-drainage seedling nursery trials.',
    history: [
      {
        stage: 'Raw Material Preparation',
        timestamp: '2026-11-24 08:30',
        note: 'Fibers combed, graded and inspected for zero synthetic residue.',
      },
      {
        stage: 'Mixing and Layering',
        timestamp: '2026-11-24 14:15',
        note: 'Dual-layer formation completed: nutrient top mix overlaid onto fiber base.',
      },
      {
        stage: 'Compression and Forming',
        timestamp: '2026-11-25 09:00',
        note: 'Hydraulic press cycle initiated at 1.8 MPa pressure.',
      },
    ],
  },
  {
    id: 'TW-BATCH-2026-038',
    createdAt: '2026-11-22',
    expectedCompletion: '2026-11-27',
    quantity: 150,
    stage: 'Drying and Curing',
    status: 'In Progress',
    materials: {
      cottonKg: 45,
      coirKg: 65,
      mediumKg: 40,
      binder: 'Natural plant resin (3.0 kg)',
    },
    notes: 'Standard thickness 35mm bed with enhanced root penetration aeration channels.',
    history: [
      {
        stage: 'Raw Material Preparation',
        timestamp: '2026-11-22 09:00',
        note: 'Coir pith washed and de-salted (EC < 0.5 mS/cm).',
      },
      {
        stage: 'Mixing and Layering',
        timestamp: '2026-11-22 15:30',
        note: 'Even distribution across 150 forming trays.',
      },
      {
        stage: 'Compression and Forming',
        timestamp: '2026-11-23 11:00',
        note: 'Target density achieved at 180 kg/m³.',
      },
      {
        stage: 'Drying and Curing',
        timestamp: '2026-11-24 10:00',
        note: 'Dehumidification tunnel temperature set to 48°C.',
      },
    ],
  },
  {
    id: 'TW-BATCH-2026-037',
    createdAt: '2026-11-21',
    expectedCompletion: '2026-11-26',
    quantity: 100,
    stage: 'Quality Testing',
    status: 'In Progress',
    materials: {
      cottonKg: 30,
      coirKg: 45,
      mediumKg: 25,
      binder: 'Bio-starch compound (2.0 kg)',
    },
    notes: 'Batch destined for Solan Smart Polyhouse commercial cucumber cultivation.',
    history: [
      {
        stage: 'Raw Material Preparation',
        timestamp: '2026-11-21 08:00',
        note: 'Raw materials certified organic standard.',
      },
      {
        stage: 'Mixing and Layering',
        timestamp: '2026-11-21 13:00',
        note: 'Layering calibrated at 15mm top / 20mm bottom.',
      },
      {
        stage: 'Compression and Forming',
        timestamp: '2026-11-22 09:30',
        note: 'Forming press cycle passed.',
      },
      {
        stage: 'Drying and Curing',
        timestamp: '2026-11-23 08:00',
        note: 'Residual moisture verified below 12%.',
      },
      {
        stage: 'Quality Testing',
        timestamp: '2026-11-25 08:30',
        note: 'Water absorption test chamber sample logged.',
      },
    ],
  },
  {
    id: 'TW-BATCH-2026-036',
    createdAt: '2026-11-18',
    expectedCompletion: '2026-11-23',
    quantity: 200,
    stage: 'Completed',
    status: 'Completed',
    materials: {
      cottonKg: 60,
      coirKg: 90,
      mediumKg: 50,
      binder: 'Eco-polyester bio binder (4.0 kg)',
    },
    notes: 'Full production batch passed laboratory QA inspection. Grade A certified.',
    history: [
      { stage: 'Raw Material Preparation', timestamp: '2026-11-18 09:00', note: 'Fibers weighed and conditioned.' },
      { stage: 'Mixing and Layering', timestamp: '2026-11-18 16:00', note: 'Automated conveyor layering.' },
      { stage: 'Compression and Forming', timestamp: '2026-11-19 10:30', note: 'Cold-press compaction.' },
      { stage: 'Drying and Curing', timestamp: '2026-11-20 09:00', note: 'Curing completed with 10.8% moisture.' },
      { stage: 'Quality Testing', timestamp: '2026-11-22 14:00', note: '422% absorption, 79.5% retention. Grade A.' },
      { stage: 'Completed', timestamp: '2026-11-23 11:00', note: 'QR passports generated and packaged.' },
    ],
  },
  {
    id: 'TW-BATCH-2026-035',
    createdAt: '2026-11-15',
    expectedCompletion: '2026-11-20',
    quantity: 180,
    stage: 'Completed',
    status: 'Completed',
    materials: {
      cottonKg: 54,
      coirKg: 80,
      mediumKg: 46,
      binder: 'Cornstarch matrix (3.6 kg)',
    },
    notes: 'Delivered to Green Valley Farm Sector A.',
    history: [
      { stage: 'Raw Material Preparation', timestamp: '2026-11-15 08:30', note: 'Materials staged.' },
      { stage: 'Mixing and Layering', timestamp: '2026-11-15 14:00', note: 'Mixing completed.' },
      { stage: 'Compression and Forming', timestamp: '2026-11-16 11:00', note: 'Compression complete.' },
      { stage: 'Drying and Curing', timestamp: '2026-11-17 09:30', note: 'Drying complete.' },
      { stage: 'Quality Testing', timestamp: '2026-11-19 10:00', note: 'Quality test passed.' },
      { stage: 'Completed', timestamp: '2026-11-20 15:00', note: 'Batch archived.' },
    ],
  },
  {
    id: 'TW-BATCH-2026-034',
    createdAt: '2026-11-12',
    expectedCompletion: '2026-11-17',
    quantity: 130,
    stage: 'Completed',
    status: 'Completed',
    materials: {
      cottonKg: 40,
      coirKg: 60,
      mediumKg: 30,
      binder: 'Natural resin (2.6 kg)',
    },
    notes: 'Low-density lightweight variant for strawberry vertical towers.',
    history: [
      { stage: 'Raw Material Preparation', timestamp: '2026-11-12 09:00', note: 'Material prep finished.' },
      { stage: 'Mixing and Layering', timestamp: '2026-11-12 15:00', note: 'Layering completed.' },
      { stage: 'Compression and Forming', timestamp: '2026-11-13 10:00', note: 'Low-pressure compression.' },
      { stage: 'Drying and Curing', timestamp: '2026-11-14 09:00', note: 'Solar curing dome.' },
      { stage: 'Quality Testing', timestamp: '2026-11-16 11:30', note: 'Absorption verified.' },
      { stage: 'Completed', timestamp: '2026-11-17 14:00', note: 'Dispatched to customer.' },
    ],
  },
];
