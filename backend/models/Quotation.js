const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quotation = sequelize.define('Quotation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  rfq_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  total_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  delivery_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM('submitted', 'under_comparison', 'selected', 'rejected'),
    defaultValue: 'submitted',
  },
}, {
  tableName: 'quotations',
  timestamps: true,
  createdAt: 'submitted_at',
  updatedAt: 'updated_at',
});

module.exports = Quotation;
