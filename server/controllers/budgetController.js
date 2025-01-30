const Budget = require('../models/Budget');

exports.getAllBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find().populate('activityId', 'title');
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getByActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    console.log('Fetching budgets for activity:', activityId);
    const budget = await Budget.findOne({ activityId });
    console.log('Found budget:', budget);

    if (!budget) {
      return res.json({
        activityId,
        items: [],
        summary: {
          twdTotal: '',
          thbTotal: '',
          exchangeRate: '',
          finalTotal: '',
          note: ''
        }
      });
    }
    res.json(budget);
  } catch (error) {
    console.error('Error in getByActivity:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.saveItems = async (req, res) => {
  try {
    const { activityId, items, summary } = req.body;
    console.log('Received data:', { activityId, items, summary });
    
    // 驗證數據
    if (!activityId || !Array.isArray(items)) {
      return res.status(400).json({ 
        message: '無效的資料格式',
        details: { hasActivityId: !!activityId, isItemsArray: Array.isArray(items) }
      });
    }
    
    // 驗證每個項目的必填欄位
    const invalidItems = items.filter(item => !item.item || !item.type);
    if (invalidItems.length > 0) {
      return res.status(400).json({
        message: '部分項目缺少必填欄位',
        invalidItems
      });
    }
    
    const budget = await Budget.findOneAndUpdate(
      { activityId },
      { 
        activityId,
        items,
        summary: summary || {
          twdTotal: '',
          thbTotal: '',
          exchangeRate: '',
          finalTotal: '',
          note: ''
        }
      },
      { new: true, upsert: true, overwrite: true }
    );
    
    console.log('Saved budget:', budget);
    res.json(budget);
  } catch (error) {
    console.error('Error in saveItems:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const budget = await Budget.findOneAndUpdate(
      { 'items._id': id },
      { $set: { 'items.$.status': status } },
      { new: true }
    );
    
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 