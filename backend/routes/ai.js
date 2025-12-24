const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/auth');
const { Investment, Expense, Project, User } = require('../models');
const { Op } = require('sequelize');

// @route   POST /api/ai/query
// @desc    Process natural language query with AI assistant
// @access  Private
router.post('/query', protect, async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    // Process query and fetch relevant data
    const result = await processQuery(query.toLowerCase(), req.user);

    // If Hugging Face API key is available, enhance response with AI
    if (process.env.HUGGINGFACE_API_KEY) {
      try {
        const aiResponse = await getAIResponse(query, result);
        result.aiResponse = aiResponse;
      } catch (aiError) {
        console.log('AI enhancement failed, returning data only:', aiError.message);
      }
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Process natural language queries
async function processQuery(query, user) {
  let data = null;
  let type = 'general';
  let message = '';

  // Project queries
  if (query.includes('project') || query.includes('projects')) {
    if (query.includes('from') || query.includes('by') || query.includes('brought')) {
      // Extract source name
      const sourceMatch = query.match(/(?:from|by|brought by)\s+([a-zA-Z\s&]+?)(?:\s|$|\.|\?)/i);
      if (sourceMatch) {
        const source = sourceMatch[1].trim();
        data = await Project.findAll({ 
          where: { 
            source: { [Op.iLike]: `%${source}%` }
          },
          include: [
            {
              model: User,
              as: 'creator',
              attributes: ['id', 'name', 'email']
            }
          ]
        });
        type = 'projects';
        message = `Found ${data.length} project(s) from "${source}"`;
      }
    } else if (query.includes('active') || query.includes('ongoing')) {
      data = await Project.findAll({ 
        where: { status: 'Ongoing' },
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email']
          }
        ]
      });
      type = 'projects';
      message = `Found ${data.length} active project(s)`;
    } else if (query.includes('completed')) {
      data = await Project.findAll({ 
        where: { status: 'Completed' },
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email']
          }
        ]
      });
      type = 'projects';
      message = `Found ${data.length} completed project(s)`;
    } else {
      data = await Project.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email']
          }
        ]
      });
      type = 'projects';
      message = `Showing recent projects`;
    }
  }
  
  // Investment queries
  else if (query.includes('investment') || query.includes('investments')) {
    if (query.includes('above') || query.includes('greater') || query.includes('>')) {
      const amountMatch = query.match(/(\d+[\d,]*)/);
      if (amountMatch) {
        const amount = parseInt(amountMatch[1].replace(/,/g, ''));
        data = await Investment.findAll({ 
          where: { amount: { [Op.gte]: amount } },
          include: [
            {
              model: User,
              as: 'creator',
              attributes: ['id', 'name', 'email']
            }
          ]
        });
        type = 'investments';
        message = `Found ${data.length} investment(s) above ${amount}`;
      }
    } else if (query.includes('active')) {
      data = await Investment.findAll({ 
        where: { status: 'Active' },
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email']
          }
        ]
      });
      type = 'investments';
      message = `Found ${data.length} active investment(s)`;
    } else {
      data = await Investment.findAll({
        limit: 10,
        order: [['date', 'DESC']],
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email']
          }
        ]
      });
      type = 'investments';
      message = `Showing recent investments`;
    }
  }
  
  // Expense queries
  else if (query.includes('expense') || query.includes('rent') || query.includes('paid')) {
    if (query.includes('rent')) {
      const monthMatch = query.match(/(january|february|march|april|may|june|july|august|september|october|november|december)/i);
      if (monthMatch) {
        const month = new Date(Date.parse(monthMatch[1] + " 1, 2023")).getMonth();
        const year = new Date().getFullYear();
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 1);
        
        data = await Expense.findAll({
          where: {
            category: 'Rent',
            date: {
              [Op.gte]: startDate,
              [Op.lt]: endDate
            }
          },
          include: [
            {
              model: User,
              as: 'creator',
              attributes: ['id', 'name', 'email']
            }
          ]
        });
        type = 'expenses';
        const total = data.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        message = `Total rent in ${monthMatch[1]}: $${total.toLocaleString()}`;
      } else {
        data = await Expense.findAll({ 
          where: { category: 'Rent' },
          limit: 10,
          order: [['date', 'DESC']],
          include: [
            {
              model: User,
              as: 'creator',
              attributes: ['id', 'name', 'email']
            }
          ]
        });
        type = 'expenses';
        message = `Showing rent expenses`;
      }
    } else if (query.includes('utility') || query.includes('utilities')) {
      data = await Expense.findAll({ 
        where: { category: 'Utility' },
        limit: 10,
        order: [['date', 'DESC']],
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email']
          }
        ]
      });
      type = 'expenses';
      message = `Showing utility expenses`;
    } else {
      data = await Expense.findAll({
        limit: 10,
        order: [['date', 'DESC']],
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email']
          }
        ]
      });
      type = 'expenses';
      message = `Showing recent expenses`;
    }
  }
  
  // User queries
  else if (query.includes('user') || query.includes('member') || query.includes('employee')) {
    data = await User.findAll({
      attributes: { exclude: ['password'] },
      limit: 20
    });
    type = 'users';
    message = `Found ${data.length} user(s)`;
  }
  
  // Summary queries
  else if (query.includes('summary') || query.includes('overview') || query.includes('dashboard')) {
    const totalInvestments = await Investment.sum('amount') || 0;
    const totalExpenses = await Expense.sum('amount') || 0;
    const projectCount = await Project.count();
    const activeProjects = await Project.count({ where: { status: 'Ongoing' } });
    const userCount = await User.count();
    
    data = {
      totalInvestments: parseFloat(totalInvestments),
      totalExpenses: parseFloat(totalExpenses),
      projectCount,
      activeProjects,
      userCount,
      netBalance: parseFloat(totalInvestments) - parseFloat(totalExpenses)
    };
    type = 'summary';
    message = 'Company overview summary';
  }
  
  else {
    message = 'I can help you with:\n- Projects (e.g., "Show projects from Nadeem & sons")\n- Investments (e.g., "List active investments above 100000")\n- Expenses (e.g., "How much rent in July?")\n- Users (e.g., "Show all members")\n- Summary (e.g., "Give me an overview")';
  }

  return { data, type, message, query };
}

// Get AI-enhanced response (optional, requires Hugging Face API key)
async function getAIResponse(query, queryResult) {
  try {
    const HF_API_URL = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';
    
    const prompt = `Query: ${query}\nData: ${JSON.stringify(queryResult.data)}\nProvide a helpful response.`;
    
    const response = await axios.post(
      HF_API_URL,
      { inputs: prompt },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    return response.data[0]?.generated_text || 'AI processing complete';
  } catch (error) {
    console.error('Hugging Face API error:', error.message);
    return null;
  }
}

module.exports = router;
