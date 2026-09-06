const FileAsset = require("../models/FileAsset");
const { log } = require("../middleware/activity");
const Task = require("../models/Task");

exports.uploadToTask = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file" });
  const task = await Task.findById(req.params.taskId);
  const f = await FileAsset.create({
    task: req.params.taskId,
    project: task?.project,
    uploader: req.user._id,
    originalName: req.file.originalname,
    fileName: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size,
    url: `/uploads/${req.file.filename}`,
  });
  await log({ project: task?.project, task: task?._id, user: req.user._id, action: "uploaded", entity: "file", message: `uploaded ${req.file.originalname}` });
  res.status(201).json(f);
};

exports.uploadToProject = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file" });
  const f = await FileAsset.create({
    project: req.params.projectId,
    uploader: req.user._id,
    originalName: req.file.originalname,
    fileName: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size,
    url: `/uploads/${req.file.filename}`,
  });
  await log({ project: req.params.projectId, user: req.user._id, action: "uploaded", entity: "file", message: `uploaded ${req.file.originalname}` });
  res.status(201).json(f);
};

exports.listByTask = async (req, res) => {
  const files = await FileAsset.find({ task: req.params.taskId }).populate("uploader", "name").sort("-createdAt");
  res.json(files);
};
exports.listByProject = async (req, res) => {
  const files = await FileAsset.find({ project: req.params.projectId }).populate("uploader", "name").sort("-createdAt");
  res.json(files);
};

exports.remove = async (req, res) => {
  await FileAsset.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
};
