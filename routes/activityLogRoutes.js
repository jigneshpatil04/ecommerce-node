// ==========================================
// ACTIVITY LOG ROUTES
// ==========================================

const express = require("express");
const router = express.Router();
const {
    getActivityLogs,
    getActivityStats,
    createActivityLog,
    clearActivityLogs,
    exportActivityLogs
} = require("../controllers/activityLogController");

router.get("/", getActivityLogs);
router.get("/stats", getActivityStats);
router.get("/export", exportActivityLogs);
router.post("/", createActivityLog);
router.post("/clear", clearActivityLogs);

module.exports = router;
