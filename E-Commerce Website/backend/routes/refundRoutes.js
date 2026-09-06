import express from "express";

import {
  createComplaint,
  getComplaintById,
  getMyComplaints,
  getAllComplaints,
  updateComplaint,
  deleteComplaint,
} from "../controllers/refundController.js";

import {
  protect,
  adminOnly,
} from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/",
  protect,
  createComplaint
);
router.get(
  "/my",
  protect,
  getMyComplaints
);

router.get(
  "/:id",
  protect,
  getComplaintById
);

router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAllComplaints
);

router.put(
  "/:id",
  protect,
  adminOnly,
  updateComplaint
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteComplaint
);

export default router;
