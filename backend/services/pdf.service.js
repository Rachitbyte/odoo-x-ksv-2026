const PDFDocument = require('pdfkit');

exports.generateInvoicePDF = (invoiceData, dataCallback, endCallback) => {
  const doc = new PDFDocument({ margin: 50 });

  doc.on('data', dataCallback);
  doc.on('end', endCallback);

  const { invoice_number, PurchaseOrder: PO, Vendor, created_at, amount_due } = invoiceData;

  // Header
  doc.fillColor('#333333')
     .fontSize(20)
     .text('INVOICE', 50, 50, { align: 'right' });
  
  doc.fontSize(10)
     .text(`Invoice Number: ${invoice_number}`, { align: 'right' })
     .text(`Date: ${new Date(created_at).toLocaleDateString()}`, { align: 'right' });

  // VendorBridge Details
  doc.fontSize(14)
     .text('VendorBridge Inc.', 50, 50);
  doc.fontSize(10)
     .text('123 Procurement St.')
     .text('City, State 12345')
     .moveDown();

  // Vendor Details
  doc.text(`Bill To:`)
     .fontSize(12)
     .text(`${Vendor.company_name}`)
     .fontSize(10)
     .text(`${Vendor.address || 'Address Not Provided'}`)
     .text(`GST: ${Vendor.gst_number || 'N/A'}`)
     .moveDown();

  // PO Details
  doc.text(`Purchase Order: ${PO.po_number}`)
     .moveDown();

  // Table Setup
  const tableTop = 250;
  
  doc.fontSize(10);
  doc.text('Item Description', 50, tableTop);
  doc.text('Quantity', 250, tableTop);
  doc.text('Unit Price', 350, tableTop);
  doc.text('Amount', 450, tableTop);

  doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

  // Item Row
  const itemTop = tableTop + 25;
  const quantity = PO.RFQ ? PO.RFQ.quantity : 1;
  const unitPrice = PO.Quotation ? PO.Quotation.unit_price : PO.subtotal;

  doc.text(`${PO.RFQ ? PO.RFQ.title : 'Procured Items'}`, 50, itemTop, { width: 190 });
  doc.text(`${quantity}`, 250, itemTop);
  doc.text(`$${Number(unitPrice).toFixed(2)}`, 350, itemTop);
  doc.text(`$${Number(PO.subtotal).toFixed(2)}`, 450, itemTop);

  doc.moveTo(50, itemTop + 30).lineTo(550, itemTop + 30).stroke();

  // Totals
  const totalsTop = itemTop + 50;
  doc.text('Subtotal:', 350, totalsTop);
  doc.text(`$${Number(PO.subtotal).toFixed(2)}`, 450, totalsTop);
  
  doc.text(`Tax (${PO.tax_percent}%):`, 350, totalsTop + 15);
  doc.text(`$${Number(PO.tax_amount).toFixed(2)}`, 450, totalsTop + 15);

  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('Total Due:', 350, totalsTop + 35);
  doc.text(`$${Number(amount_due).toFixed(2)}`, 450, totalsTop + 35);

  doc.end();
};
