const { User } = require('../models');
const bcrypt = require('bcrypt');
const logActivity = require('../utils/activityLogger');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'is_active', 'created_at']
    });
    res.json({ success: true, data: users, message: 'Users fetched successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password_hash,
      role: role || 'officer',
      is_active: true
    });

    await logActivity({
      user_id: req.user.id,
      action: `Created new user: ${user.name}`,
      entity_type: 'user',
      entity_id: user.id
    });

    // Remove password hash from response
    const userData = user.toJSON();
    delete userData.password_hash;

    res.status(201).json({ success: true, data: userData, message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, is_active } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.update({ name, email, role, is_active });

    await logActivity({
      user_id: req.user.id,
      action: `Updated user details for ${user.email}`,
      entity_type: 'user',
      entity_id: user.id
    });

    const userData = user.toJSON();
    delete userData.password_hash;

    res.json({ success: true, data: userData, message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.id === req.user.id) {
       return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
    }

    await user.destroy();

    await logActivity({
      user_id: req.user.id,
      action: `Deleted user ${user.email}`,
      entity_type: 'user',
      entity_id: user.id
    });

    res.json({ success: true, data: null, message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
