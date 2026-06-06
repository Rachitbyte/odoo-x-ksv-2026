const { PurchaseOrder, Vendor, Approval, sequelize } = require('../models');

exports.getVendorPerformance = async (req, res) => {
  try {
    // Count of POs and total amount per vendor
    const performance = await PurchaseOrder.findAll({
      attributes: [
        'vendor_id',
        [sequelize.fn('COUNT', sequelize.col('PurchaseOrder.id')), 'total_pos'],
        [sequelize.fn('SUM', sequelize.col('PurchaseOrder.total_amount')), 'total_spent']
      ],
      include: [{ model: Vendor, attributes: ['company_name', 'category', 'rating'] }],
      group: ['vendor_id', 'Vendor.id']
    });

    const formattedPerformance = performance.map(item => {
      const vendor = item.Vendor || {};
      return {
        id: item.vendor_id,
        name: vendor.company_name || 'Unknown',
        category: vendor.category || 'N/A',
        orders_fulfilled: Number(item.getDataValue('total_pos')) || 0,
        total_spend: Number(item.getDataValue('total_spent')) || 0,
        avg_rating: vendor.rating ? Number(vendor.rating) : 0
      };
    });

    res.json({ success: true, data: formattedPerformance, message: 'Vendor performance fetched' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMonthlySpending = async (req, res) => {
  try {
    const spending = await PurchaseOrder.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('created_at')), 'month_num'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_spent']
      ],
      group: [sequelize.fn('MONTH', sequelize.col('created_at'))],
      order: [[sequelize.fn('MONTH', sequelize.col('created_at')), 'ASC']]
    });

    const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Initialize all months with 0 so the chart has data for the entire year
    const formattedSpending = monthNames.slice(1).map(name => ({
      month: name,
      amount: 0
    }));

    spending.forEach(item => {
      const monthNum = item.getDataValue('month_num');
      const totalSpent = Number(item.getDataValue('total_spent')) || 0;
      if (monthNum >= 1 && monthNum <= 12) {
        formattedSpending[monthNum - 1].amount = totalSpent;
      }
    });

    res.json({ success: true, data: formattedSpending, message: 'Monthly spending fetched' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getProcurementTrends = async (req, res) => {
  try {
    const trends = await PurchaseOrder.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('created_at')), 'month_num'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'po_count']
      ],
      group: [sequelize.fn('MONTH', sequelize.col('created_at'))],
      order: [[sequelize.fn('MONTH', sequelize.col('created_at')), 'ASC']]
    });

    const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedTrends = monthNames.slice(1).map(name => ({
      month: name,
      count: 0
    }));

    trends.forEach(item => {
      const monthNum = item.getDataValue('month_num');
      const count = Number(item.getDataValue('po_count')) || 0;
      if (monthNum >= 1 && monthNum <= 12) {
        formattedTrends[monthNum - 1].count = count;
      }
    });

    res.json({ success: true, data: formattedTrends, message: 'Procurement trends fetched' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getApprovalStats = async (req, res) => {
  try {
    const stats = await Approval.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const formattedStats = {
      pending: 0,
      approved: 0,
      rejected: 0
    };

    stats.forEach(item => {
      const status = item.getDataValue('status');
      const count = Number(item.getDataValue('count')) || 0;
      if (status in formattedStats) {
        formattedStats[status] = count;
      }
    });

    res.json({ success: true, data: formattedStats, message: 'Approval stats fetched' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
