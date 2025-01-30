const express = require('express');
const router = express.Router();
const accommodationController = require('../controllers/accommodationController');

router.post('/', accommodationController.createMany);
router.get('/activity/:activityId', accommodationController.getByActivity);
router.patch('/:id/status', accommodationController.updateStatus);

module.exports = router; 