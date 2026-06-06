const { Approval, Quotation, RFQ, PurchaseOrder, Vendor } = require('../models');
const logActivity = require('../utils/activityLogger');
const { Op } = require('sequelize');

exports.getApprovals = async (req, res) => {
  try {
    const status = req.query.status || 'pending';
    const approvals = await Approval.findAll({
      where: { status },
      include: [
        {
          model: Quotation,
          include: [
            { model: RFQ },
            { model: Vendor, attributes: ['company_name', 'rating'] }
          ]
        }
      ]
    });

    const formattedApprovals = approvals.map(approval => {
      const quotation = approval.Quotation || {};
      const rfq = quotation.RFQ || {};
      const vendor = quotation.Vendor || {};

      return {
        id: approval.id,
        quotation_id: quotation.id,
        rfq_title: rfq.title || 'Untitled RFQ',
        vendor_name: vendor.company_name || 'Unknown Vendor',
        vendor_rating: vendor.rating ? Number(vendor.rating) : 0,
        total_price: quotation.total_price ? Number(quotation.total_price) : 0,
        submitted_at: quotation.submitted_at ? new Date(quotation.submitted_at).toISOString().split('T')[0] : '',
        delivery_days: quotation.delivery_days || 0,
        status: approval.status,
        remarks: approval.remarks || '',
        chain: [
          { role: 'Procurement Officer', status: 'approved', date: approval.created_at ? new Date(approval.created_at).toISOString().split('T')[0] : '' },
          { role: 'Department Manager', status: approval.status, date: approval.reviewed_at ? new Date(approval.reviewed_at).toISOString().split('T')[0] : null }
        ]
      };
    });

    res.json({ success: true, data: formattedApprovals, message: 'Approvals fetched successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.submitForApproval = async (req, res) => {
  try {
    const quotationId = req.params.quotationId;
    const quotation = await Quotation.findByPk(quotationId);
    
    if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found' });

    await quotation.update({ status: 'under_comparison' });

    const approval = await Approval.create({
      quotation_id: quotationId,
      status: 'pending'
    });

    await logActivity({
      user_id: req.user.id,
      action: 'Submitted quotation for approval',
      entity_type: 'approval',
      entity_id: approval.id
    });

    res.status(201).json({ success: true, data: approval, message: 'Submitted for approval' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.approveQuotation = async (req, res) => {
  try {
    const approvalId = req.params.id;
    const { remarks } = req.body;

    const approval = await Approval.findByPk(approvalId, {
      include: [{ model: Quotation, include: [RFQ] }]
    });
    if (!approval) return res.status(404).json({ success: false, message: 'Approval record not found' });

    const quotation = approval.Quotation;
    if (!quotation) return res.status(404).json({ success: false, message: 'Quotation associated with approval not found' });

    await approval.update({
      status: 'approved',
      remarks,
      reviewed_by: req.user.id,
      reviewed_at: new Date()
    });

    await quotation.update({ status: 'selected' });
    if (quotation.RFQ) {
      await quotation.RFQ.update({ status: 'approved' });
    }

    // Reject all other quotations for this RFQ
    await Quotation.update(
      { status: 'rejected' },
      { where: { rfq_id: quotation.rfq_id, id: { [Op.ne]: quotation.id } } }
    );

    // Auto-create PO
    const po = await PurchaseOrder.create({
      quotation_id: quotation.id,
      rfq_id: quotation.rfq_id,
      vendor_id: quotation.vendor_id,
      subtotal: quotation.total_price,
      tax_percent: 18.00,
      tax_amount: (quotation.total_price * 0.18),
      total_amount: Number(quotation.total_price) + (quotation.total_price * 0.18),
      created_by: req.user.id,
      status: 'generated'
    });

    await logActivity({
      user_id: req.user.id,
      action: 'Approved quotation and generated PO',
      entity_type: 'purchase_order',
      entity_id: po.id
    });

    res.json({ success: true, data: { approval, po }, message: 'Quotation approved and PO generated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.rejectQuotation = async (req, res) => {
  try {
    const approvalId = req.params.id;
    const { remarks } = req.body;

    const approval = await Approval.findByPk(approvalId, {
      include: [{ model: Quotation, include: [RFQ] }]
    });
    if (!approval) return res.status(404).json({ success: false, message: 'Approval record not found' });

    const quotation = approval.Quotation;
    if (!quotation) return res.status(404).json({ success: false, message: 'Quotation associated with approval not found' });

    await approval.update({
      status: 'rejected',
      remarks,
      reviewed_by: req.user.id,
      reviewed_at: new Date()
    });

    await quotation.update({ status: 'rejected' });
    
    if (quotation.RFQ) {
      await quotation.RFQ.update({ status: 'open' });
    }

    await logActivity({
      user_id: req.user.id,
      action: 'Rejected quotation',
      entity_type: 'approval',
      entity_id: approval.id
    });

    res.json({ success: true, data: approval, message: 'Quotation rejected' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
