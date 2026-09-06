const Comment = require("../models/Comment");
const Task = require("../models/Task");
const { log } = require("../middleware/activity");

exports.list = async (req, res) => {
  const comments = await Comment.find({ task: req.params.taskId })
    .populate("author", "name email")
    .sort("createdAt");
  res.json(comments);
};

exports.create = async (req, res) => {
  const c = await Comment.create({
    task: req.params.taskId,
    author: req.user._id,
    text: req.body.text,
  });
  const full = await c.populate("author", "name email");
  const task = await Task.findById(req.params.taskId);
  await log({
    project: task?.project,
    task: task?._id,
    user: req.user._id,
    action: "commented",
    entity: "comment",
    message: `commented on "${task?.title}"`,
  });
  res.status(201).json(full);
};

exports.remove = async (req, res) => {
  await Comment.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
};
