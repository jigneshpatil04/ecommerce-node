// ==========================================
// ORDER NOTIFICATION ROUTES
// ==========================================

const express = require("express");
const router = express.Router();
const {
    getOrderNotifications,
    getUnreadCount,
    toggleReadStatus,
    markAllAsRead,
    deleteOrderNotification,
    clearReadNotifications
} = require("../controllers/orderNotificationController");

router.get("/", getOrderNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/mark-all-read", markAllAsRead);
router.put("/:id/read", toggleReadStatus);
router.delete("/clear-read", clearReadNotifications);
router.delete("/:id", deleteOrderNotification);

module.exports = router;
