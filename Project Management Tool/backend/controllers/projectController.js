const Project = require("../models/Project");
const Task = require("../models/Task");
const { log } = require("../middleware/activity");

const accessFilter = (userId) => ({ $or: [{ owner: userId }, { members: userId }] });

exports.list = async (req, res) => {
  const q = req.query.q || "";
  const filter = accessFilter(req.user._id);
  if (q) filter.name = new RegExp(q, "i");
  const projects = await Project.find(filter)
    .populate("owner", "name email")
    .populate("members", "name email role")
    .sort("-createdAt");

  const withProgress = await Promise.all(projects.map(async (p) => {
    const [total, done] = await Promise.all([
      Task.countDocuments({ project: p._id }),
      Task.countDocuments({ project: p._id, status: "done" }),
    ]);
    return { ...p.toObject(), taskCount: total, doneCount: done, progress: total ? Math.round((done / total) * 100) : 0 };
  }));
  res.json(withProgress);
};

exports.get = async (req, res) => {
  const p = await Project.findOne({ _id: req.params.id, ...accessFilter(req.user._id) })
    .populate("owner", "name email")
    .populate("members", "name email role");
  if (!p) return res.status(404).json({ message: "Project not found" });
  res.json(p);
};

exports.create = async (req, res) => {
  const data = { ...req.body, owner: req.user._id };
  data.members = [...new Set([...(data.members || []), String(req.user._id)])];
  const p = await Project.create(data);
  await log({ project: p._id, user: req.user._id, action: "created", entity: "project", message: `created project ${p.name}` });
  res.status(201).json(await p.populate("owner members", "name email role"));
};

exports.update = async (req, res) => {
  const existing = await Project.findOne({ _id: req.params.id, ...accessFilter(req.user._id) });
  if (!existing) return res.status(404).json({ message: "Project not found" });
  const allowed = ["name", "description", "status", "startDate", "endDate", "members", "color"];
  const patch = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  if (Array.isArray(patch.members)) patch.members = [...new Set([...patch.members, String(existing.owner)])];
  const p = await Project.findByIdAndUpdate(existing._id, patch, { new: true, runValidators: true })
    .populate("owner", "name email")
    .populate("members", "name email role");
  await log({ project: p._id, user: req.user._id, action: "updated", entity: "project", message: `updated project ${p.name}` });
  res.json(p);
};

exports.remove = async (req, res) => {
  const p = await Project.findOne({ _id: req.params.id, ...accessFilter(req.user._id) });
  if (!p) return res.status(404).json({ message: "Project not found" });
  if (req.user.role !== "admin" && String(p.owner) !== String(req.user._id)) return res.status(403).json({ message: "Only the project owner or admin can delete it" });
  await Project.findByIdAndDelete(p._id);
  await Task.deleteMany({ project: p._id });
  await log({ project: p._id, user: req.user._id, action: "deleted", entity: "project", message: "deleted project" });
  res.json({ ok: true });
};
