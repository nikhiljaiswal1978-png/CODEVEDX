const r = require("express").Router();
const c = require("../controllers/commentController");
const { protect } = require("../middleware/auth");
r.use(protect);
r.get("/task/:taskId", c.list);
r.post("/task/:taskId", c.create);
r.delete("/:id", c.remove);
module.exports = r;
