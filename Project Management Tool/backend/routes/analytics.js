const r = require("express").Router();
const c = require("../controllers/analyticsController");
const { protect } = require("../middleware/auth");
r.use(protect);
r.get("/overview", c.overview);
r.get("/project/:projectId", c.byProject);
module.exports = r;
