const mongoose = require("mongoose");
const ActivityLogSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", index: true },
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true }, 
    entity: { type: String, required: true }, 
    message: String,
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);
module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
