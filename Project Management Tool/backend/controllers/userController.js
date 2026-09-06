const User = require("../models/User");

exports.list = async (req, res) => {
  const users = await User.find().select("-password").sort("name");
  res.json(users);
};

exports.update = async (req, res) => {
  const { name, role, avatar } = req.body;
  const u = await User.findByIdAndUpdate(
    req.params.id,
    { ...(name && { name }), ...(role && { role }), ...(avatar && { avatar }) },
    { new: true }
  ).select("-password");
  res.json(u);
};

exports.remove = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
};
