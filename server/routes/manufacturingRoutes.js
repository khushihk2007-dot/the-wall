const express = require('express');
const {
  getBatches,
  getBatchById,
  createBatch,
  advanceBatchStage,
} = require('../controllers/manufacturingController');

const router = express.Router();

/**
 * Manufacturing Batch Routes
 * Mounted at: /api/manufacturing/batches
 */

// GET /api/manufacturing/batches
router.get('/', getBatches);

// GET /api/manufacturing/batches/:batchId
router.get('/:batchId', getBatchById);

// POST /api/manufacturing/batches
router.post('/', createBatch);

// PATCH /api/manufacturing/batches/:batchId/stage
router.patch('/:batchId/stage', advanceBatchStage);

module.exports = router;
