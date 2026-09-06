const mongoose = require("mongoose");

module.exports = async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/project_management_tool";
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (e) {
    console.error("Mongo error:", e.message);
    process.exit(1);
  }
};
