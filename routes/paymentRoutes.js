// ==========================================
// PAYMENT ROUTES
// ==========================================

const express = require("express");
const router = express.Router();
const {
    getPayments,
    getPaymentStats,
    getPaymentById,
    updatePaymentStatus,
    getRefunds,
    createRefund,
    updateRefundStatus,
    exportPayments
} = require("../controllers/paymentController");

// Stats & KPI
router.get("/stats", getPaymentStats);

// Export payments
router.get("/export", exportPayments);

// Refund management
router.get("/refunds", getRefunds);
router.post("/refunds", createRefund);
router.put("/refunds/:id/status", updateRefundStatus);

// Payments list & details
router.get("/", getPayments);
router.get("/:id", getPaymentById);
router.put("/:id/status", updatePaymentStatus);

module.exports = router;
