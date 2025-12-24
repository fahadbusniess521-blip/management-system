const express = require('express');
const router = express.Router();
const { Investment, User } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

// @route   GET /api/investments
// @desc    Get all investments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { source, status, startDate, endDate } = req.query;
    let where = {};

    if (source) where.source = { [Op.iLike]: `%${source}%` };
    if (status) where.status = status;
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = new Date(startDate);
      if (endDate) where.date[Op.lte] = new Date(endDate);
    }

    const investments = await Investment.findAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['date', 'DESC']]
    });
    
    res.json(investments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/investments/stats
// @desc    Get investment statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const totalInvestment = await Investment.sum('amount') || 0;

    const statusBreakdown = await Investment.findAll({
      attributes: [
        'status',
        [Investment.sequelize.fn('SUM', Investment.sequelize.col('amount')), 'total'],
        [Investment.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const monthlyTrends = await Investment.findAll({
      attributes: [
        [Investment.sequelize.fn('DATE_TRUNC', 'month', Investment.sequelize.col('date')), 'month'],
        [Investment.sequelize.fn('SUM', Investment.sequelize.col('amount')), 'total']
      ],
      group: [Investment.sequelize.fn('DATE_TRUNC', 'month', Investment.sequelize.col('date'))],
      order: [[Investment.sequelize.fn('DATE_TRUNC', 'month', Investment.sequelize.col('date')), 'ASC']],
      raw: true
    });

    res.json({
      totalInvestment,
      statusBreakdown,
      monthlyTrends
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/investments/:id
// @desc    Get investment by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const investment = await Investment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    res.json(investment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/investments
// @desc    Create investment
// @access  Private (Admin, Manager)
router.post('/', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const investment = await Investment.create({
      ...req.body,
      createdBy: req.user.id
    });

    const populatedInvestment = await Investment.findByPk(investment.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(201).json(populatedInvestment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/investments/:id
// @desc    Update investment
// @access  Private (Admin, Manager)
router.put('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const investment = await Investment.findByPk(req.params.id);
    
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    await investment.update(req.body);

    const updatedInvestment = await Investment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json(updatedInvestment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/investments/:id
// @desc    Delete investment
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const investment = await Investment.findByPk(req.params.id);
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    await investment.destroy();
    res.json({ message: 'Investment removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
