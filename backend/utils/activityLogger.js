const { ActivityLog } = require('../models');

const logActivity = async ({ user_id, action, entity_type, entity_id, metadata }) => {
  try {
    await ActivityLog.create({
      user_id,
      action,
      entity_type,
      entity_id,
      metadata
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

module.exports = logActivity;
