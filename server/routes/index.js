const express = require('express');
const healthRoutes = require('./healthRoutes');
const manufacturingRoutes = require('./manufacturingRoutes');
const traceabilityRoutes = require('./traceabilityRoutes');

const router = express.Router();

// Mount health routes under /api
router.use('/', healthRoutes);

// Mount manufacturing routes under /api/manufacturing/batches
router.use('/manufacturing/batches', manufacturingRoutes);

// Mount public traceability routes under /api/traceability
router.use('/traceability', traceabilityRoutes);

module.exports = router;
