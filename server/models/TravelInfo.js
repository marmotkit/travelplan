const mongoose = require('mongoose');

const travelInfoSchema = new mongoose.Schema({
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  expenses: {
    cash: {
      note: String
    },
    creditCard: {
      recommendations: [String]
    }
  },
  notices: String
}, {
  timestamps: true
});

module.exports = mongoose.model('TravelInfo', travelInfoSchema); 