const { RFQ, Vendor, Quotation } = require('../models');
const logActivity = require('../utils/activityLogger');

exports.getAllRFQs = async (req, res) => {
  try {
    const rfqs = await RFQ.findAll({
      include: [
        { model: Vendor, attributes: ['id', 'company_name'] },
        { model: Quotation }
      ]
    });
    res.json({ success: true, data: rfqs, message: 'RFQs fetched successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getRFQById = async (req, res) => {
  try {
    const rfq = await RFQ.findByPk(req.params.id, {
      include: [
        { model: Vendor, attributes: ['id', 'company_name', 'email', 'contact_person'] },
        { model: Quotation, include: [{ model: Vendor, attributes: ['company_name', 'rating'] }] }
      ]
    });
    if (!rfq) return res.status(404).json({ success: false, message: 'RFQ not found' });
    res.json({ success: true, data: rfq, message: 'RFQ fetched successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createRFQ = async (req, res) => {
  try {
    const { title, description, quantity, unit, deadline, vendor_ids } = req.body;

    const rfq = await RFQ.create({
      title,
      description,
      quantity,
      unit,
      deadline,
      created_by: req.user.id,
      status: 'open'
    });

    if (vendor_ids && vendor_ids.length > 0) {
      await rfq.addVendors(vendor_ids);
    }

    await logActivity({
      user_id: req.user.id,
      action: 'Created new RFQ',
      entity_type: 'rfq',
      entity_id: rfq.id,
      metadata: { title: rfq.title }
    });

    res.status(201).json({ success: true, data: rfq, message: 'RFQ created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateRFQStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const rfq = await RFQ.findByPk(req.params.id);
    
    if (!rfq) return res.status(404).json({ success: false, message: 'RFQ not found' });

    await rfq.update({ status });

    await logActivity({
      user_id: req.user.id,
      action: `Updated RFQ status to ${status}`,
      entity_type: 'rfq',
      entity_id: rfq.id
    });

    res.json({ success: true, data: rfq, message: 'RFQ status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
