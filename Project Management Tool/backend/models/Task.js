const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["todo", "in-progress", "review", "done"], default: "todo" },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    startDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
