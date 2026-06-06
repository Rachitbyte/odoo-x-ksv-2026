const { Quotation, RFQ, Vendor } = require('../models');
const logActivity = require('../utils/activityLogger');

exports.submitQuotation = async (req, res) => {
  try {
    const rfqId = req.params.rfqId;
    let vendorId;

    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ where: { user_id: req.user.id } });
      if (!vendor) return res.status(400).json({ success: false, message: 'Vendor profile not found for this user.' });
      vendorId = vendor.id;
    } else {
      vendorId = req.body.vendor_id;
    }

    if (!vendorId) {
      return res.status(400).json({ success: false, message: 'vendor_id is required' });
    }

    const { unit_price, delivery_days, notes, items, total_price: req_total_price, status } = req.body;

    const rfq = await RFQ.findByPk(rfqId);
    if (!rfq) return res.status(404).json({ success: false, message: 'RFQ not found' });

    // Fallback parsing for frontend mismatched data
    const final_unit_price = unit_price || (items && items.length > 0 ? items[0].unit_price : 0);
    const final_delivery_days = delivery_days || (items && items.length > 0 ? items[0].delivery_days : 7);

    const total_price = req_total_price || (final_unit_price * rfq.quantity);

    let final_notes = notes;
    if (items && items.length > 0) {
        final_notes = (notes || '') + '\n\nItems:\n' + items.map(i => `${i.name}: ${i.quantity} x ${i.unit_price} (Delivery: ${i.delivery_days} days)`).join('\n');
    }

    const quotation = await Quotation.create({
      rfq_id: rfqId,
      vendor_id: vendorId,
      unit_price: final_unit_price,
      total_price,
      delivery_days: final_delivery_days,
      notes: final_notes,
      status: status || 'submitted'
    });

    await logActivity({
      user_id: req.user.id,
      action: 'Submitted quotation',
      entity_type: 'quotation',
      entity_id: quotation.id,
      metadata: { rfq_id: rfqId }
    });

    res.status(201).json({ success: true, data: quotation, message: 'Quotation submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getQuotationsForRFQ = async (req, res) => {
  try {
    const rfqId = req.params.rfqId;
    
    const quotations = await Quotation.findAll({
      where: { rfq_id: rfqId },
      include: [
        { model: Vendor, attributes: ['company_name', 'rating', 'contact_person'] }
      ],
      order: [['total_price', 'ASC']] // Order by lowest price for comparison
    });

    res.json({ success: true, data: quotations, message: 'Quotations fetched successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAllQuotations = async (req, res) => {
  try {
    const whereClause = {};
    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ where: { user_id: req.user.id } });
      if (vendor) {
        whereClause.vendor_id = vendor.id;
      } else {
        return res.json({ success: true, data: [] });
      }
    }

    const quotations = await Quotation.findAll({
      where: whereClause,
      include: [
        { model: RFQ, attributes: ['rfq_number', 'title'] },
        { model: Vendor, attributes: ['company_name'] }
      ],
      order: [['submitted_at', 'DESC']]
    });

    res.json({ success: true, data: quotations, message: 'Quotations fetched successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateQuotation = async (req, res) => {
  try {
    const { status, notes, unit_price, delivery_days } = req.body;
    const quotation = await Quotation.findByPk(req.params.id);
    
    if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found' });

    // Ensure only the vendor who owns it or an officer can update
    if (req.user.role === 'vendor' && quotation.vendor_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access Denied.' });
    }

    let updateData = { status, notes };
    if (unit_price) {
        const rfq = await RFQ.findByPk(quotation.rfq_id);
        updateData.unit_price = unit_price;
        updateData.total_price = unit_price * rfq.quantity;
    }
    if (delivery_days) updateData.delivery_days = delivery_days;

    await quotation.update(updateData);

    await logActivity({
      user_id: req.user.id,
      action: `Updated quotation`,
      entity_type: 'quotation',
      entity_id: quotation.id
    });

    res.json({ success: true, data: quotation, message: 'Quotation updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
