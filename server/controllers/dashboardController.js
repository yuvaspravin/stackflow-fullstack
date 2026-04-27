const Order = require("../models/Order");
const Product = require("../models/Product");
const Customer = require("../models/Customer");

exports.getDashboardStats = async (req, res) => {
  try {
    const { search = "" } = req.query;

    // 1. Define the Search Query
    const searchQuery = search
      ? {
          $or: [
            { customerName: { $regex: search, $options: "i" } },
            { orderId: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // 2. Fetch data based on search
    const [totalProducts, totalCustomers, filteredOrders] = await Promise.all([
      Product.countDocuments(), // Products usually remain global
      Customer.countDocuments(),
      Order.find(searchQuery).sort({ createdAt: -1 }).lean(),
    ]);

    // 3. RE-CALCULATE EVERYTHING based on the filtered results
    // This makes the CARDS reactive
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce(
      (sum, o) => sum + (o.totalAmount || 0),
      0,
    );
    const totalDues = filteredOrders.reduce(
      (sum, o) => sum + (o.dueAmount || 0),
      0,
    );

    const lowStockCount = await Product.countDocuments({
      quantity: { $lt: 10 },
    });

    // 4. PREPARE CHART DATA based on filtered results
    // This makes the CHART reactive
    const chartData = filteredOrders
      .slice(0, 10)
      .reverse()
      .map((o) => ({
        name: o.orderId.split("-")[1] || o.orderId,
        revenue: o.totalAmount,
      }));

    res.status(200).json({
      stats: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        totalDues,
        lowStockCount,
      },
      recentOrders: filteredOrders.slice(0, 6), // Show top results
      chartData,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
