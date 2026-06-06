const { ActivityLog, User } = require('../models');

exports.getLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.findAll({
      include: [{ model: User, attributes: ['name', 'email'] }],
      order: [['created_at', 'DESC']],
      limit: 50 // Limit to last 50 for MVP
    });
    res.json({ success: true, data: logs, message: 'Logs fetched successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
