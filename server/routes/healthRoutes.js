const express = require('express');
const { getHealth, getDatabaseHealth } = require('../controllers/healthController');

const router = express.Router();

// GET /api/health
router.get('/health', getHealth);

// GET /api/health/database
router.get('/health/database', getDatabaseHealth);

module.exports = router;
