const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approval.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/', requireRole(['manager']), approvalController.getApprovals);
router.post('/:quotationId/submit', requireRole(['officer']), approvalController.submitForApproval);
router.post('/:quotationId/approve', requireRole(['manager']), approvalController.approveQuotation);
router.post('/:quotationId/reject', requireRole(['manager']), approvalController.rejectQuotation);

module.exports = router;
