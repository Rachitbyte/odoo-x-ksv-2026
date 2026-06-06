const express = require('express');
const router = express.Router();
const poController = require('../controllers/po.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/', requireRole(['admin', 'officer', 'manager', 'vendor']), poController.getAllPOs);
router.get('/:id', requireRole(['admin', 'officer', 'manager', 'vendor']), poController.getPODetails);

module.exports = router;
