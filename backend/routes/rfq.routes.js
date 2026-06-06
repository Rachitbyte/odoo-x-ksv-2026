const express = require('express');
const router = express.Router();
const rfqController = require('../controllers/rfq.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/', requireRole(['admin', 'officer', 'manager', 'vendor']), rfqController.getAllRFQs);
router.get('/:id', requireRole(['admin', 'officer', 'manager', 'vendor']), rfqController.getRFQById);
router.get('/:id/comparison', requireRole(['admin', 'officer', 'manager']), rfqController.getRFQComparison);
router.post('/', requireRole(['officer']), rfqController.createRFQ);
router.put('/:id', requireRole(['officer']), rfqController.updateRFQ);
router.put('/:id/status', requireRole(['officer']), rfqController.updateRFQStatus);

module.exports = router;
