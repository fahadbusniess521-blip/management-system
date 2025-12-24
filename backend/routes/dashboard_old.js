const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Investment = require('../models/Investment');
const Expense = require('../models/Expense');
const Project = require('../models/Project');
const User = require('../models/User');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    // Total investments
    const totalInvestments = await Investment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Total expenses
    const totalExpenses = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Project statistics
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'Ongoing' });
    const completedProjects = await Project.countDocuments({ status: 'Completed' });

    // User statistics
    const totalUsers = await User.countDocuments({ isActive: true });

    // Recent activities
    const recentInvestments = await Investment.find()
      .sort('-createdAt')
      .limit(5)
      .populate('createdBy', 'name');

    const recentExpenses = await Expense.find()
      .sort('-createdAt')
      .limit(5)
      .populate('createdBy', 'name');

    const recentProjects = await Project.find()
      .sort('-createdAt')
      .limit(5)
      .populate('createdBy', 'name')
      .populate('assignedMembers', 'name');

    res.json({
      summary: {
        totalInvestments: totalInvestments[0]?.total || 0,
        totalExpenses: totalExpenses[0]?.total || 0,
        netBalance: (totalInvestments[0]?.total || 0) - (totalExpenses[0]?.total || 0),
        totalProjects,
        activeProjects,
        completedProjects,
        totalUsers
      },
      recentActivities: {
        investments: recentInvestments,
        expenses: recentExpenses,
        projects: recentProjects
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/dashboard/charts
// @desc    Get data for dashboard charts
// @access  Private
router.get('/charts', protect, async (req, res) => {
  try {
    // Monthly investment vs expense comparison
    const monthlyComparison = await getMonthlyComparison();

    // Expense breakdown by category
    const expenseByCategory = await Expense.aggregate([
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    // Project distribution by type
    const projectByType = await Project.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 }, totalBudget: { $sum: '$budget' } } }
    ]);

    // Project distribution by status
    const projectByStatus = await Project.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Top project sources
    const topSources = await Project.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 }, totalBudget: { $sum: '$budget' } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Investment status breakdown
    const investmentByStatus = await Investment.aggregate([
      { $group: { _id: '$status', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    res.json({
      monthlyComparison,
      expenseByCategory,
      projectByType,
      projectByStatus,
      topSources,
      investmentByStatus
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to get monthly comparison data
async function getMonthlyComparison() {
  const investments = await Investment.aggregate([
    {
      $group: {
        _id: { 
          year: { $year: '$date' }, 
          month: { $month: '$date' } 
        },
        total: { $sum: '$amount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 }
  ]);

  const expenses = await Expense.aggregate([
    {
      $group: {
        _id: { 
          year: { $year: '$date' }, 
          month: { $month: '$date' } 
        },
        total: { $sum: '$amount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 }
  ]);

  // Merge data by month
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const comparison = [];

  const investmentMap = new Map(
    investments.map(i => [`${i._id.year}-${i._id.month}`, i.total])
  );
  
  const expenseMap = new Map(
    expenses.map(e => [`${e._id.year}-${e._id.month}`, e.total])
  );

  // Get last 12 months
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    comparison.push({
      month: monthNames[date.getMonth()],
      year: date.getFullYear(),
      investments: investmentMap.get(key) || 0,
      expenses: expenseMap.get(key) || 0
    });
  }

  return comparison;
}

module.exports = router;
