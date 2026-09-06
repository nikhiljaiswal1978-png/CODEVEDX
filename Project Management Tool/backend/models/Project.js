const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["active", "on-hold", "completed", "archived"], default: "active" },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    color: { type: String, default: "#6366f1" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", ProjectSchema);
