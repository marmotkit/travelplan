const Plan = require('../models/Plan');
const TripItem = require('../models/TripItem');
const Accommodation = require('../models/Accommodation');
const Budget = require('../models/Budget');
const TravelInfo = require('../models/TravelInfo');

exports.createPlan = async (req, res) => {
  try {
    console.log('Creating new plan...');
    console.log('User:', req.user);
    console.log('Request body:', req.body);
    
    const plan = new Plan(req.body);
    await plan.save();
    console.log('Plan created:', plan);
    
    res.status(201).json(plan);
  } catch (error) {
    console.error('Error creating plan:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.getPlans = async (req, res) => {
  try {
    console.log('Getting all plans...');
    console.log('User:', req.user);

    // 使用 lean() 來獲取純 JavaScript 對象
    const plans = await Plan.find().lean().sort({ createdAt: -1 });
    console.log('Found plans:', plans.length);
    console.log('Plans:', JSON.stringify(plans, null, 2));

    res.json(plans);
  } catch (error) {
    console.error('Error getting plans:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getPlan = async (req, res) => {
  try {
    console.log('Getting plan by ID...');
    console.log('User:', req.user);
    console.log('Plan ID:', req.params.id);
    
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      console.log('Plan not found:', req.params.id);
      return res.status(404).json({ message: '找不到該行程' });
    }
    console.log('Plan found:', plan);
    
    res.json(plan);
  } catch (error) {
    console.error('Error getting plan:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    console.log('Updating plan...');
    console.log('User:', req.user);
    console.log('Plan ID:', req.params.id);
    console.log('Request body:', req.body);
    
    const updateData = { ...req.body };
    console.log('Processing update with data:', updateData);
    
    const plan = await Plan.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!plan) {
      console.log('Plan not found:', req.params.id);
      return res.status(404).json({ message: '找不到該行程' });
    }
    console.log('Plan updated:', plan);
    
    res.json(plan);
  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    console.log('Deleting plan...');
    console.log('User:', req.user);
    console.log('Plan ID:', req.params.id);
    
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) {
      console.log('Plan not found:', req.params.id);
      return res.status(404).json({ message: '找不到該行程' });
    }
    console.log('Plan deleted:', plan);
    
    res.json({ message: '行程已刪除' });
  } catch (error) {
    console.error('Error deleting plan:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.downloadPDF = async (req, res) => {
  try {
    console.log('Downloading PDF...');
    console.log('User:', req.user);
    console.log('Plan ID:', req.params.id);
    
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
      console.log('Plan not found:', id);
      return res.status(404).json({ message: '找不到該活動' });
    }
    console.log('Plan found:', plan);
    
    // 將所有數據打包成一個對象
    const data = {
      plan,
      tripItems,
      accommodations,
      budgets: budgets?.items || [],
      travelInfo
    };
    console.log('Data:', JSON.stringify(data, null, 2));
    
    // 返回數據給前端
    res.json(data);

  } catch (error) {
    console.error('Error in downloadPDF:', error);
    res.status(500).json({ message: '獲取 PDF 數據失敗' });
  }
}; 