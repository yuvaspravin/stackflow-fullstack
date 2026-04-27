const fs = require("fs");
const csv = require("csv-parser");
const mongoose = require("mongoose");

// IMPORT YOUR MODELS HERE
const Product = require("../models/Product");
// const User = require('../models/User'); // Uncomment when you create these
// const Order = require('../models/Order');

// THE DICTIONARY: Maps the URL parameter to the correct Model and Unique Key
const dataConfig = {
  products: { model: Product, uniqueKey: "sku" },
  // users: { model: User, uniqueKey: 'email' },
  // orders: { model: Order, uniqueKey: 'orderId' }
};

// UNIVERSAL EXPORT
exports.exportData = async (req, res) => {
  const { type } = req.params; // e.g., 'products' or 'users'
  const config = dataConfig[type];

  if (!config)
    return res.status(400).json({ message: "Invalid data type requested" });

  try {
    // .lean() strips out Mongoose formatting and gives us plain JSON objects
    const data = await config.model.find({}).lean();
    if (data.length === 0)
      return res.status(404).json({ message: "No data found to export" });

    // Dynamically grab all column headers from the first item (ignoring MongoDB internal keys)
    const headers = Object.keys(data[0]).filter(
      (key) => key !== "_id" && key !== "__v",
    );

    // Build CSV string
    let csvData = headers.join(",") + "\n";
    data.forEach((row) => {
      const rowValues = headers.map((header) => `"${row[header] || ""}"`);
      csvData += rowValues.join(",") + "\n";
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${type}_export.csv`,
    );
    res.status(200).send(csvData);
  } catch (error) {
    res
      .status(500)
      .json({ message: `Failed to export ${type}`, error: error.message });
  }
};

// UNIVERSAL IMPORT
exports.importData = async (req, res) => {
  const { type } = req.params;
  const config = dataConfig[type];

  if (!config)
    return res.status(400).json({ message: "Invalid data type requested" });
  if (!req.file)
    return res.status(400).json({ message: "No CSV file uploaded" });

  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        // NEW SECURE CHECK: Did the CSV parser find any actual data rows?
        if (results.length === 0) {
          fs.unlinkSync(req.file.path); // Clean up the empty temp file
          return res
            .status(400)
            .json({ message: "The uploaded CSV contains no data rows." });
        }

        // Dynamically build bulk operations based on the Dictionary's uniqueKey
        const ops = results.map((row) => ({
          updateOne: {
            filter: { [config.uniqueKey]: row[config.uniqueKey] },
            update: { $set: row },
            upsert: true,
          },
        }));

        await config.model.bulkWrite(ops);
        fs.unlinkSync(req.file.path); // Delete temp file

        res.status(200).json({
          message: `Successfully imported ${results.length} ${type}.`,
        });
      } catch (error) {
        res
          .status(500)
          .json({ message: `Failed to import ${type}`, error: error.message });
      }
    });
};
