const { Budget, BudgetSummary } = require('../models/Budget');

exports.createMany = async (req, res) => {
  try {
    const { activityId, items, summary } = req.body;
    console.log('Received request:', { activityId, items, summary });
    
    if (!activityId || !items || !Array.isArray(items)) {
      return res.status(400).json({ 
        message: '無效的資料格式',
        received: { activityId, items }
      });
    }

    // 驗證每個項目的格式
    const validItems = items.map(item => ({
      activityId,
      type: item.type || '固定支出',
      item: item.item || '',
      amount: item.amount || '',
      currency: item.currency || 'TWD',
      status: item.status || 'pending',
      note: item.note || ''
    })).filter(item => item.item && item.type);

    if (validItems.length === 0) {
      return res.status(400).json({ 
        message: '沒有有效的預算項目',
        received: { items, validItems }
      });
    }

    // 儲存預算項目
    await Budget.deleteMany({ activityId });
    const savedItems = await Budget.insertMany(validItems);

    // 儲存總費用備註
    if (summary) {
      await BudgetSummary.findOneAndUpdate(
        { activityId },
        { 
          activityId,
          twdTotal: summary.twdTotal || '',
          thbTotal: summary.thbTotal || '',
          exchangeRate: summary.exchangeRate || '',
          finalTotal: summary.finalTotal || '',
          note: summary.note || ''
        },
        { upsert: true, new: true }
      );
    }

    res.status(201).json({
      message: '儲存成功',
      items: savedItems
    });
  } catch (error) {
    console.error('Error in createMany:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.stack,
      received: req.body
    });
  }
};

exports.getByActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const items = await Budget.find({ activityId });
    const summary = await BudgetSummary.findOne({ activityId });
    res.json({ items, summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const budget = await Budget.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    res.json(budget);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 