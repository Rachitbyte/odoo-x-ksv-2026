const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Approval = sequelize.define('Approval', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  quotation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reviewed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  remarks: {
    type: DataTypes.TEXT,
  },
  reviewed_at: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'approvals',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Approval;
