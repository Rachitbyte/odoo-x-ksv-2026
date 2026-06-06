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

exports.getInvoiceDetails = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        { model: PurchaseOrder, include: [RFQ, Quotation] },
        { model: Vendor }
      ]
    });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice, message: 'Invoice fetched successfully' });
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
