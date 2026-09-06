const r = require("express").Router();
const c = require("../controllers/messageController");
const { protect } = require("../middleware/auth");
r.use(protect);
r.get("/project/:projectId", c.list);
r.post("/project/:projectId", c.create);
module.exports = r;
