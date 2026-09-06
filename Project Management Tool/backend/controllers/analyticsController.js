const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");

exports.overview = async (req, res) => {
  const [projects, tasks, users] = await Promise.all([
    Project.countDocuments(),
    Task.countDocuments(),
    User.countDocuments(),
  ]);
  const byStatus = await Task.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
  const byPriority = await Task.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]);
  const overdue = await Task.countDocuments({ dueDate: { $lt: new Date() }, status: { $ne: "done" } });
  res.json({ projects, tasks, users, overdue, byStatus, byPriority });
};

exports.byProject = async (req, res) => {
  const project = req.params.projectId;
  const byStatus = await Task.aggregate([
    { $match: { project: new (require("mongoose").Types.ObjectId)(project) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const byUser = await Task.aggregate([
    { $match: { project: new (require("mongoose").Types.ObjectId)(project) } },
    { $group: { _id: "$assignee", count: { $sum: 1 } } },
  ]);
  const populated = await User.populate(byUser, { path: "_id", select: "name email" });
  res.json({ byStatus, byUser: populated });
};
