const sequelize = require('../config/database');
const User = require('./User');
const Vendor = require('./Vendor');
const RFQ = require('./RFQ');
const Quotation = require('./Quotation');
const Approval = require('./Approval');
const PurchaseOrder = require('./PurchaseOrder');
const Invoice = require('./Invoice');
const ActivityLog = require('./ActivityLog');

// Define Associations

// Users
User.hasMany(RFQ, { foreignKey: 'created_by' });
RFQ.belongsTo(User, { foreignKey: 'created_by', as: 'Creator' });

User.hasMany(ActivityLog, { foreignKey: 'user_id' });
ActivityLog.belongsTo(User, { foreignKey: 'user_id' });

// Vendors
User.hasOne(Vendor, { foreignKey: 'user_id' });
Vendor.belongsTo(User, { foreignKey: 'user_id' });

Vendor.hasMany(Quotation, { foreignKey: 'vendor_id' });
Quotation.belongsTo(Vendor, { foreignKey: 'vendor_id' });

// RFQs and Vendors (Many-to-Many via RFQ_Vendors)
const RFQ_Vendors = sequelize.define('RFQ_Vendors', {
  id: {
    type: require('sequelize').DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  notified_at: {
    type: require('sequelize').DataTypes.DATE,
  }
}, {
  tableName: 'rfq_vendors',
  timestamps: false
});

RFQ.belongsToMany(Vendor, { through: RFQ_Vendors, foreignKey: 'rfq_id' });
Vendor.belongsToMany(RFQ, { through: RFQ_Vendors, foreignKey: 'vendor_id' });

// Quotations
RFQ.hasMany(Quotation, { foreignKey: 'rfq_id' });
Quotation.belongsTo(RFQ, { foreignKey: 'rfq_id' });

// Approvals
Quotation.hasOne(Approval, { foreignKey: 'quotation_id' });
Approval.belongsTo(Quotation, { foreignKey: 'quotation_id' });

User.hasMany(Approval, { foreignKey: 'reviewed_by' });
Approval.belongsTo(User, { foreignKey: 'reviewed_by', as: 'Reviewer' });

// Purchase Orders
Quotation.hasOne(PurchaseOrder, { foreignKey: 'quotation_id' });
PurchaseOrder.belongsTo(Quotation, { foreignKey: 'quotation_id' });

RFQ.hasMany(PurchaseOrder, { foreignKey: 'rfq_id' });
PurchaseOrder.belongsTo(RFQ, { foreignKey: 'rfq_id' });

Vendor.hasMany(PurchaseOrder, { foreignKey: 'vendor_id' });
PurchaseOrder.belongsTo(Vendor, { foreignKey: 'vendor_id' });

// Invoices
PurchaseOrder.hasOne(Invoice, { foreignKey: 'po_id' });
Invoice.belongsTo(PurchaseOrder, { foreignKey: 'po_id' });

Vendor.hasMany(Invoice, { foreignKey: 'vendor_id' });
Invoice.belongsTo(Vendor, { foreignKey: 'vendor_id' });

module.exports = {
  sequelize,
  User,
  Vendor,
  RFQ,
  RFQ_Vendors,
  Quotation,
  Approval,
  PurchaseOrder,
  Invoice,
  ActivityLog
};
