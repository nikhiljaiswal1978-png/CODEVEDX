import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/auth.js";

export const generateToken = (id) =>
  jwt.sign(
    { id },
    JWT_SECRET,
    { expiresIn: "7d" }
  );