const express = require('express');
const router = express.Router();
const travelInfoController = require('../controllers/travelInfoController');

router.get('/activity/:activityId', travelInfoController.getByActivity);
router.put('/activity/:activityId', travelInfoController.update);

module.exports = router; 