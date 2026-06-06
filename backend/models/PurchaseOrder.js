const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  po_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  quotation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rfq_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  tax_percent: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 18.00,
  },
  tax_amount: {
    type: DataTypes.DECIMAL(12, 2),
  },
  total_amount: {
    type: DataTypes.DECIMAL(12, 2),
  },
  status: {
    type: DataTypes.ENUM('generated', 'invoice_raised'),
    defaultValue: 'generated',
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'purchase_orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  hooks: {
    beforeValidate: async (po) => {
      if (!po.po_number) {
        const year = new Date().getFullYear();
        const timestamp = Date.now().toString().slice(-4);
        po.po_number = `PO-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    }
  }
});

module.exports = PurchaseOrder;
