const TripItem = require('../models/TripItem');

exports.createMany = async (req, res) => {
  try {
    const { activityId, items } = req.body;
    console.log('Received data:', { activityId, items });
    
    if (!activityId || !items || !Array.isArray(items)) {
      return res.status(400).json({ 
        message: '無效的資料格式',
        received: { activityId, items }
      });
    }

    const tripItems = items.flatMap(dateGroup => {
      if (!dateGroup?.date || !Array.isArray(dateGroup?.activities)) {
        console.error('Invalid dateGroup:', dateGroup);
        return [];
      }
      return dateGroup.activities.map(activity => {
        if (!activity?.activity) {
          console.error('Invalid activity:', activity);
          return null;
        }
        return {
          activityId,
          date: dateGroup.date,
          activity: activity.activity,
          cost: activity.cost || ''
        };
      }).filter(Boolean);
    });
    
    if (tripItems.length === 0) {
      return res.status(400).json({ 
        message: '沒有有效的行程項目',
        received: { activityId, items }
      });
    }

    await TripItem.deleteMany({ activityId });
    const savedItems = await TripItem.insertMany(tripItems);
    res.status(201).json(savedItems);
  } catch (error) {
    console.error('Server error:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.stack,
      data: { activityId: req.body.activityId, items: req.body.items }
    });
  }
};

exports.getByActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    console.log('Fetching trip items for activity:', activityId);
    
    const items = await TripItem.find({ activityId })
      .sort({ date: 1 })
      .lean();  // 使用 lean() 提高效能
    
    console.log('Found trip items:', items);
    res.json(items);
  } catch (error) {
    console.error('Error in getByActivity:', error);
    res.status(500).json({ 
      message: error.message,
      details: error.stack 
    });
  }
}; 