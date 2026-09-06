const ActivityLog = require("../models/ActivityLog");
exports.byProject = async (req, res) => {
  const logs = await ActivityLog.find({ project: req.params.projectId })
    .populate("user", "name email")
    .sort("-createdAt")
    .limit(200);
  res.json(logs);
};
