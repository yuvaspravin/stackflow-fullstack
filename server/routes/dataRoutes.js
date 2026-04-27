const express = require("express");
const router = express.Router();
const multer = require("multer");
const dataController = require("../controllers/dataController");

// Save files temporarily to an 'uploads' folder
const upload = multer({ dest: "uploads/" });

// The :type parameter will be "products", "users", "orders", etc.
router.get("/export/:type", dataController.exportData);
router.post("/import/:type", upload.single("file"), dataController.importData);

module.exports = router;
