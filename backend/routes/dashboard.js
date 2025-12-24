const express = require('express');
const router = express.Router();
const { User, Project, Investment, Expense } = require('../models');
const { protect } = require('../middleware/auth');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalProjects = await Project.count();
    const activeProjects = await Project.count({ where: { status: 'Ongoing' } });
    const totalInvestment = await Investment.sum('amount') || 0;
    const totalExpense = await Expense.sum('amount') || 0;

    const recentProjects = await Project.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    const recentInvestments = await Investment.findAll({
      limit: 5,
      order: [['date', 'DESC']],
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    const recentExpenses = await Expense.findAll({
      limit: 5,
      order: [['date', 'DESC']],
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({
      summary: {
        totalUsers,
        totalProjects,
        activeProjects,
        totalInvestments: parseFloat(totalInvestment),
        totalExpenses: parseFloat(totalExpense),
        netBalance: parseFloat(totalInvestment) - parseFloat(totalExpense)
      },
      recentActivities: {
        projects: recentProjects.map(p => ({
          name: p.name,
          createdBy: p.creator
        })),
        investments: recentInvestments.map(i => ({
          source: i.source,
          amount: i.amount,
          createdBy: i.creator
        })),
        expenses: recentExpenses.map(e => ({
          name: e.name,
          amount: e.amount,
          category: e.category,
          createdBy: e.creator
        }))
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/dashboard/charts
// @desc    Get dashboard charts data
// @access  Private
router.get('/charts', protect, async (req, res) => {
  try {
    const projectsByStatus = await Project.findAll({
      attributes: [
        'status',
        [Project.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const investmentsByStatus = await Investment.findAll({
      attributes: [
        'status',
        [Investment.sequelize.fn('SUM', Investment.sequelize.col('amount')), 'total']
      ],
      group: ['status'],
      raw: true
    });

    const expensesByCategory = await Expense.findAll({
      attributes: [
        'category',
        [Expense.sequelize.fn('SUM', Expense.sequelize.col('amount')), 'total']
      ],
      group: ['category'],
      raw: true
    });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyInvestments = await Investment.findAll({
      attributes: [
        [Investment.sequelize.fn('DATE_TRUNC', 'month', Investment.sequelize.col('date')), 'month'],
        [Investment.sequelize.fn('SUM', Investment.sequelize.col('amount')), 'total']
      ],
      where: {
        date: { [require('sequelize').Op.gte]: sixMonthsAgo }
      },
      group: [Investment.sequelize.fn('DATE_TRUNC', 'month', Investment.sequelize.col('date'))],
      order: [[Investment.sequelize.fn('DATE_TRUNC', 'month', Investment.sequelize.col('date')), 'ASC']],
      raw: true
    });

    const monthlyExpenses = await Expense.findAll({
      attributes: [
        [Expense.sequelize.fn('DATE_TRUNC', 'month', Expense.sequelize.col('date')), 'month'],
        [Expense.sequelize.fn('SUM', Expense.sequelize.col('amount')), 'total']
      ],
      where: {
        date: { [require('sequelize').Op.gte]: sixMonthsAgo }
      },
      group: [Expense.sequelize.fn('DATE_TRUNC', 'month', Expense.sequelize.col('date'))],
      order: [[Expense.sequelize.fn('DATE_TRUNC', 'month', Expense.sequelize.col('date')), 'ASC']],
      raw: true
    });

    // Transform data to match frontend expectations
    const expenseByCategory = expensesByCategory.map(e => ({
      _id: e.category,
      total: parseFloat(e.total) || 0
    }));

    const projectByStatus = projectsByStatus.map(p => ({
      _id: p.status,
      count: parseInt(p.count) || 0
    }));

    // Merge monthly data for comparison chart
    const monthlyMap = {};
    
    monthlyInvestments.forEach(item => {
      const date = new Date(item.month);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      monthlyMap[key] = {
        month: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear(),
        investments: parseFloat(item.total) || 0,
        expenses: 0
      };
    });

    monthlyExpenses.forEach(item => {
      const date = new Date(item.month);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (monthlyMap[key]) {
        monthlyMap[key].expenses = parseFloat(item.total) || 0;
      } else {
        monthlyMap[key] = {
          month: date.toLocaleString('default', { month: 'short' }),
          year: date.getFullYear(),
          investments: 0,
          expenses: parseFloat(item.total) || 0
        };
      }
    });

    const monthlyComparison = Object.values(monthlyMap).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(a.month) -
             ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(b.month);
    });

    res.json({
      projectByStatus,
      investmentsByStatus,
      expenseByCategory,
      monthlyComparison
    });
  } catch (error) {
    console.error('Dashboard charts error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/dashboard
// @desc    Get all dashboard data (combined)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.count();
    const totalProjects = await Project.count();
    const activeProjects = await Project.count({ where: { status: 'Ongoing' } });
    const totalInvestment = await Investment.sum('amount') || 0;
    const totalExpense = await Expense.sum('amount') || 0;

    // Get recent projects
    const recentProjects = await Project.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    // Get recent investments
    const recentInvestments = await Investment.findAll({
      limit: 5,
      order: [['date', 'DESC']],
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    // Get recent expenses
    const recentExpenses = await Expense.findAll({
      limit: 5,
      order: [['date', 'DESC']],
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    // Project status distribution
    const projectsByStatus = await Project.findAll({
      attributes: [
        'status',
        [Project.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // Investment by status
    const investmentsByStatus = await Investment.findAll({
      attributes: [
        'status',
        [Investment.sequelize.fn('SUM', Investment.sequelize.col('amount')), 'total']
      ],
      group: ['status'],
      raw: true
    });

    // Expenses by category
    const expensesByCategory = await Expense.findAll({
      attributes: [
        'category',
        [Expense.sequelize.fn('SUM', Expense.sequelize.col('amount')), 'total']
      ],
      group: ['category'],
      raw: true
    });

    // Monthly trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyInvestments = await Investment.findAll({
      attributes: [
        [Investment.sequelize.fn('DATE_TRUNC', 'month', Investment.sequelize.col('date')), 'month'],
        [Investment.sequelize.fn('SUM', Investment.sequelize.col('amount')), 'total']
      ],
      where: {
        date: { [require('sequelize').Op.gte]: sixMonthsAgo }
      },
      group: [Investment.sequelize.fn('DATE_TRUNC', 'month', Investment.sequelize.col('date'))],
      order: [[Investment.sequelize.fn('DATE_TRUNC', 'month', Investment.sequelize.col('date')), 'ASC']],
      raw: true
    });

    const monthlyExpenses = await Expense.findAll({
      attributes: [
        [Expense.sequelize.fn('DATE_TRUNC', 'month', Expense.sequelize.col('date')), 'month'],
        [Expense.sequelize.fn('SUM', Expense.sequelize.col('amount')), 'total']
      ],
      where: {
        date: { [require('sequelize').Op.gte]: sixMonthsAgo }
      },
      group: [Expense.sequelize.fn('DATE_TRUNC', 'month', Expense.sequelize.col('date'))],
      order: [[Expense.sequelize.fn('DATE_TRUNC', 'month', Expense.sequelize.col('date')), 'ASC']],
      raw: true
    });

    res.json({
      summary: {
        totalUsers,
        totalProjects,
        activeProjects,
        totalInvestment,
        totalExpense,
        netBalance: totalInvestment - totalExpense
      },
      recentProjects,
      recentInvestments,
      recentExpenses,
      charts: {
        projectsByStatus,
        investmentsByStatus,
        expensesByCategory,
        monthlyInvestments,
        monthlyExpenses
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
