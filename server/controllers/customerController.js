const Customer = require("../models/Customer");

// READ ALL (With Search, Sort, Pagination)
exports.getCustomers = async (req, res) => {
  try {
    const {
      search = "",
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ],
      };
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    const customers = await Customer.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const totalItems = await Customer.countDocuments(query);

    res.status(200).json({
      customers,
      totalPages: Math.ceil(totalItems / limitNumber),
      currentPage: pageNumber,
      totalItems,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching customers", error: error.message });
  }
};

// GET ONE
exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.status(200).json(customer);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching customer", error: error.message });
  }
};

// CREATE
exports.addCustomer = async (req, res) => {
  try {
    const newCustomer = new Customer(req.body);
    const savedCustomer = await newCustomer.save();
    res.status(201).json(savedCustomer);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error saving customer", error: error.message });
  }
};

// UPDATE
exports.updateCustomer = async (req, res) => {
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!updatedCustomer)
      return res.status(404).json({ message: "Customer not found" });
    res.status(200).json(updatedCustomer);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating customer", error: error.message });
  }
};

// DELETE
exports.deleteCustomer = async (req, res) => {
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
    if (!deletedCustomer)
      return res.status(404).json({ message: "Customer not found" });
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting customer", error: error.message });
  }
};
