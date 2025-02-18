const express = require('express');
const router = express.Router();
const accommodationController = require('../controllers/accommodationController');
const { auth, adminOnly } = require('../middleware/auth');

router.use(auth);  // 所有路由都需要認證

// 批量處理路由要放在具體 ID 路由之前
router.post('/batch', accommodationController.createMany);
router.get('/activity/:activityId', accommodationController.getByActivity);

// 基本 CRUD 路由
router.get('/', accommodationController.getAllAccommodations);
router.post('/', accommodationController.createAccommodation);
router.put('/:id', accommodationController.updateAccommodation);
router.delete('/:id', accommodationController.deleteAccommodation);
router.patch('/:id/status', accommodationController.updateStatus);

module.exports = router; 