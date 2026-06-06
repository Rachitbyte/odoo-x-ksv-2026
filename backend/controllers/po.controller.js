const { PurchaseOrder, Quotation, RFQ, Vendor } = require('../models');

exports.getAllPOs = async (req, res) => {
  try {
    const whereClause = {};
    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ where: { user_id: req.user.id } });
      if (vendor) {
        whereClause.vendor_id = vendor.id;
      } else {
        return res.json({ success: true, data: [], message: 'Purchase Orders fetched successfully' });
      }
    }

    const pos = await PurchaseOrder.findAll({
      where: whereClause,
      include: [
        { model: Vendor, attributes: ['company_name', 'email'] },
        { model: RFQ, attributes: ['title', 'rfq_number'] }
      ],
      order: [['created_at', 'DESC']]
    });

    const formattedPOs = pos.map(po => ({
      id: po.id,
      po_number: po.po_number,
      rfq_title: po.RFQ ? po.RFQ.title : '',
      vendor_name: po.Vendor ? po.Vendor.company_name : '',
      total_amount: po.total_amount ? Number(po.total_amount) : 0,
      status: po.status,
      created_at: po.created_at ? new Date(po.created_at).toISOString().split('T')[0] : ''
    }));

    res.json({ success: true, data: formattedPOs, message: 'Purchase Orders fetched successfully' });
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

    const rfq = po.RFQ || {};
    const quotation = po.Quotation || {};
    const vendor = po.Vendor || {};

    const formattedPO = {
      id: po.id,
      po_number: po.po_number,
      rfq_title: rfq.title || '',
      vendor_name: vendor.company_name || '',
      vendor_address: vendor.address || 'Address on file',
      vendor_email: vendor.email || '',
      subtotal: po.subtotal ? Number(po.subtotal) : 0,
      tax_percent: po.tax_percent ? Number(po.tax_percent) : 0,
      tax_amount: po.tax_amount ? Number(po.tax_amount) : 0,
      total_amount: po.total_amount ? Number(po.total_amount) : 0,
      status: po.status,
      created_at: po.created_at ? new Date(po.created_at).toISOString().split('T')[0] : '',
      items: [
        {
          description: rfq.title || rfq.description || 'Procured Items',
          quantity: rfq.quantity || 1,
          unit: rfq.unit || 'units',
          unit_price: quotation.unit_price ? Number(quotation.unit_price) : (po.subtotal ? Number(po.subtotal) : 0),
          total: po.subtotal ? Number(po.subtotal) : 0
        }
      ]
    };

    res.json({ success: true, data: formattedPO, message: 'Purchase Order fetched successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
