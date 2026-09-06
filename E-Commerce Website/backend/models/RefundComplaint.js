import mongoose from "mongoose";

const refundComplaintSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    reason: {
      type: String,
      enum: [
        "Damaged Product",
        "Wrong Product",
        "Missing Parts",
        "Defective Product",
        "Other",
      ],
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "refunded",
      ],
      default: "pending",
    },

    adminRemark: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  { timestamps: true }
);

// Prevent duplicate complaint for same order + product
refundComplaintSchema.index(
  { order: 1, product: 1 },
  { unique: true }
);

export default mongoose.model(
  "RefundComplaint",
  refundComplaintSchema
);