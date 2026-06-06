const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.use(verifyToken);
router.get('/', requireRole(['admin', 'manager', 'officer']), activityController.getLogs);

module.exports = router;
