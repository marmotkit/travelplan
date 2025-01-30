const Plan = require('../models/Plan');
const TripItem = require('../models/TripItem');
const Accommodation = require('../models/Accommodation');
const Budget = require('../models/Budget');
const TravelInfo = require('../models/TravelInfo');

exports.createPlan = async (req, res) => {
  try {
    const plan = new Plan(req.body);
    await plan.save();
    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: '找不到該行程' });
    }
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    console.log('Update request body:', req.body);
    const updateData = { ...req.body };
    console.log('Processing update with data:', updateData);
    const plan = await Plan.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    console.log('Updated plan:', plan);
    if (!plan) {
      return res.status(404).json({ message: '找不到該行程' });
    }
    res.json(plan);
  } catch (error) {
    console.error('Update error:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: '找不到該行程' });
    }
    res.json({ message: '行程已刪除' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.downloadPDF = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 獲取所有相關數據
    const [plan, tripItems, accommodations, budgets, travelInfo] = await Promise.all([
      Plan.findById(id),
      TripItem.find({ activityId: id }),
      Accommodation.find({ activityId: id }),
      Budget.findOne({ activityId: id }),
      TravelInfo.findOne({ activityId: id })
    ]);

    if (!plan) {
      return res.status(404).json({ message: '找不到該活動' });
    }

    // 將所有數據打包成一個對象
    const data = {
      plan,
      tripItems,
      accommodations,
      budgets: budgets?.items || [],
      travelInfo
    };

    // 返回數據給前端
    res.json(data);

  } catch (error) {
    console.error('Error in downloadPDF:', error);
    res.status(500).json({ message: '獲取 PDF 數據失敗' });
  }
}; 