import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/ecomm");

    console.log("MongoDB connected");
  } catch (error) {
    console.log("MongoDB connection failed:", error.message);
  }
};