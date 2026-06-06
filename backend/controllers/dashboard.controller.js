const { RFQ, Approval, PurchaseOrder, Invoice } = require('../models');
const { Op, fn, col } = require('sequelize');

exports.getStats = async (req, res) => {
  try {
    const pendingApprovalsCount = await Approval.count({ where: { status: 'pending' } });
    const activeRFQsCount = await RFQ.count({ where: { status: ['open', 'under_review'] } });

    // Get beginning of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const posThisMonthCount = await PurchaseOrder.count({
      where: { created_at: { [Op.gte]: startOfMonth } }
    });

    const unpaidInvoicesCount = await Invoice.count({
      where: { status: { [Op.in]: ['generated', 'sent'] } }
    });

    // Monthly spending for last 6 months (using amount_due — correct field name)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    let monthlySpending = [];
    try {
      const monthlyRows = await Invoice.findAll({
        attributes: [
          [fn('YEAR', col('created_at')),  'year'],
          [fn('MONTH', col('created_at')), 'month'],
          [fn('SUM', col('amount_due')),   'total'],
        ],
        where: { created_at: { [Op.gte]: sixMonthsAgo } },
        group: [fn('YEAR', col('created_at')), fn('MONTH', col('created_at'))],
        order: [[fn('YEAR', col('created_at')), 'ASC'], [fn('MONTH', col('created_at')), 'ASC']],
        raw: true,
      });
      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      monthlySpending = monthlyRows.map(r => ({
        month: monthNames[parseInt(r.month, 10) - 1],
        amount: parseFloat(r.total) || 0,
      }));
    } catch (_) {
      // fallback: empty array — frontend uses mock data
    }

    // Recent RFQs (last 5)
    let recentRFQs = [];
    try {
      recentRFQs = await RFQ.findAll({
        limit: 5,
        order: [['created_at', 'DESC']],
        attributes: ['id', 'rfq_number', 'title', 'status', 'deadline'],
        raw: true,
      });
    } catch (_) {}

    // Overdue: invoices with status generated/sent (no due_date field, show all unpaid)
    let overdueInvoices = [];
    try {
      const overdueList = await Invoice.findAll({
        where: { status: { [Op.in]: ['generated', 'sent'] } },
        limit: 5,
        order: [['created_at', 'ASC']],
        raw: true,
      });
      overdueInvoices = overdueList.map((inv, i) => ({
        id: inv.id,
        invoice_number: inv.invoice_number,
        vendor: `Vendor #${inv.vendor_id}`,
        amount: parseFloat(inv.amount_due) || 0,
        days_overdue: Math.max(1, Math.floor((Date.now() - new Date(inv.created_at)) / (1000 * 60 * 60 * 24))),
      }));
    } catch (_) {}

    res.json({
      success: true,
      data: {
        pendingApprovals: pendingApprovalsCount,
        activeRFQs: activeRFQsCount,
        posThisMonth: posThisMonthCount,
        unpaidInvoices: unpaidInvoicesCount,
        monthlySpending,
        recentRFQs,
        overdueInvoices,
      },
      message: 'Dashboard stats fetched successfully',
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
