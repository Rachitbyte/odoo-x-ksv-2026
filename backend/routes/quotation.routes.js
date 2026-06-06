const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotation.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.use(verifyToken);

// Note: In server.js we will mount this as /api
router.post('/rfq/:rfqId/quotations', requireRole(['vendor']), quotationController.submitQuotation);
router.get('/rfq/:rfqId/quotations', requireRole(['officer', 'manager']), quotationController.getQuotationsForRFQ);
router.get('/quotations', requireRole(['officer', 'manager', 'vendor']), quotationController.getAllQuotations);
router.put('/quotations/:id', requireRole(['vendor']), quotationController.updateQuotation);

module.exports = router;
