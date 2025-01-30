const mongoose = require('mongoose');

const accommodationSchema = new mongoose.Schema({
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  hotel: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  dateRange: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'booked', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Accommodation', accommodationSchema); 