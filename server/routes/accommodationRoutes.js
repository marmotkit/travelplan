const express = require('express');
const router = express.Router();
const accommodationController = require('../controllers/accommodationController');
const { auth } = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');
const Accommodation = require('../models/accommodation');

router.use(auth);  // 所有路由都需要認證

// 批量處理路由要放在具體 ID 路由之前
router.post('/batch', accommodationController.createMany);
router.get('/activity/:activityId', accommodationController.getByActivity);

// 基本 CRUD 路由
router.get('/', async (req, res) => {
  try {
    const accommodations = await Accommodation.find();
    res.json(accommodations);
  } catch (error) {
    res.status(500).json({ message: '獲取住宿列表失敗', error: error.message });
  }
});
router.post('/', accommodationController.createAccommodation);
router.put('/:id', accommodationController.updateAccommodation);
router.delete('/:id', accommodationController.deleteAccommodation);
router.patch('/:id/status', accommodationController.updateStatus);

module.exports = router; 