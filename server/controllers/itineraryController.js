const ItineraryItem = require('../models/ItineraryItem');
const Plan = require('../models/Plan');

exports.getItinerary = async (req, res) => {
  try {
    const { planId } = req.params;
    const itinerary = await ItineraryItem.find({ planId })
      .sort({ date: 1 });
    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addItineraryItem = async (req, res) => {
  try {
    const { planId, date, items } = req.body;
    
    // 檢查是否已存在該日期的行程
    let itineraryItem = await ItineraryItem.findOne({
      planId,
      date: new Date(date)
    });

    if (itineraryItem) {
      // 如果存在，更新項目
      itineraryItem.items.push(...items);
      await itineraryItem.save();
    } else {
      // 如果不存在，創建新的
      itineraryItem = new ItineraryItem({
        planId,
        date: new Date(date),
        items
      });
      await itineraryItem.save();
    }

    res.status(201).json(itineraryItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateItineraryItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const updateData = req.body;

    const itineraryItem = await ItineraryItem.findOneAndUpdate(
      { 
        _id: id,
        'items._id': itemId 
      },
      {
        $set: {
          'items.$': updateData
        }
      },
      { new: true }
    );

    res.json(itineraryItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteItineraryItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    
    await ItineraryItem.findByIdAndUpdate(
      id,
      {
        $pull: {
          items: { _id: itemId }
        }
      }
    );

    res.json({ message: '項目已刪除' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 