const { Vendor, User } = require('../models');
const logActivity = require('../utils/activityLogger');

exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.findAll({
      include: [{ model: User, attributes: ['name', 'email'] }]
    });
    res.json({ success: true, data: vendors, message: 'Vendors fetched successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['name', 'email'] }]
    });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    res.json({ success: true, data: vendor, message: 'Vendor fetched successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createVendor = async (req, res) => {
  try {
    const vendor = await Vendor.create(req.body);
    
    await logActivity({
      user_id: req.user.id,
      action: 'Created new vendor',
      entity_type: 'vendor',
      entity_id: vendor.id,
      metadata: { company_name: vendor.company_name }
    });

    res.status(201).json({ success: true, data: vendor, message: 'Vendor created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

    await vendor.update(req.body);
    
    await logActivity({
      user_id: req.user.id,
      action: 'Updated vendor details',
      entity_type: 'vendor',
      entity_id: vendor.id
    });

    res.json({ success: true, data: vendor, message: 'Vendor updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

    await vendor.destroy();

    await logActivity({
      user_id: req.user.id,
      action: 'Deleted vendor',
      entity_type: 'vendor',
      entity_id: vendor.id
    });

    res.json({ success: true, data: null, message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
