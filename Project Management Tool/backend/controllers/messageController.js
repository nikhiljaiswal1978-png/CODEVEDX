const Message = require("../models/Message");

exports.list = async (req, res) => {
  const messages = await Message.find({ project: req.params.projectId })
    .populate("sender", "name email")
    .sort("createdAt")
    .limit(500);
  res.json(messages);
};

exports.create = async (req, res) => {
  const m = await Message.create({
    project: req.params.projectId,
    sender: req.user._id,
    text: req.body.text,
  });
  const full = await m.populate("sender", "name email");
  const io = req.app.get("io");
  io?.to(`project:${req.params.projectId}`).emit("chat:new", full);
  res.status(201).json(full);
};
