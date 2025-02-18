const express = require('express');
const router = express.Router();
const itineraryController = require('../controllers/itineraryController');

router.get('/plan/:planId', itineraryController.getItinerary);
router.post('/', itineraryController.addItineraryItem);
router.put('/:id/item/:itemId', itineraryController.updateItineraryItem);
router.delete('/:id/item/:itemId', itineraryController.deleteItineraryItem);

module.exports = router; 