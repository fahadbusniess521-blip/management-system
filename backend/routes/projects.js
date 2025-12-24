const express = require('express');
const router = express.Router();
const { Project, User } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

// @route   GET /api/projects
// @desc    Get all projects
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { source, type, status, assignedMember } = req.query;
    let where = {};

    // Employee can only see assigned projects
    if (req.user.role === 'employee') {
      where.assignedMembers = { [Op.contains]: [req.user.id] };
    }

    if (source) where.source = { [Op.iLike]: `%${source}%` };
    if (type) where.type = type;
    if (status) where.status = status;
    if (assignedMember) where.assignedMembers = { [Op.contains]: [assignedMember] };

    const projects = await Project.findAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
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
    const totalProjects = await Project.count();
    const activeProjects = await Project.count({ where: { status: 'Ongoing' } });

    const statusBreakdown = await Project.findAll({
      attributes: [
        'status',
        [Project.sequelize.fn('COUNT', '*'), 'count'],
        [Project.sequelize.fn('SUM', Project.sequelize.col('budget')), 'totalBudget']
      ],
      group: ['status'],
      raw: true
    });

    const typeBreakdown = await Project.findAll({
      attributes: [
        'type',
        [Project.sequelize.fn('COUNT', '*'), 'count'],
        [Project.sequelize.fn('SUM', Project.sequelize.col('budget')), 'totalBudget']
      ],
      group: ['type'],
      raw: true
    });

    const sourceBreakdown = await Project.findAll({
      attributes: [
        'source',
        [Project.sequelize.fn('COUNT', '*'), 'count'],
        [Project.sequelize.fn('SUM', Project.sequelize.col('budget')), 'totalBudget']
      ],
      group: ['source'],
      order: [[Project.sequelize.fn('COUNT', '*'), 'DESC']],
      limit: 10,
      raw: true
    });

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
    const project = await Project.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if employee is assigned to this project
    if (req.user.role === 'employee') {
      const isAssigned = project.assignedMembers && project.assignedMembers.includes(req.user.id);
      if (!isAssigned) {
        return res.status(403).json({ message: 'Not authorized to view this project' });
      }
    }

    // Get assigned members details
    if (project.assignedMembers && project.assignedMembers.length > 0) {
      const members = await User.findAll({
        where: {
          id: { [Op.in]: project.assignedMembers }
        },
        attributes: ['id', 'name', 'email', 'role', 'phone']
      });
      project.dataValues.assignedMembersDetails = members;
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
    const projectData = {
      ...req.body,
      createdBy: req.user.id
    };

    // Ensure assignedMembers is an array of UUIDs
    if (projectData.assignedMembers && Array.isArray(projectData.assignedMembers)) {
      // Filter out any non-UUID values
      projectData.assignedMembers = projectData.assignedMembers.filter(id => {
        return typeof id === 'string' && id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      });
    }

    const project = await Project.create(projectData);

    const populatedProject = await Project.findByPk(project.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    // Get assigned members details
    if (populatedProject.assignedMembers && populatedProject.assignedMembers.length > 0) {
      const members = await User.findAll({
        where: {
          id: { [Op.in]: populatedProject.assignedMembers }
        },
        attributes: ['id', 'name', 'email', 'role']
      });
      populatedProject.dataValues.assignedMembersDetails = members;
    }

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
    const project = await Project.findByPk(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const updateData = { ...req.body };

    // Ensure assignedMembers is an array of UUIDs
    if (updateData.assignedMembers && Array.isArray(updateData.assignedMembers)) {
      updateData.assignedMembers = updateData.assignedMembers.filter(id => {
        return typeof id === 'string' && id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      });
    }

    await project.update(updateData);

    const updatedProject = await Project.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    // Get assigned members details
    if (updatedProject.assignedMembers && updatedProject.assignedMembers.length > 0) {
      const members = await User.findAll({
        where: {
          id: { [Op.in]: updatedProject.assignedMembers }
        },
        attributes: ['id', 'name', 'email', 'role']
      });
      updatedProject.dataValues.assignedMembersDetails = members;
    }

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.destroy();
    res.json({ message: 'Project removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
