const Product = require("../models/Product");

// READ ALL, SEARCH, SORT & PAGINATE
exports.getProducts = async (req, res) => {
  try {
    // 1. Grab parameters from the URL (with safe defaults)
    const {
      search = "",
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    // 2. Build the Search Query
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { sku: { $regex: search, $options: "i" } },
        ],
      };
    }

    // 3. Math for Pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skipAmount = (pageNumber - 1) * limitNumber;

    // 4. Determine Sort Order (1 for ascending, -1 for descending)
    const sortOrder = order === "asc" ? 1 : -1;

    // 5. Execute the highly-optimized database commands
    const products = await Product.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skipAmount)
      .limit(limitNumber);

    // Get the total count so the frontend knows how many pages there are
    const totalItems = await Product.countDocuments(query);

    // 6. Send back the data AND the pagination metadata
    res.status(200).json({
      products,
      totalPages: Math.ceil(totalItems / limitNumber),
      currentPage: pageNumber,
      totalItems,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};
// READ ONE: For the Edit page to fill out the form
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching product", error: error.message });
  }
};

// CREATE: For adding brand new inventory
exports.addProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error saving product", error: error.message });
  }
};

// UPDATE: For changing price or quantity without creating duplicates
exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found" });

    // Recalculate status just in case the quantity changed during the update
    if (updatedProduct.quantity === 0) updatedProduct.status = "Critical";
    else if (updatedProduct.quantity < 10) updatedProduct.status = "Low Stock";
    else updatedProduct.status = "In Stock";
    await updatedProduct.save();

    res.status(200).json(updatedProduct);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating product", error: error.message });
  }
};

// DELETE: For removing items completely
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct)
      return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
};
