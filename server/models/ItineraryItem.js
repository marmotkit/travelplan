const mongoose = require('mongoose');

const itineraryItemSchema = new mongoose.Schema({
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  items: [{
    type: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'activity', 'accommodation', 'other'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    time: String,
    location: String,
    notes: String,
    cost: {
      amount: Number,
      currency: {
        type: String,
        enum: ['TWD', 'THB'],
        default: 'TWD'
      }
    }
  }],
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('ItineraryItem', itineraryItemSchema); 