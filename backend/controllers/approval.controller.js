const { Approval, Quotation, RFQ, PurchaseOrder, Vendor } = require('../models');
const logActivity = require('../utils/activityLogger');

exports.getApprovals = async (req, res) => {
  try {
    const approvals = await Approval.findAll({
      include: [
        { 
          model: Quotation, 
          include: [{ model: RFQ }, { model: Vendor, attributes: ['company_name'] }] 
        }
      ]
    });
    res.json({ success: true, data: approvals, message: 'Approvals fetched successfully' });
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
    const quotationId = req.params.quotationId;
    const { remarks } = req.body;

    const approval = await Approval.findOne({ where: { quotation_id: quotationId } });
    if (!approval) return res.status(404).json({ success: false, message: 'Approval record not found' });

    const quotation = await Quotation.findByPk(quotationId, { include: [RFQ] });

    await approval.update({
      status: 'approved',
      remarks,
      reviewed_by: req.user.id,
      reviewed_at: new Date()
    });

    await quotation.update({ status: 'selected' });
    await quotation.RFQ.update({ status: 'approved' });

    // Reject all other quotations for this RFQ
    await Quotation.update(
        { status: 'rejected' },
        { where: { rfq_id: quotation.rfq_id, id: { [require('sequelize').Op.ne]: quotationId } } }
    );

    // Auto-create PO
    const po = await PurchaseOrder.create({
      quotation_id: quotationId,
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
    const quotationId = req.params.quotationId;
    const { remarks } = req.body;

    const approval = await Approval.findOne({ where: { quotation_id: quotationId } });
    if (!approval) return res.status(404).json({ success: false, message: 'Approval record not found' });

    const quotation = await Quotation.findByPk(quotationId, { include: [RFQ] });

    await approval.update({
      status: 'rejected',
      remarks,
      reviewed_by: req.user.id,
      reviewed_at: new Date()
    });

    await quotation.update({ status: 'rejected' });
    
    // Check if any other approvals are pending, if not, revert RFQ
    await quotation.RFQ.update({ status: 'open' });

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
