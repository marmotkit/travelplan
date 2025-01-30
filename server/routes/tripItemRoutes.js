const express = require('express');
const router = express.Router();
const tripItemController = require('../controllers/tripItemController');

router.post('/', tripItemController.createMany);
router.get('/activity/:activityId', tripItemController.getByActivity);

module.exports = router; 