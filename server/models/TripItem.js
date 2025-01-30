const mongoose = require('mongoose');

const tripItemSchema = new mongoose.Schema({
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  activity: {
    type: String,
    required: true
  },
  cost: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TripItem', tripItemSchema); 