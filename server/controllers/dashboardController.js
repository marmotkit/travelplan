const Plan = require('../models/Plan');
const Budget = require('../models/Budget');

exports.getYearlyStats = async (req, res) => {
  try {
    console.log('Getting yearly stats...');
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    // 獲取年度活動統計
    const activities = await Plan.find({
      startDate: { $gte: startDate, $lte: endDate }
    });

    console.log('Found activities:', activities.length);

    // 獲取年度預算統計
    const activityIds = activities.map(a => a._id);
    
    // 根據活動 ID 獲取預算
    const budgets = await Budget.find({
      activityId: { $in: activityIds }
    });

    console.log('Found budgets:', budgets.length);

    // 計算總預算
    const totalBudget = budgets.reduce((sum, budget) => {
      // 使用預算管理中的總費用合計
      if (budget.summary && budget.summary.finalTotal) {
        const amount = parseFloat(budget.summary.finalTotal.toString().replace(/[^0-9.-]+/g, ''));
        return sum + (isNaN(amount) ? 0 : amount);
      }
      return sum;
    }, 0);

    console.log('Total budget calculation:', {
      budgetCount: budgets.length,
      totalBudget,
      budgetSummaries: budgets.map(b => ({
        activityId: b.activityId,
        finalTotal: b.summary?.finalTotal
      }))
    });

    // 計算統計數據
    const stats = {
      totalActivities: activities.length,
      plannedActivities: activities.filter(a => a.status === 'planning').length,
      ongoingActivities: activities.filter(a => a.status === 'ongoing').length,
      completedActivities: activities.filter(a => a.status === 'completed').length,
      totalBudget
    };

    console.log('Calculated stats:', stats);
    res.json(stats);
    
  } catch (error) {
    console.error('Error in getYearlyStats:', error);
    res.status(500).json({ message: error.message });
  }
}; 