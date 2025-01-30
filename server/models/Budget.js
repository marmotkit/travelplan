const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['固定支出', '觀光活動'],
    required: true
  },
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true
  },
  item: {
    type: String,
    required: true
  },
  amount: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    enum: ['TWD', 'THB'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'na'],
    default: 'pending'
  },
  note: {
    type: String
  }
}, {
  timestamps: true
});

// 總費用備註
const budgetSummarySchema = new mongoose.Schema({
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true,
    unique: true
  },
  twdTotal: String,
  thbTotal: String,
  exchangeRate: String,
  finalTotal: String,
  note: String
}, {
  timestamps: true
});

const Budget = mongoose.model('Budget', budgetSchema);
const BudgetSummary = mongoose.model('BudgetSummary', budgetSummarySchema);

module.exports = { Budget, BudgetSummary }; 