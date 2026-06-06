const { PurchaseOrder, Quotation, RFQ, Vendor } = require('../models');

exports.getAllPOs = async (req, res) => {
  try {
    const pos = await PurchaseOrder.findAll({
      include: [
        { model: Vendor, attributes: ['company_name', 'email'] },
        { model: RFQ, attributes: ['title', 'rfq_number'] }
      ]
    });
    res.json({ success: true, data: pos, message: 'Purchase Orders fetched successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getPODetails = async (req, res) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id, {
      include: [
        { model: Vendor, attributes: ['company_name', 'email', 'address', 'gst_number'] },
        { model: RFQ, attributes: ['title', 'description', 'quantity', 'unit'] },
        { model: Quotation, attributes: ['unit_price', 'delivery_days'] }
      ]
    });
    if (!po) return res.status(404).json({ success: false, message: 'PO not found' });
    res.json({ success: true, data: po, message: 'Purchase Order fetched successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
