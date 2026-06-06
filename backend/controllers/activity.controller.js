const { ActivityLog, User } = require('../models');

exports.getLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.findAll({
      include: [{ model: User, attributes: ['name', 'email'] }],
      order: [['created_at', 'DESC']],
      limit: 50 // Limit to last 50 for MVP
    });

    const formattedLogs = logs.map(log => ({
      id: log.id,
      user_name: log.User ? log.User.name : 'System',
      action: log.action,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      metadata: log.metadata,
      created_at: log.created_at
    }));

    res.json({ success: true, data: formattedLogs, message: 'Logs fetched successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
