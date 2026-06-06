const { PurchaseOrder, Vendor, sequelize } = require('../models');

exports.getVendorPerformance = async (req, res) => {
  try {
    // Count of POs and total amount per vendor
    const performance = await PurchaseOrder.findAll({
      attributes: [
        'vendor_id',
        [sequelize.fn('COUNT', sequelize.col('PurchaseOrder.id')), 'total_pos'],
        [sequelize.fn('SUM', sequelize.col('PurchaseOrder.total_amount')), 'total_spent']
      ],
      include: [{ model: Vendor, attributes: ['company_name', 'rating'] }],
      group: ['vendor_id', 'Vendor.id']
    });

    res.json({ success: true, data: performance, message: 'Vendor performance fetched' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMonthlySpending = async (req, res) => {
  try {
    // Basic grouping by month for MVP
    const spending = await PurchaseOrder.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('created_at')), 'month'],
        [sequelize.fn('YEAR', sequelize.col('created_at')), 'year'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_spent']
      ],
      group: [sequelize.fn('MONTH', sequelize.col('created_at')), sequelize.fn('YEAR', sequelize.col('created_at'))],
      order: [[sequelize.fn('YEAR', sequelize.col('created_at')), 'DESC'], [sequelize.fn('MONTH', sequelize.col('created_at')), 'DESC']]
    });

    res.json({ success: true, data: spending, message: 'Monthly spending fetched' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
