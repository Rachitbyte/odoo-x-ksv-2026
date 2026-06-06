const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotation.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.use(verifyToken);

// Note: In server.js we will mount this as /api
router.post('/rfq/:rfqId/quotations', quotationController.submitQuotation);
router.get('/rfq/:rfqId/quotations', requireRole(['admin', 'officer', 'manager']), quotationController.getQuotationsForRFQ);
router.put('/quotations/:id', quotationController.updateQuotation);

module.exports = router;
