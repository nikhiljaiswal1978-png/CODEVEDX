const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Project = require("../models/Project");
const Message = require("../models/Message");

const JWT_SECRET = process.env.JWT_SECRET || "replace_me_with_a_long_random_string";

const canAccess = async (user, projectId) => {
  if (user.role === "admin") return true;
  return !!(await Project.exists({
    _id: projectId,
    $or: [{ owner: user._id }, { members: user._id }],
  }));
};

exports.initSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return next(new Error("No user"));
      socket.user = user;
      next();
    } catch (e) {
      console.error("Socket authentication error:", e.message);
      next(new Error("Auth error"));
    }
  });

  io.on("connection", (socket) => {
    const uid = socket.user._id.toString();
    socket.join(`user:${uid}`);
    console.log(`User connected: ${socket.user.name}`);

    socket.on("join:project", async (projectId) => {
      if (projectId && await canAccess(socket.user, projectId)) socket.join(`project:${projectId}`);
    });

    socket.on("leave:project", (projectId) => {
      if (projectId) socket.leave(`project:${projectId}`);
    });

    socket.on("chat:send", async ({ projectId, text }) => {
      try {
        if (!projectId || !text?.trim() || !(await canAccess(socket.user, projectId))) return;
        const m = await Message.create({ project: projectId, sender: socket.user._id, text: text.trim() });
        const full = await m.populate("sender", "name email");
        io.to(`project:${projectId}`).emit("chat:new", full);
      } catch (error) {
        console.error("Chat message error:", error);
      }
    });

    socket.on("typing", async ({ projectId }) => {
      if (!projectId || !(await canAccess(socket.user, projectId))) return;
      socket.to(`project:${projectId}`).emit("typing", { user: socket.user.name });
    });

    socket.on("disconnect", () => console.log(`User disconnected: ${socket.user.name}`));
  });
};
