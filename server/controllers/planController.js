const Plan = require('../models/Plan');
const TripItem = require('../models/TripItem');
const Accommodation = require('../models/Accommodation');
const Budget = require('../models/Budget');
const TravelInfo = require('../models/TravelInfo');

// 添加調試日誌
const logResponse = (req, res, next) => {
  const oldJson = res.json;
  res.json = function(data) {
    console.log('Response headers:', res.getHeaders());
    console.log('Response data:', data);
    return oldJson.apply(res, arguments);
  };
  next();
};

exports.createPlan = async (req, res) => {
  try {
    const plan = new Plan(req.body);
    await plan.save();
    res.status(201)
       .type('application/json')
       .json(plan);
  } catch (error) {
    res.status(400)
       .type('application/json')
       .json({ message: error.message });
  }
};

exports.getPlans = async (req, res) => {
  try {
    console.log('Getting plans...');
    const plans = await Plan.find().sort({ createdAt: -1 });
    console.log('Plans found:', plans);
    res.type('application/json')
       .json(plans);
  } catch (error) {
    console.error('Error getting plans:', error);
    res.status(500)
       .type('application/json')
       .json({ message: error.message });
  }
};

exports.getPlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404)
                .type('application/json')
                .json({ message: '找不到該行程' });
    }
    res.type('application/json')
       .json(plan);
  } catch (error) {
    res.status(500)
       .type('application/json')
       .json({ message: error.message });
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
      return res.status(404)
                .type('application/json')
                .json({ message: '找不到該行程' });
    }
    res.type('application/json')
       .json(plan);
  } catch (error) {
    console.error('Update error:', error);
    res.status(400)
       .type('application/json')
       .json({ message: error.message });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404)
                .type('application/json')
                .json({ message: '找不到該行程' });
    }
    res.type('application/json')
       .json({ message: '行程已刪除' });
  } catch (error) {
    res.status(500)
       .type('application/json')
       .json({ message: error.message });
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
      return res.status(404)
                .type('application/json')
                .json({ message: '找不到該活動' });
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
    res.type('application/json')
       .json(data);

  } catch (error) {
    console.error('Error in downloadPDF:', error);
    res.status(500)
       .type('application/json')
       .json({ message: '獲取 PDF 數據失敗' });
  }
};