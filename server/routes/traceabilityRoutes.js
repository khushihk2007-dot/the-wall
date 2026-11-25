const express = require('express');
const { getPublicPassport } = require('../controllers/traceabilityController');

const router = express.Router();

/**
 * Public Product Passport & Traceability Routes
 * Mounted at: /api/traceability
 *
 * All endpoints here are public for consumer verification via physical QR scan.
 */

// GET /api/traceability/:traceabilityId
router.get('/:traceabilityId', getPublicPassport);

// GET /api/traceability/passport/:traceabilityId
router.get('/passport/:traceabilityId', getPublicPassport);

module.exports = router;
