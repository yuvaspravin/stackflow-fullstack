const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true }, // Denormalized for speed
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity cannot be less than 1"],
  },
  priceAtPurchase: {
    type: Number,
    required: true,
    min: 0,
  },
});

const paymentRecordSchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 0 },
  date: { type: Date, default: Date.now },
  method: { type: String, required: true },
  note: { type: String, default: "" },
});

const orderSchema = new mongoose.Schema(
  {
    // Indexing orderId makes searching 10x faster
    orderId: { type: String, required: true, unique: true, index: true },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    customerName: { type: String, required: true }, // Denormalized

    items: [orderItemSchema],

    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    dueAmount: { type: Number, default: 0, min: 0 },

    paymentStatus: {
      type: String,
      enum: ["Paid", "Unpaid", "Partially Paid"],
      default: "Unpaid",
      index: true, // Useful for "Unpaid Orders" dashboard widgets
    },

    paymentHistory: [paymentRecordSchema],

    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "Bank Transfer", "Pending"],
      default: "Pending",
    },

    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
      index: true,
    },

    dueDate: { type: Date },
  },
  {
    timestamps: true, // Automatically handles createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

module.exports = mongoose.model("Order", orderSchema);
