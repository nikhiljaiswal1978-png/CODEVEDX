import express from "express";
import cors from "cors";
import refundRoutes from "./routes/refundRoutes.js";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import userRoutes from "./routes/userRoutes.js";
const app = express();

connectDB();
app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());
app.use("/api/categories", categoryRoutes);
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

app.use("/api/orders", orderRoutes);
app.use("/api/refunds", refundRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});