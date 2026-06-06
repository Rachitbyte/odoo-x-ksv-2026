const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.use(verifyToken);
router.get('/vendor-performance', requireRole(['admin', 'manager']), reportController.getVendorPerformance);
router.get('/spending', requireRole(['admin', 'manager']), reportController.getMonthlySpending);
router.get('/procurement-trends', requireRole(['admin', 'manager']), reportController.getProcurementTrends);
router.get('/approval-stats', requireRole(['admin', 'manager']), reportController.getApprovalStats);

module.exports = router;
