const express = require('express');
const router = express.Router();
const { Investment, User } = require('../models');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/investments
// @desc    Get all investments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { source, status, startDate, endDate } = req.query;
    let query = {};

    if (source) query.source = new RegExp(source, 'i');
    if (status) query.status = status;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const investments = await Investment.find(query)
      .populate('createdBy', 'name email')
      .sort('-date');
    
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
    const totalInvestment = await Investment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const statusBreakdown = await Investment.aggregate([
      { $group: { _id: '$status', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    const monthlyTrends = await Investment.aggregate([
      {
        $group: {
          _id: { 
            year: { $year: '$date' }, 
            month: { $month: '$date' } 
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      totalInvestment: totalInvestment[0]?.total || 0,
      statusBreakdown,
      monthlyTrends
    });
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
      createdBy: req.user._id
    });

    res.status(201).json(investment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/investments/:id
// @desc    Update investment
// @access  Private (Admin, Manager)
router.put('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const investment = await Investment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    res.json(investment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/investments/:id
// @desc    Delete investment
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    await investment.deleteOne();
    res.json({ message: 'Investment removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
