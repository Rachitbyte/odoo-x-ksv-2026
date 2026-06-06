const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  invoice_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  po_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount_due: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('generated', 'sent', 'paid'),
    defaultValue: 'generated',
  },
  sent_at: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'invoices',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  hooks: {
    beforeValidate: async (invoice) => {
      if (!invoice.invoice_number) {
        const year = new Date().getFullYear();
        invoice.invoice_number = `INV-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    }
  }
});

module.exports = Invoice;
