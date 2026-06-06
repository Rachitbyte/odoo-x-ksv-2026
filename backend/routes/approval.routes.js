const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approval.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/', requireRole(['admin', 'manager', 'officer']), approvalController.getApprovals);
router.post('/:quotationId/submit', requireRole(['admin', 'officer']), approvalController.submitForApproval);
router.post('/:quotationId/approve', requireRole(['admin', 'manager']), approvalController.approveQuotation);
router.post('/:quotationId/reject', requireRole(['admin', 'manager']), approvalController.rejectQuotation);

module.exports = router;
