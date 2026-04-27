const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    quantity: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true },
    currency: {
      type: String,
      default: "USD",
      enum: ["USD", "INR", "EUR", "GBP"],
    },
    status: { type: String, default: "In Stock" },
  },
  { timestamps: true },
);

// Auto-calculate stock status before saving
productSchema.pre("save", function () {
  if (this.quantity === 0) {
    this.status = "Critical";
  } else if (this.quantity < 10) {
    this.status = "Low Stock";
  } else {
    this.status = "In Stock";
  }
});

module.exports = mongoose.model("Product", productSchema);
