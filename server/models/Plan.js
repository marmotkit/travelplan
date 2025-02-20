const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['planning', 'scheduled', 'ongoing', 'completed'],
    default: 'planning'
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  budget: {
    type: Number,
    default: 0
  },
  participants: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  collection: 'plans'  // 指定集合名稱
});

module.exports = mongoose.model('Plan', planSchema);