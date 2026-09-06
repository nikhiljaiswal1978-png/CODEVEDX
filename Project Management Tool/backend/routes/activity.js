const r = require("express").Router();
const c = require("../controllers/activityController");
const { protect } = require("../middleware/auth");
r.use(protect);
r.get("/project/:projectId", c.byProject);
module.exports = r;
