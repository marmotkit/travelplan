const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/yearly-stats', dashboardController.getYearlyStats);

module.exports = router; 