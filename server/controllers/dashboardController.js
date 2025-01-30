const Plan = require('../models/Plan');
const { BudgetSummary } = require('../models/Budget');

exports.getYearlyStats = async (req, res) => {
  try {
    console.log('Fetching yearly stats...');
    
    // 取得所有活動
    const activities = await Plan.find().lean();
    console.log('Found activities:', activities);

    // 按年份分組統計活動數量
    const activityStats = {};
    activities.forEach(activity => {
      try {
        if (activity.startDate) {
          const year = new Date(activity.startDate).getFullYear();
          if (!isNaN(year)) {
            activityStats[year] = (activityStats[year] || 0) + 1;
          }
        }
      } catch (err) {
        console.error('Error processing activity:', activity, err);
      }
    });
    console.log('Activity stats:', activityStats);

    // 取得所有預算總額
    const budgets = await BudgetSummary.find().populate({
      path: 'activityId',
      model: 'Plan',  // 明確指定 model
      select: 'startDate'
    }).lean();
    console.log('Found budgets:', budgets);

    // 按年份分組統計預算
    const budgetStats = {};
    budgets.forEach(budget => {
      try {
        if (budget.activityId?.startDate && budget.finalTotal) {
          const year = new Date(budget.activityId.startDate).getFullYear();
          if (!isNaN(year)) {
            const cleanAmount = budget.finalTotal.toString().replace(/[^0-9.-]+/g, '');
            const amount = parseFloat(cleanAmount);
            if (!isNaN(amount)) {
              budgetStats[year] = (budgetStats[year] || 0) + amount;
            }
          }
        }
      } catch (err) {
        console.error('Error processing budget:', budget, err);
      }
    });
    console.log('Budget stats:', budgetStats);

    // 取得當前年份
    const startYear = 2025;
    
    // 生成最近5年的年份列表（包含當前年份）
    const yearList = Array.from(
      { length: 5 }, 
      (_, i) => startYear - i
    );
    
    // 組合統計數據
    const stats = yearList.map(year => ({
      year,
      activityCount: activityStats[year] || 0,
      totalBudget: Math.round(budgetStats[year] || 0)
    }));

    console.log('Generated stats:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Error in getYearlyStats:', error);
    // 返回更詳細的錯誤信息
    res.status(500).json({ 
      message: '載入統計資料失敗',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    });
  }
}; 