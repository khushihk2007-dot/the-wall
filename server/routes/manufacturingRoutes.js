const express = require('express');
const {
  getBatches,
  getBatchById,
  createBatch,
  advanceBatchStage,
} = require('../controllers/manufacturingController');
const {
  requireAdminAuth,
  requireWriteAuth,
} = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Manufacturing Batch Routes (Administrative)
 * Mounted at: /api/manufacturing/batches
 *
 * In production:
 * - GET /: Restricted administrative listing (requires admin auth in production)
 * - GET /:batchId: Restricted administrative batch details (requires admin auth in production)
 * - POST /: Restricted write operation (requires admin auth in production)
 * - PATCH /:batchId/stage: Restricted stage advancement (requires admin auth in production)
 *
 * In local development:
 * - Full functionality is preserved for developer workflows.
 */

// GET /api/manufacturing/batches (Administrative list)
router.get('/', requireAdminAuth, getBatches);

// GET /api/manufacturing/batches/:batchId (Administrative detail)
router.get('/:batchId', requireAdminAuth, getBatchById);

// POST /api/manufacturing/batches (Protected write)
router.post('/', requireWriteAuth, createBatch);

// PATCH /api/manufacturing/batches/:batchId/stage (Protected write)
router.patch('/:batchId/stage', requireWriteAuth, advanceBatchStage);

module.exports = router;
