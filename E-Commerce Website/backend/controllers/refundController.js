
import RefundComplaint from "../models/RefundComplaint.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const createComplaint = async (req, res, next) => {
  try {
    const {
      orderId,
      productId,
      reason,
      description,
    } = req.body;

    if (!orderId || !productId || !reason || !description) {
      return res.status(400).json({
        message: "All complaint fields are required.",
      });
    }
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (order.status !== "delivered") {
      return res.status(400).json({
        message:
          "Complaint can only be raised for a delivered order.",
      });
    }
    const orderItem = order.items.find(
      (item) =>
        item.product.toString() === productId.toString()
    );

    if (!orderItem) {
      return res.status(400).json({
        message:
          "This product does not belong to this order.",
      });
    }

    const validReasons = [
      "Damaged Product",
      "Wrong Product",
      "Missing Parts",
      "Defective Product",
      "Other",
    ];

    if (!validReasons.includes(reason)) {
      return res.status(400).json({
        message: "Invalid complaint reason.",
      });
    }

    const cleanDescription = description.trim();

    if (cleanDescription.length < 10) {
      return res.status(400).json({
        message:
          "Description must contain at least 10 characters.",
      });
    }

    if (cleanDescription.length > 1000) {
      return res.status(400).json({
        message:
          "Description cannot exceed 1000 characters.",
      });
    }

    const existingComplaint =
      await RefundComplaint.findOne({
        order: orderId,
        product: productId,
      });

    if (existingComplaint) {
      return res.status(409).json({
        message:
          "A complaint has already been raised for this product in this order.",
        complaint: existingComplaint,
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    const complaint = await RefundComplaint.create({
      order: order._id,
      user: req.user._id,
      product: product._id,
      productName:
        orderItem.name ||
        product.name ||
        "Unknown Product",
      reason,
      description: cleanDescription,
      status: "pending",
      adminRemark: "",
    });

    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully.",
      complaint,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "A complaint has already been raised for this product in this order.",
      });
    }

    next(error);
  }
};

export const getComplaintById = async (req,res,next) => {
  try {
    const complaint =
      await RefundComplaint.findOne({
        _id: req.params.id,
        user: req.user._id,
      })
        .populate("product", "name image price")
        .populate("order", "_id status");

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found.",
      });
    }

    res.json({
      success: true,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyComplaints = async ( req,  res,  next) => {
  try {
    const complaints =
      await RefundComplaint.find({
        user: req.user._id,
      })
        .populate("product", "name image price")
        .populate("order", "_id status")
        .sort({ createdAt: -1 });

    res.json({
      success: true,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllComplaints = async (req,  res,  next) => {
  try {
    const complaints =
      await RefundComplaint.find()
        .populate("user", "name email")
        .populate("product", "name image price")
        .populate("order", "_id status")
        .sort({ createdAt: -1 });

    res.json({
      success: true,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

export const updateComplaint = async (req, res,  next) => {
  try {
    const {
      status,
      adminRemark,
    } = req.body;

    const validStatuses = [
      "pending",
      "approved",
      "rejected",
      "refunded",
    ];

    if (
      status &&
      !validStatuses.includes(status)
    ) {
      return res.status(400).json({
        message: "Invalid complaint status.",
      });
    }

    const complaint =
      await RefundComplaint.findById(
        req.params.id
      );

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found.",
      });
    }

    if (status) {
      complaint.status = status;
    }

    if (adminRemark !== undefined) {
      complaint.adminRemark =
        adminRemark.trim();
    }

    await complaint.save();

    const updatedComplaint =
      await RefundComplaint.findById(
        complaint._id
      )
        .populate("user", "name email")
        .populate("product", "name image price")
        .populate("order", "_id status");

    res.json({
      success: true,
      message: "Complaint updated successfully.",
      complaint: updatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};


export const deleteComplaint = async (req,res,next) => {
  try {
    const complaint =
      await RefundComplaint.findById(
        req.params.id
      );

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found.",
      });
    }

    await complaint.deleteOne();

    res.json({
      success: true,
      message: "Complaint deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
