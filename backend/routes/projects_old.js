const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/projects
// @desc    Get all projects
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { source, type, status, assignedMember } = req.query;
    let query = {};

    // Employee can only see assigned projects
    if (req.user.role === 'employee') {
      query.assignedMembers = req.user._id;
    }

    if (source) query.source = new RegExp(source, 'i');
    if (type) query.type = type;
    if (status) query.status = status;
    if (assignedMember) query.assignedMembers = assignedMember;

    const projects = await Project.find(query)
      .populate('assignedMembers', 'name email role')
      .populate('createdBy', 'name email')
      .sort('-createdAt');
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/projects/stats
// @desc    Get project statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'Ongoing' });

    const statusBreakdown = await Project.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, totalBudget: { $sum: '$budget' } } }
    ]);

    const typeBreakdown = await Project.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 }, totalBudget: { $sum: '$budget' } } }
    ]);

    const sourceBreakdown = await Project.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 }, totalBudget: { $sum: '$budget' } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalProjects,
      activeProjects,
      statusBreakdown,
      typeBreakdown,
      sourceBreakdown
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('assignedMembers', 'name email role phone')
      .populate('createdBy', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if employee is assigned to this project
    if (req.user.role === 'employee') {
      const isAssigned = project.assignedMembers.some(
        member => member._id.toString() === req.user._id.toString()
      );
      if (!isAssigned) {
        return res.status(403).json({ message: 'Not authorized to view this project' });
      }
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/projects
// @desc    Create project
// @access  Private (Admin, Manager)
router.post('/', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const project = await Project.create({
      ...req.body,
      createdBy: req.user._id
    });

    const populatedProject = await Project.findById(project._id)
      .populate('assignedMembers', 'name email role')
      .populate('createdBy', 'name email');

    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (Admin, Manager)
router.put('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedMembers', 'name email role')
     .populate('createdBy', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.deleteOne();
    res.json({ message: 'Project removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
