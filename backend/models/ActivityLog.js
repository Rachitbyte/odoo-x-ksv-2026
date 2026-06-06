const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // system actions might not have user
  },
  action: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  entity_type: {
    type: DataTypes.STRING(50),
  },
  entity_id: {
    type: DataTypes.INTEGER,
  },
  metadata: {
    type: DataTypes.JSON,
  },
}, {
  tableName: 'activity_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = ActivityLog;
