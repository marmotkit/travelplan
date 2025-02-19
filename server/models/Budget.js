const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  items: [{
    type: {
      type: String,
      enum: ['固定支出', '觀光活動'],
      required: true
    },
    item: {
      type: String,
      required: true
    },
    amount: String,
    currency: {
      type: String,
      enum: ['TWD', 'THB'],
      default: 'TWD'
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'na'],
      default: 'pending'
    },
    note: String
  }],
  summary: {
    twdTotal: String,
    thbTotal: String,
    exchangeRate: String,
    finalTotal: String,
    note: String
  }
}, {
  timestamps: true,
  collection: 'budgets'  // 指定集合名稱
});

module.exports = mongoose.model('Budget', budgetSchema); 