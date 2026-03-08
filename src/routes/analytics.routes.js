const express = require('express');
const analyticsController = require('../controllers/analytics.controller');

const router = express.Router();

// Building analytics (admin)
// GET /api/admin/building/:id
router.get('/admin/building/:id', analyticsController.getBuildingAnalytics);

module.exports = router;

