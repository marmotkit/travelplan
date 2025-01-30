const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');

router.post('/', budgetController.createMany);
router.get('/activity/:activityId', budgetController.getByActivity);
router.patch('/:id/status', budgetController.updateStatus);

module.exports = router; 