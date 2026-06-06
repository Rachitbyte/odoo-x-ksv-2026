const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendor.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/', requireRole(['admin', 'officer', 'manager']), vendorController.getAllVendors);
router.get('/:id', requireRole(['admin', 'officer', 'manager']), vendorController.getVendorById);
router.post('/', requireRole(['admin']), vendorController.createVendor);
router.put('/:id', requireRole(['admin']), vendorController.updateVendor);
router.delete('/:id', requireRole(['admin']), vendorController.deleteVendor);

module.exports = router;
