const mongoose = require('mongoose');

const accommodationSchema = new mongoose.Schema({
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true
  },
  dateRange: {
    type: String,
    required: true
  },
  hotel: {
    type: String,
    required: true
  },
  address: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'booked', 'cancelled'],
    default: 'pending'
  },
  note: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Accommodation', accommodationSchema); 