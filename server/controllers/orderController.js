const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Customer = require("../models/Customer");

exports.createOrder = async (req, res) => {
  // Start a Transaction Session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customerId, items, paidAmount, paymentMethod, status, dueDate } =
      req.body;

    const customer = await Customer.findById(customerId).session(session);
    if (!customer) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Customer not found" });
    }

    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product).session(session);

      if (!product || product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product?.name || "item"}`);
      }

      totalAmount += product.price * item.quantity;
      processedItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      });

      // Update Product Stock
      product.quantity -= item.quantity;
      if (product.quantity < 10) product.status = "Low Stock";
      if (product.quantity === 0) product.status = "Out of Stock";

      await product.save({ session });
    }

    const dueAmount = totalAmount - paidAmount;
    const paymentStatus =
      paidAmount >= totalAmount
        ? "Paid"
        : paidAmount > 0
          ? "Partially Paid"
          : "Unpaid";

    const newOrder = new Order({
      orderId: `ORD-${Date.now().toString().slice(-6)}`,
      customerId,
      customerName: customer.name,
      items: processedItems,
      totalAmount,
      paidAmount,
      dueAmount,
      paymentStatus,
      paymentMethod,
      status,
      dueDate,
    });

    const savedOrder = await newOrder.save({ session });

    // Update Customer Stats
    await Customer.findByIdAndUpdate(
      customerId,
      { $inc: { totalSpent: totalAmount, totalOrders: 1 } },
      { session },
    );

    // If we reach here, commit all changes to the database
    await session.commitTransaction();
    res.status(201).json(savedOrder);
  } catch (err) {
    // If ANY error occurs, roll back ALL changes (Stock won't be deducted)
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    // Improved search: allows searching by Order ID or Customer Name
    const query = search
      ? {
          $or: [
            { orderId: { $regex: search, $options: "i" } },
            { customerName: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(); // Faster performance for read-only queries

    const totalItems = await Order.countDocuments(query);

    res.status(200).json({
      orders,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addPayment = async (req, res) => {
  try {
    const { amount, method, note } = req.body;
    const paymentAmount = Number(amount);

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Guard Clause: Prevent overpayment
    if (paymentAmount > order.dueAmount) {
      return res.status(400).json({
        message: `Payment exceeds balance. Remaining due is ₹${order.dueAmount}`,
      });
    }

    order.paymentHistory.push({ amount: paymentAmount, method, note });
    order.paidAmount += paymentAmount;
    order.dueAmount = order.totalAmount - order.paidAmount;

    // Auto-status update
    if (order.dueAmount <= 0) order.paymentStatus = "Paid";
    else if (order.paidAmount > 0) order.paymentStatus = "Partially Paid";

    await order.save();
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add this to your orderController.js
exports.updateOrder = async (req, res) => {
  try {
    const { items, paidAmount, customerId } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 1. Recalculate Financials based on the new items/payment
    // Logic: priceAtPurchase is used here because we are editing an existing record
    const totalAmount = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    const dueAmount = totalAmount - paidAmount;

    const paymentStatus =
      paidAmount >= totalAmount
        ? "Paid"
        : paidAmount > 0
          ? "Partially Paid"
          : "Unpaid";

    // 2. Apply updates
    order.items = items.map((i) => ({
      product: i.product,
      name: i.name,
      quantity: i.quantity,
      priceAtPurchase: i.price, // Ensuring the key matches your Schema
    }));

    order.customerId = customerId;
    order.paidAmount = paidAmount;
    order.totalAmount = totalAmount;
    order.dueAmount = dueAmount;
    order.paymentStatus = paymentStatus;

    const savedOrder = await order.save();
    res.status(200).json(savedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
