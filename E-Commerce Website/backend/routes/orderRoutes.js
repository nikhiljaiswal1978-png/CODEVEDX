import express from "express";
import {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    confirmDelivery,
    getAllOrders,
    updateOrderStatus,
    getDashboardStats,
    downloadInvoice,
} from "../controllers/orderController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);
router.get("/admin/all", protect, adminOnly, getAllOrders);
router.get("/admin/stats", protect, adminOnly, getDashboardStats);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);
router.get("/:id/invoice", protect, downloadInvoice);
router.put("/:id/cancel", protect, cancelOrder);
router.put("/:id/confirm-delivery", protect, confirmDelivery);
router.get("/:id", protect, getOrderById);

export default router;
