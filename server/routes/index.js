const express = require('express');
const healthRoutes = require('./healthRoutes');
const manufacturingRoutes = require('./manufacturingRoutes');

const router = express.Router();

// Mount health routes under /api
router.use('/', healthRoutes);

// Mount manufacturing routes under /api/manufacturing/batches
router.use('/manufacturing/batches', manufacturingRoutes);

module.exports = router;
