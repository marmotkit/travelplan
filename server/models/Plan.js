const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true,
    get: v => v ? v.toISOString().split('T')[0] : null,
    set: v => v ? new Date(v + 'T00:00:00.000Z') : null
  },
  endDate: {
    type: Date,
    required: true,
    get: v => v ? v.toISOString().split('T')[0] : null,
    set: v => v ? new Date(v + 'T00:00:00.000Z') : null
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

planSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Plan', planSchema); 