const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: { type: String, default: "USA" },
    },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    totalSpent: { type: Number, default: 0 }, // We will update this automatically when they place orders!
    totalOrders: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Customer", customerSchema);
