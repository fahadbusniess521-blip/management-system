const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/auth');
const Investment = require('../models/Investment');
const Expense = require('../models/Expense');
const Project = require('../models/Project');
const User = require('../models/User');

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
      const sourceMatch = query.match(/(?:from|by|brought by)\s+([a-zA-Z\s]+?)(?:\s|$|\.|\?)/i);
      if (sourceMatch) {
        const source = sourceMatch[1].trim();
        data = await Project.find({ 
          source: new RegExp(source, 'i') 
        }).populate('assignedMembers', 'name email');
        type = 'projects';
        message = `Found ${data.length} project(s) from "${source}"`;
      }
    } else if (query.includes('active') || query.includes('ongoing')) {
      data = await Project.find({ status: 'Ongoing' })
        .populate('assignedMembers', 'name email');
      type = 'projects';
      message = `Found ${data.length} active project(s)`;
    } else if (query.includes('completed')) {
      data = await Project.find({ status: 'Completed' })
        .populate('assignedMembers', 'name email');
      type = 'projects';
      message = `Found ${data.length} completed project(s)`;
    } else {
      data = await Project.find()
        .populate('assignedMembers', 'name email')
        .limit(10);
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
        data = await Investment.find({ amount: { $gte: amount } });
        type = 'investments';
        message = `Found ${data.length} investment(s) above ${amount}`;
      }
    } else if (query.includes('active')) {
      data = await Investment.find({ status: 'Active' });
      type = 'investments';
      message = `Found ${data.length} active investment(s)`;
    } else {
      data = await Investment.find().limit(10);
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
        data = await Expense.find({
          category: 'Rent',
          date: {
            $gte: new Date(year, month, 1),
            $lt: new Date(year, month + 1, 1)
          }
        });
        type = 'expenses';
        const total = data.reduce((sum, exp) => sum + exp.amount, 0);
        message = `Total rent in ${monthMatch[1]}: ${total}`;
      } else {
        data = await Expense.find({ category: 'Rent' }).limit(10);
        type = 'expenses';
        message = `Showing rent expenses`;
      }
    } else if (query.includes('utility') || query.includes('utilities')) {
      data = await Expense.find({ category: 'Utility' }).limit(10);
      type = 'expenses';
      message = `Showing utility expenses`;
    } else {
      data = await Expense.find().limit(10);
      type = 'expenses';
      message = `Showing recent expenses`;
    }
  }
  
  // User queries
  else if (query.includes('user') || query.includes('member') || query.includes('employee')) {
    data = await User.find().select('-password').limit(20);
    type = 'users';
    message = `Found ${data.length} user(s)`;
  }
  
  // Summary queries
  else if (query.includes('summary') || query.includes('overview') || query.includes('dashboard')) {
    const totalInvestments = await Investment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalExpenses = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const projectCount = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'Ongoing' });
    const userCount = await User.countDocuments();
    
    data = {
      totalInvestments: totalInvestments[0]?.total || 0,
      totalExpenses: totalExpenses[0]?.total || 0,
      projectCount,
      activeProjects,
      userCount
    };
    type = 'summary';
    message = 'Company overview summary';
  }
  
  else {
    message = 'I can help you with:\n- Projects (e.g., "Show projects from Ali Khan")\n- Investments (e.g., "List active investments above 100000")\n- Expenses (e.g., "How much rent in July?")\n- Users (e.g., "Show all members")\n- Summary (e.g., "Give me an overview")';
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
