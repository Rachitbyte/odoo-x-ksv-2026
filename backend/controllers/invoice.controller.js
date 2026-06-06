const { Invoice, PurchaseOrder, Vendor, RFQ, Quotation } = require('../models');
const logActivity = require('../utils/activityLogger');
const { generateInvoicePDF } = require('../services/pdf.service');
const { sendInvoiceEmail } = require('../services/email.service');

exports.createInvoice = async (req, res) => {
  try {
    const { po_id } = req.body;

    const po = await PurchaseOrder.findByPk(po_id);
    if (!po) return res.status(404).json({ success: false, message: 'PO not found' });

    const existingInvoice = await Invoice.findOne({ where: { po_id } });
    if (existingInvoice) return res.status(400).json({ success: false, message: 'Invoice already exists for this PO' });

    const invoice = await Invoice.create({
      po_id: po.id,
      vendor_id: po.vendor_id,
      amount_due: po.total_amount,
      status: 'generated'
    });

    await po.update({ status: 'invoice_raised' });

    await logActivity({
      user_id: req.user.id,
      action: 'Generated invoice',
      entity_type: 'invoice',
      entity_id: invoice.id
    });

    res.status(201).json({ success: true, data: invoice, message: 'Invoice generated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAllInvoices = async (req, res) => {
  try {
    const whereClause = {};
    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ where: { user_id: req.user.id } });
      if (vendor) {
        whereClause.vendor_id = vendor.id;
      } else {
        return res.json({ success: true, data: [], message: 'Invoices fetched successfully' });
      }
    }

    const invoices = await Invoice.findAll({
      where: whereClause,
      include: [
        { model: PurchaseOrder, attributes: ['po_number'] },
        { model: Vendor, attributes: ['company_name'] }
      ],
      order: [['created_at', 'DESC']]
    });

    const formattedInvoices = invoices.map(inv => ({
      id: inv.id,
      invoice_number: inv.invoice_number,
      po_number: inv.PurchaseOrder ? inv.PurchaseOrder.po_number : '',
      vendor_name: inv.Vendor ? inv.Vendor.company_name : '',
      amount_due: inv.amount_due ? Number(inv.amount_due) : 0,
      status: inv.status,
      created_at: inv.created_at ? new Date(inv.created_at).toISOString().split('T')[0] : ''
    }));

    res.json({ success: true, data: formattedInvoices, message: 'Invoices fetched successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getInvoiceDetails = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        { model: PurchaseOrder, include: [RFQ, Quotation] },
        { model: Vendor }
      ]
    });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const po = invoice.PurchaseOrder || {};
    const rfq = po.RFQ || {};
    const quotation = po.Quotation || {};
    const vendor = invoice.Vendor || {};

    const formattedDetail = {
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      status: invoice.status,
      amount_due: invoice.amount_due ? Number(invoice.amount_due) : 0,
      created_at: invoice.created_at ? new Date(invoice.created_at).toISOString().split('T')[0] : '',
      due_date: invoice.created_at ? new Date(new Date(invoice.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '',
      po_number: po.po_number || '',
      vendor_name: vendor.company_name || '',
      vendor_address: vendor.address || 'Address on file',
      vendor_email: vendor.email || '',
      subtotal: po.subtotal ? Number(po.subtotal) : 0,
      tax_percent: po.tax_percent ? Number(po.tax_percent) : 0,
      tax_amount: po.tax_amount ? Number(po.tax_amount) : 0,
      total_amount: po.total_amount ? Number(po.total_amount) : 0,
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

    res.json({ success: true, data: formattedDetail, message: 'Invoice fetched successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.markAsPaid = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    await invoice.update({ status: 'paid' });

    await logActivity({
      user_id: req.user.id,
      action: 'Marked invoice as paid',
      entity_type: 'invoice',
      entity_id: invoice.id
    });

    res.json({ success: true, data: invoice, message: 'Invoice marked as paid' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        { model: PurchaseOrder, include: [RFQ, Quotation] },
        { model: Vendor }
      ]
    });

    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${invoice.invoice_number}.pdf`);

    // Stream the PDF directly to the response
    generateInvoicePDF(invoice, (chunk) => res.write(chunk), () => res.end());
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.sendInvoiceViaEmail = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        { model: PurchaseOrder, include: [RFQ, Quotation] },
        { model: Vendor }
      ]
    });

    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    if (!invoice.Vendor.email) return res.status(400).json({ success: false, message: 'Vendor email not found' });

    // Generate PDF to buffer
    const chunks = [];
    generateInvoicePDF(invoice, 
      (chunk) => chunks.push(chunk), 
      async () => {
        const result = Buffer.concat(chunks);
        try {
          await sendInvoiceEmail(invoice.Vendor.email, invoice.invoice_number, result);
          
          await invoice.update({ status: 'sent', sent_at: new Date() });

          await logActivity({
            user_id: req.user.id,
            action: `Sent invoice to ${invoice.Vendor.email}`,
            entity_type: 'invoice',
            entity_id: invoice.id
          });

          res.json({ success: true, message: 'Invoice sent successfully' });
        } catch (emailError) {
            console.error(emailError);
            res.status(500).json({ success: false, message: 'Failed to send email' });
        }
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
