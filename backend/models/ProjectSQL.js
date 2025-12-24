const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  source: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Who brought or referred the project'
  },
  type: {
    type: DataTypes.ENUM('Client', 'Internal', 'Government'),
    allowNull: false
  },
  budget: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  assignedMembers: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: [],
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Ongoing', 'Completed', 'On Hold'),
    defaultValue: 'Pending'
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'projects',
  timestamps: true
});

module.exports = Project;
