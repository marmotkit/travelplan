const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');

router.post('/', planController.createPlan);
router.get('/', planController.getPlans);
router.get('/:id', planController.getPlan);
router.put('/:id', planController.updatePlan);
router.delete('/:id', planController.deletePlan);
router.get('/:id/pdf', planController.downloadPDF);

module.exports = router; 