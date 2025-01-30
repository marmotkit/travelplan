const Accommodation = require('../models/Accommodation');

exports.createMany = async (req, res) => {
  try {
    const { activityId, items } = req.body;
    
    console.log('Received batch create request:', {
      activityId,
      itemsCount: items?.length,
      items
    });

    if (!activityId || !items || !Array.isArray(items)) {
      console.error('Invalid request data:', req.body);
      return res.status(400).json({ 
        message: '無效的資料格式',
        details: {
          hasActivityId: !!activityId,
          hasItems: !!items,
          isItemsArray: Array.isArray(items)
        }
      });
    }

    // 驗證每個項目的必填欄位
    const invalidItems = items.filter(item => 
      !item.hotel || !item.address || !item.dateRange
    );

    if (invalidItems.length > 0) {
      console.error('Invalid items found:', invalidItems);
      return res.status(400).json({
        message: '部分資料缺少必填欄位',
        invalidItems
      });
    }

    // 先刪除該活動的所有住宿記錄
    await Accommodation.deleteMany({ activityId });

    // 添加活動ID到每個項目
    const itemsWithActivity = items.map(item => ({
      activityId,
      hotel: item.hotel || item['住宿'],
      address: item.address || item['地址'],
      dateRange: item.dateRange || item['日期'],
      status: (item.status || item['訂房狀態'] || 'pending').toLowerCase()
    }));

    console.log('Processed items:', itemsWithActivity);

    // 驗證所有項目
    for (const item of itemsWithActivity) {
      const accommodation = new Accommodation(item);
      await accommodation.validate();
    }

    const savedItems = await Accommodation.insertMany(itemsWithActivity);
    console.log('Saved items count:', savedItems.length);

    res.status(201).json(savedItems);
  } catch (error) {
    console.error('Error in createMany:', error);
    res.status(500).json({ 
      message: '批量創建失敗',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.getByActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    console.log('Fetching accommodations for activity:', activityId);
    
    const accommodations = await Accommodation.find({ activityId })
      .sort({ dateRange: 1 })  // 按日期排序
      .lean();
    
    console.log('Found accommodations:', accommodations);
    res.json(accommodations);
  } catch (error) {
    console.error('Error in getByActivity:', error);
    res.status(500).json({ 
      message: '獲取活動住宿列表失敗',
      error: error.message 
    });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const accommodation = await Accommodation.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    res.json(accommodation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllAccommodations = async (req, res) => {
  try {
    const accommodations = await Accommodation.find()
      .populate('activityId', 'title');
    res.json(accommodations);
  } catch (error) {
    console.error('獲取住宿列表失敗:', error);
    res.status(500).json({ message: '獲取住宿列表失敗' });
  }
};

exports.createAccommodation = async (req, res) => {
  try {
    const accommodation = new Accommodation(req.body);
    await accommodation.save();
    res.status(201).json(accommodation);
  } catch (error) {
    console.error('創建住宿失敗:', error);
    res.status(500).json({ message: '創建住宿失敗' });
  }
};

exports.updateAccommodation = async (req, res) => {
  try {
    const accommodation = await Accommodation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!accommodation) {
      return res.status(404).json({ message: '找不到該住宿' });
    }
    res.json(accommodation);
  } catch (error) {
    console.error('更新住宿失敗:', error);
    res.status(500).json({ message: '更新住宿失敗' });
  }
};

exports.deleteAccommodation = async (req, res) => {
  try {
    const accommodation = await Accommodation.findByIdAndDelete(req.params.id);
    if (!accommodation) {
      return res.status(404).json({ message: '找不到該住宿' });
    }
    res.json({ message: '刪除成功' });
  } catch (error) {
    console.error('刪除住宿失敗:', error);
    res.status(500).json({ message: '刪除住宿失敗' });
  }
}; 