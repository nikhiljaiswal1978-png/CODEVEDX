import Order from "../models/Order.js";
import Product from "../models/Product.js";
import PDFDocument from "pdfkit";


const passesLuhnCheck = (digits) => {
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (alternate) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alternate = !alternate;
  }
  return sum % 10 === 0;
};

const isExpiryValid = (expiry) => {
  const match = /^(\d{2})\s*\/\s*(\d{2})$/.exec((expiry || "").trim());
  if (!match) return false;
  const month = parseInt(match[1], 10);
  const year = 2000 + parseInt(match[2], 10);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  if (year < now.getFullYear()) return false;
  if (year === now.getFullYear() && month < now.getMonth() + 1) return false;
  return true;
};

const processPayment = ({ cardNumber, expiry, cvv }) => {
  if (!cardNumber || !expiry || !cvv) {
    return { success: false, message: "Missing card details" };
  }

  const digits = cardNumber.replace(/\s/g, "");
  if (digits.length < 13 || digits.length > 19 || !/^\d+$/.test(digits)) {
    return { success: false, message: "Enter a valid card number" };
  }
  if (!passesLuhnCheck(digits)) {
    return { success: false, message: "That card number isn't valid — check the digits" };
  }
  if (!isExpiryValid(expiry)) {
    return { success: false, message: "Card is expired or the expiry date is invalid" };
  }
  if (!/^\d{3,4}$/.test((cvv || "").trim())) {
    return { success: false, message: "Enter a valid CVV" };
  }

  if (digits.startsWith("4000000000000002")) {
    return { success: false, message: "Card declined" };
  }

  return {
    success: true,
    id: "sim_" + Math.random().toString(36).slice(2, 12),
    status: "succeeded",
    last4: digits.slice(-4),
  };
};

export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, card, paymentMethod = "card" } = req.body;

    if (!["card", "cod"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    let itemsPrice = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: `Product ${item.productId} not found` });
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `${product.name} is out of stock` });
      }
      itemsPrice += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
      });
    }

    const shippingPrice = itemsPrice > 100 ? 0 : 9.99;
    const codFee = paymentMethod === "cod" ? 2 : 0;
    const totalPrice = Number((itemsPrice + shippingPrice + codFee).toFixed(2));

    let orderData = {
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      codFee,
      totalPrice,
    };

    if (paymentMethod === "cod") {
      orderData = { ...orderData, isPaid: false, status: "pending" };
    } else {
      const payment = processPayment(card || {});
      if (!payment.success) {
        return res.status(402).json({ message: payment.message });
      }
      orderData = {
        ...orderData,
        paymentResult: { id: payment.id, status: payment.status, last4: payment.last4 },
        isPaid: true,
        paidAt: new Date(),
        status: "paid",
      };
    }

    const order = await Order.create(orderData);

    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// --- Admin-only ---

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "paid", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    if (order.paymentMethod === "cod" && status === "delivered" && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = new Date();
    }
    await order.save();

    res.json(order);
  } catch (err) {
    next(err);
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const [totalOrders, totalProducts, totalUsers, revenueAgg, lowStock] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      (await import("../models/User.js")).default.countDocuments(),
      Order.aggregate([{ $match: { isPaid: true } }, { $group: { _id: null, total: { $sum: "$totalPrice" } } }]),
      Product.find({ stock: { $lte: 5 } }).select("name stock"),
    ]);
    res.json({
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue: revenueAgg[0]?.total || 0,
      lowStock,
    });
  } catch (err) {
    next(err);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to modify this order" });
    }
    if (!["pending", "paid"].includes(order.status)) {
      return res.status(400).json({
        message: `Orders that are already ${order.status} can't be cancelled here — contact support.`,
      });
    }

    order.status = "cancelled";
    await order.save();
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
};

export const confirmDelivery = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to modify this order" });
    }
    if (order.status !== "shipped") {
      return res.status(400).json({ message: "Only shipped orders can be marked as received" });
    }

    order.status = "delivered";
    if (order.paymentMethod === "cod" && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = new Date();
    }
    await order.save();

    res.json(order);
  } catch (err) {
    next(err);
  }
};

export const downloadInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Not authorized to access this invoice",
      });
    }
    if (
      order.status === "pending" ||
      order.status === "cancelled"
    ) {
      return res.status(400).json({
        message: "Invoice is not available for this order",
      });
    }

    const doc = new PDFDocument({
      margin: 50,
    });

    const filename = `invoice-${order._id}.pdf`;

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    doc.pipe(res);
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("FERNWEG");

    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Your trusted online shopping store");

    doc.moveDown();

    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("INVOICE", {
        align: "right",
      });

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(
        `Invoice Date: ${new Date(
          order.createdAt
        ).toLocaleDateString("en-IN")}`,
        {
          align: "right",
        }
      );

    doc.text(
      `Order ID: ${order._id}`,
      {
        align: "right",
      }
    );

    doc.moveDown(2);
    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .text("Bill To:");

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(
        order.shippingAddress?.fullName ||
          order.user?.name ||
          "Customer"
      );

    if (order.user?.email) {
      doc.text(order.user.email);
    }

    if (order.shippingAddress?.street) {
      doc.text(order.shippingAddress.street);
    }

    if (order.shippingAddress?.city) {
      doc.text(
        `${order.shippingAddress.city}, ${
          order.shippingAddress.postalCode || ""
        }`
      );
    }

    if (order.shippingAddress?.country) {
      doc.text(order.shippingAddress.country);
    }

    doc.moveDown(2);
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Payment Information");

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(
        `Payment Method: ${order.paymentMethod.toUpperCase()}`
      );

    doc.text(
      `Payment Status: ${
        order.isPaid ? "Paid" : "Pending"
      }`
    );

    if (order.paidAt) {
      doc.text(
        `Paid At: ${new Date(
          order.paidAt
        ).toLocaleDateString("en-IN")}`
      );
    }

    doc.moveDown(2);
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Order Items");

    doc.moveDown(0.5);

    const tableTop = doc.y;

    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("Product", 50, tableTop);

    doc.text("Qty", 330, tableTop);

    doc.text("Price", 390, tableTop);

    doc.text("Total", 460, tableTop);

    doc
      .moveTo(50, tableTop + 18)
      .lineTo(545, tableTop + 18)
      .stroke();

    let y = tableTop + 28;

    order.items.forEach((item) => {
      const itemTotal =
        Number(item.price || 0) *
        Number(item.quantity || 0);

      doc
        .font("Helvetica")
        .fontSize(10)
        .text(
          item.name || "Product",
          50,
          y,
          {
            width: 260,
          }
        );

      doc.text(
        String(item.quantity),
        330,
        y
      );

      doc.text(
        `₹${Number(item.price || 0).toFixed(2)}`,
        390,
        y
      );

      doc.text(
        `₹${itemTotal.toFixed(2)}`,
        460,
        y
      );

      y += 25;

      if (y > 700) {
        doc.addPage();
        y = 50;
      }
    });

    doc.moveTo(50, y).lineTo(545, y).stroke();
    y += 15;

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(
        `Items Price: ₹${Number(
          order.itemsPrice || 0
        ).toFixed(2)}`,
        350,
        y
      );

    y += 20;

    doc.text(
      `Shipping: ₹${Number(
        order.shippingPrice || 0
      ).toFixed(2)}`,
      350,
      y
    );

    y += 20;

    doc.text(
      `COD Fee: ₹${Number(
        order.codFee || 0
      ).toFixed(2)}`,
      350,
      y
    );

    y += 20;

    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .text(
        `Grand Total: ₹${Number(
          order.totalPrice || 0
        ).toFixed(2)}`,
        350,
        y
      );

      doc
      .fontSize(10)
      .font("Helvetica")
      .text(
        "Thank you for shopping with Fernweg!",
        50,
        750,
        {
          align: "center",
          width: 495,
        }
      );

    doc.end();
  } catch (error) {
    next(error);
  }
};