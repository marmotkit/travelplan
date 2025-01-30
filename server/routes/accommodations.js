const express = require('express');
const router = express.Router();
const Accommodation = require('../models/Accommodation');

// 獲取特定活動的所有住宿
router.get('/activity/:activityId', async (req, res) => {
  try {
    const accommodations = await Accommodation.find({ activityId: req.params.activityId });
    res.json(accommodations);
  } catch (error) {
    res.status(500).json({ message: '獲取住宿資料失敗', error: error.message });
  }
});

// 新增住宿
router.post('/', async (req, res) => {
  try {
    const { activityId, items } = req.body;
    const savedItems = await Accommodation.insertMany(
      items.map(item => ({ ...item, activityId }))
    );
    res.json(savedItems);
  } catch (error) {
    res.status(500).json({ message: '新增住宿失敗', error: error.message });
  }
});

// 更新住宿狀態
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await Accommodation.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: '更新狀態失敗', error: error.message });
  }
});

// 刪除住宿
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Accommodation.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ message: '找不到該住宿資料' });
    }
    
    res.json({ message: '刪除成功' });
  } catch (error) {
    console.error('Error deleting accommodation:', error);
    res.status(500).json({ message: '刪除失敗', error: error.message });
  }
});

module.exports = router; 