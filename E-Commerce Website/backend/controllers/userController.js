import mongoose from "mongoose";
import User from "../models/User.js";

export const getUsers = async (req, res, next) => {
  try {
    console.log("=================================");
    console.log("GET USERS CONTROLLER STARTED");

    console.log("ADMIN:", req.user);

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    console.log("USERS FOUND:", users.length);
    console.log("USERS:", users);

    return res.status(200).json(users);
  } catch (error) {
    console.error("GET USERS ERROR:", error);

    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    console.log("GET USER BY ID:", req.params.id);

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("GET USER BY ID ERROR:", error);

    next(error);
  }
};