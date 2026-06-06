const express = require('express');
const router = express.Router();
const rfqController = require('../controllers/rfq.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/', rfqController.getAllRFQs);
router.get('/:id', rfqController.getRFQById);
router.post('/', requireRole(['admin', 'officer']), rfqController.createRFQ);
router.put('/:id/status', requireRole(['admin', 'officer', 'manager']), rfqController.updateRFQStatus);

module.exports = router;
