const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.post('/', requireRole(['officer']), invoiceController.createInvoice);
router.get('/', requireRole(['admin', 'officer', 'manager', 'vendor']), invoiceController.getAllInvoices);
router.get('/:id', requireRole(['admin', 'officer', 'manager', 'vendor']), invoiceController.getInvoiceDetails);
router.put('/:id/paid', requireRole(['officer']), invoiceController.markAsPaid);
router.get('/:id/pdf', invoiceController.downloadInvoicePDF);
router.post('/:id/send-email', requireRole(['officer']), invoiceController.sendInvoiceViaEmail);

module.exports = router;
