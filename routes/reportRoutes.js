// ==========================================
// REPORT & ANALYTICS ROUTES
// ==========================================

const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

// Full analytics metrics & breakdown
router.get("/analytics", reportController.getAnalytics);

// Raw export data
router.get("/export-data", reportController.getExportData);

module.exports = router;
