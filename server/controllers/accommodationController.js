const Accommodation = require('../models/Accommodation');

exports.createMany = async (req, res) => {
  try {
    const { activityId, items } = req.body;
    
    if (!activityId || !items || !Array.isArray(items)) {
      return res.status(400).json({ message: '無效的資料格式' });
    }

    await Accommodation.deleteMany({ activityId });
    const savedItems = await Accommodation.insertMany(
      items.map(item => ({
        ...item,
        activityId
      }))
    );
    res.status(201).json(savedItems);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getByActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    console.log('Fetching accommodations for activity:', activityId);
    
    const accommodations = await Accommodation.find({ activityId })
      .sort({ checkIn: 1 })  // 按入住日期排序
      .lean();
    
    console.log('Found accommodations:', accommodations);
    res.json(accommodations);
  } catch (error) {
    console.error('Error in getByActivity:', error);
    res.status(500).json({ 
      message: error.message,
      details: error.stack 
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