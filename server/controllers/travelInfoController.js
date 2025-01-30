const TravelInfo = require('../models/TravelInfo');

exports.getByActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const info = await TravelInfo.findOne({ activityId });
    res.json(info || { activityId, expenses: {}, notices: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { expenses, notices } = req.body;
    
    const info = await TravelInfo.findOneAndUpdate(
      { activityId },
      { expenses, notices },
      { new: true, upsert: true }
    );
    
    res.json(info);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 