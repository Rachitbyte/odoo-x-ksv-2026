const { RFQ, Approval, PurchaseOrder, Invoice } = require('../models');

exports.getStats = async (req, res) => {
  try {
    const pendingApprovalsCount = await Approval.count({ where: { status: 'pending' } });
    const activeRFQsCount = await RFQ.count({ where: { status: ['open', 'under_review'] } });
    
    // Get beginning of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const posThisMonthCount = await PurchaseOrder.count({
      where: {
        created_at: {
          [require('sequelize').Op.gte]: startOfMonth
        }
      }
    });

    const unpaidInvoicesCount = await Invoice.count({ where: { status: ['generated', 'sent'] } });

    res.json({
      success: true,
      data: {
        pendingApprovals: pendingApprovalsCount,
        activeRFQs: activeRFQsCount,
        posThisMonth: posThisMonthCount,
        unpaidInvoices: unpaidInvoicesCount
      },
      message: 'Dashboard stats fetched successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
