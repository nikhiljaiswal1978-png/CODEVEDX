const Project = require("../models/Project");
const Task = require("../models/Task");

exports.stats = async (req, res) => {
  try {
    const now = new Date();
    const projectFilter = {
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    };
    const projects = await Project.find(projectFilter).select("_id").lean();
    const projectIds = projects.map((p) => p._id);
    const taskFilter = { project: { $in: projectIds } };

    const [
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      reviewTasks,
      overdueTasks,
    ] = await Promise.all([
      projects.length,
      Task.countDocuments(taskFilter),
      Task.countDocuments({ ...taskFilter, status: "done" }),
      Task.countDocuments({ ...taskFilter, status: "todo" }),
      Task.countDocuments({ ...taskFilter, status: "in-progress" }),
      Task.countDocuments({ ...taskFilter, status: "review" }),
      Task.countDocuments({
        ...taskFilter,
        status: { $ne: "done" },
        dueDate: { $lt: now },
      }),
    ]);

    const progressPercentage = totalTasks
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    res.json({
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      reviewTasks,
      overdueTasks,
      progressPercentage,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Failed to load dashboard statistics" });
  }
};
