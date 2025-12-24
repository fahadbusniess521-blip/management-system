const { sequelize } = require('../config/database');
const User = require('./UserSQL');
const Investment = require('./InvestmentSQL');
const Expense = require('./ExpenseSQL');
const Project = require('./ProjectSQL');

// Define associations
User.hasMany(Investment, { foreignKey: 'createdBy', as: 'investments' });
Investment.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

User.hasMany(Expense, { foreignKey: 'createdBy', as: 'expenses' });
Expense.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

User.hasMany(Project, { foreignKey: 'createdBy', as: 'projects' });
Project.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

module.exports = {
  sequelize,
  User,
  Investment,
  Expense,
  Project
};
