const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', budgetController.getAllBudgets);
router.get('/activity/:activityId', budgetController.getByActivity);
router.post('/batch', budgetController.saveItems);
router.patch('/:id/status', budgetController.updateStatus);

module.exports = router; 