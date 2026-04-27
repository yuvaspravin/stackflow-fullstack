require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB with Auto-Heal armor
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.error("❌ Initial MongoDB Error:", err));

mongoose.connection.on("disconnected", () =>
  console.log("⚠️ MongoDB lost connection!"),
);
mongoose.connection.on("reconnected", () =>
  console.log("🔄 MongoDB auto-reconnected!"),
);

// Register the Routes
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/data", require("./routes/dataRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

// Global Crash Preventer
process.on("unhandledRejection", (err) => {
  console.log("🛑 ERROR CAUGHT (Server kept alive):", err.message);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
