const { RFQ, Vendor, Quotation } = require('../models');
const logActivity = require('../utils/activityLogger');

exports.getAllRFQs = async (req, res) => {
  try {
    let vendorInclude = { model: Vendor, attributes: ['id', 'company_name'] };

    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ where: { user_id: req.user.id } });
      if (!vendor) return res.json({ success: true, data: [] });
      vendorInclude.where = { id: vendor.id }; // Enforce INNER JOIN for assigned vendors only
    }

    const rfqs = await RFQ.findAll({
      include: [
        vendorInclude,
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
    let vendorInclude = { model: Vendor, attributes: ['id', 'company_name', 'email', 'contact_person'] };

    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ where: { user_id: req.user.id } });
      if (!vendor) return res.status(403).json({ success: false, message: 'Access Denied' });
      vendorInclude.where = { id: vendor.id };
    }

    const rfq = await RFQ.findByPk(req.params.id, {
      include: [
        vendorInclude,
        { model: Quotation, include: [{ model: Vendor, attributes: ['company_name', 'rating'] }] }
      ]
    });
    
    if (!rfq) return res.status(404).json({ success: false, message: 'RFQ not found or not assigned to you' });
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

exports.getRFQComparison = async (req, res) => {
  try {
    const rfqId = req.params.id;
    const quotations = await Quotation.findAll({
      where: { rfq_id: rfqId },
      include: [
        { model: Vendor, attributes: ['company_name', 'rating'] }
      ]
    });

    const comparison = quotations.map(quote => {
      const vendor = quote.Vendor || {};
      const ratingVal = vendor.rating ? Number(vendor.rating).toFixed(1) : '0.0';
      return {
        id: quote.id,
        vendor_name: vendor.company_name || 'Unknown Vendor',
        vendor_rating: `${ratingVal}/5`,
        grand_total: quote.total_price ? Number(quote.total_price) : 0,
        gst_percent: 18,
        delivery_days: quote.delivery_days || 0,
        payment_terms: quote.notes || 'Net 30'
      };
    });

    res.json({ success: true, data: comparison, message: 'Comparison fetched successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateRFQ = async (req, res) => {
  try {
    const rfqId = req.params.id;
    const { title, description, quantity, unit, deadline, vendor_ids } = req.body;

    const rfq = await RFQ.findByPk(rfqId);
    if (!rfq) return res.status(404).json({ success: false, message: 'RFQ not found' });

    await rfq.update({
      title,
      description,
      quantity,
      unit,
      deadline
    });

    if (vendor_ids) {
      await rfq.setVendors(vendor_ids);
    }

    await logActivity({
      user_id: req.user.id,
      action: `Updated RFQ details`,
      entity_type: 'rfq',
      entity_id: rfq.id,
      metadata: { title: rfq.title }
    });

    res.json({ success: true, data: rfq, message: 'RFQ updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
