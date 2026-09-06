const ActivityLog = require("../models/ActivityLog");
exports.log = async ({ project, task, user, action, entity, message, meta }) => {
  try {
    await ActivityLog.create({ project, task, user, action, entity, message, meta });
  } catch (e) {
    console.error("activity log error", e.message);
  }
};
