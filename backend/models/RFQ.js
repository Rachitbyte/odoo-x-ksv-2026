const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RFQ = sequelize.define('RFQ', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  rfq_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  unit: {
    type: DataTypes.STRING(50),
  },
  deadline: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('draft', 'open', 'under_review', 'approved', 'rejected', 'closed'),
    defaultValue: 'draft',
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'rfqs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeValidate: async (rfq) => {
      if (!rfq.rfq_number) {
        const year = new Date().getFullYear();
        // A simple way to generate unique number: RFQ-YYYY-TIMESTAMP
        // In a real app, you would query the latest id, but we don't have transaction locks here easily
        const timestamp = Date.now().toString().slice(-4); 
        // For hackathon, let's use a random pad or query max ID
        // To keep it simple and sync:
        rfq.rfq_number = `RFQ-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    }
  }
});

module.exports = RFQ;
