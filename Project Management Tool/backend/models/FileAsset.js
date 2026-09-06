const mongoose = require("mongoose");
const FileSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", index: true },
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", index: true },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    originalName: String,
    fileName: String,
    mimeType: String,
    size: Number,
    url: String,
  },
  { timestamps: true }
);
module.exports = mongoose.model("FileAsset", FileSchema);
