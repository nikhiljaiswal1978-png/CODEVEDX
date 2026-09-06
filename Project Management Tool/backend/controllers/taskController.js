const Task = require("../models/Task");
const Project = require("../models/Project");
const { log } = require("../middleware/activity");

const accessibleProjectFilter = (userId) => ({
  $or: [{ owner: userId }, { members: userId }],
});

const canAccessProject = async (user, projectId) => {
  if (user.role === "admin") return true;
  return !!(await Project.exists({ _id: projectId, ...accessibleProjectFilter(user._id) }));
};

const canManageTask = (user, task) =>
  user.role === "admin" || user.role === "manager" || String(task.assignee || "") === String(user._id) || String(task.createdBy || "") === String(user._id);

const emit = (req, event, payload, room) => {
  const io = req.app.get("io");
  if (io) io.to(room).emit(event, payload);
};

exports.list = async (req, res) => {
  try {
    const { project, assignee, status, priority, q } = req.query;
    const projectFilter = accessibleProjectFilter(req.user._id);
    if (project && !(await canAccessProject(req.user, project))) {
      return res.status(403).json({ message: "You do not have access to this project" });
    }

    const accessibleProjects = await Project.find(projectFilter).select("_id").lean();
    const filter = { project: project ? project : { $in: accessibleProjects.map((p) => p._id) } };
    if (assignee) filter.assignee = assignee;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (q) filter.title = new RegExp(q, "i");

    const tasks = await Task.find(filter)
      .populate("assignee", "name email")
      .populate("project", "name color")
      .sort("-createdAt");
    res.json(tasks);
  } catch (error) {
    console.error("Task list error:", error);
    res.status(500).json({ message: "Failed to load tasks" });
  }
};

exports.get = async (req, res) => {
  const t = await Task.findById(req.params.id)
    .populate("assignee", "name email")
    .populate("project", "name color");
  if (!t) return res.status(404).json({ message: "Not found" });
  if (!(await canAccessProject(req.user, t.project._id))) return res.status(403).json({ message: "Forbidden" });
  res.json(t);
};

exports.create = async (req, res) => {
  if (!(await canAccessProject(req.user, req.body.project))) {
    return res.status(403).json({ message: "You do not have access to this project" });
  }
  const t = await Task.create({ ...req.body, createdBy: req.user._id });
  const full = await Task.findById(t._id)
    .populate("assignee", "name email")
    .populate("project", "name color");
  emit(req, "task:created", full, `project:${t.project}`);
  await log({ project: t.project, task: t._id, user: req.user._id, action: "created", entity: "task", message: `created task "${t.title}"` });
  res.status(201).json(full);
};

exports.update = async (req, res) => {
  const before = await Task.findById(req.params.id);
  if (!before) return res.status(404).json({ message: "Not found" });
  if (!(await canAccessProject(req.user, before.project))) return res.status(403).json({ message: "Forbidden" });
  if (!canManageTask(req.user, before)) return res.status(403).json({ message: "You can only update tasks assigned to you" });

  if (req.body.project && String(req.body.project) !== String(before.project)) {
    return res.status(400).json({ message: "A task cannot be moved between projects here" });
  }

  const allowed = ["title", "description", "status", "priority", "assignee", "startDate", "dueDate", "progress", "tags"];
  const patch = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  const t = await Task.findByIdAndUpdate(req.params.id, patch, { new: true, runValidators: true })
    .populate("assignee", "name email")
    .populate("project", "name color");

  emit(req, "task:updated", t, `project:${t.project._id || t.project}`);
  const statusChange = before.status !== t.status;
  await log({
    project: t.project._id || t.project,
    task: t._id,
    user: req.user._id,
    action: statusChange ? "status-change" : "updated",
    entity: "task",
    message: statusChange ? `moved "${t.title}" → ${t.status}` : `updated task "${t.title}"`,
  });
  res.json(t);
};

exports.remove = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: "Not found" });
  if (!(await canAccessProject(req.user, task.project))) return res.status(403).json({ message: "Forbidden" });
  if (!(req.user.role === "admin" || req.user.role === "manager" || String(task.createdBy) === String(req.user._id))) {
    return res.status(403).json({ message: "You cannot delete this task" });
  }

  await Task.findByIdAndDelete(task._id);
  emit(req, "task:deleted", { id: task._id }, `project:${task.project}`);
  await log({ project: task.project, task: task._id, user: req.user._id, action: "deleted", entity: "task", message: "deleted a task" });
  res.json({ ok: true });
};
