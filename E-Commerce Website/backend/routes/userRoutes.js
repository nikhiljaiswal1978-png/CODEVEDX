import express from "express";
import {
  getUsers,
  getUserById,
} from "../controllers/userController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, adminOnly, getUsers);

router.get("/:id", protect, adminOnly, getUserById);

export default router;