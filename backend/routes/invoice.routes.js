const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.post('/', requireRole(['admin', 'officer']), invoiceController.createInvoice);
router.get('/:id', requireRole(['admin', 'officer', 'manager', 'vendor']), invoiceController.getInvoiceDetails);
router.get('/:id/pdf', invoiceController.downloadInvoicePDF);
router.post('/:id/send-email', requireRole(['admin', 'officer']), invoiceController.sendInvoiceViaEmail);

module.exports = router;
