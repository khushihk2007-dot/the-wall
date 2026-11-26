const express = require('express');
const { getQcTests, recordQcTest } = require('../controllers/qcController');
const { requireAdminAuth, requireWriteAuth } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Quality Control Routes (Administrative)
 * Mounted at: /api/qc
 */

router.get('/tests', requireAdminAuth, getQcTests);
router.post('/tests', requireWriteAuth, recordQcTest);

module.exports = router;
