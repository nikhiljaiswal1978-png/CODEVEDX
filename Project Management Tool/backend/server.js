require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const { initSocket } = require("./socket/socket");

const app = express();
const server = http.createServer(app);

const PORT = Number(process.env.PORT) || 5000;
const ORIGIN = process.env.CLIENT_URL || "http://localhost:3000";

app.use(
  cors({
    origin: ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

connectDB();

const io = new Server(server, {
  cors: {
    origin: ORIGIN,
    credentials: true,
  },
});

initSocket(io);

app.set("io", io);

// Routes
app.get("/api/health", (_, res) => {
  res.json({ ok: true });
});
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/comments", require("./routes/comments"));
app.use("/api/activity", require("./routes/activity"));
app.use("/api/uploads", require("./routes/uploads"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/analytics", require("./routes/analytics"));

app.use((req, res) => {
  res.status(404).json({
    message: "Not found",
  });
});

app.use((err, req, res, _next) => {
  console.error(err);

  res.status(err.status || 500).json({
    message: err.message || "Server error",
  });
});

server.listen(PORT, () => {
  console.log(`API + Socket.IO running on http://localhost:${PORT}`);
});