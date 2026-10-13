// ==========================================
// SHIPPING ROUTES
// ==========================================

const express = require("express");
const router = express.Router();
const {
    listShipments,
    getShipmentById,
    createShipment,
    updateShipment,
    updateShipmentStatus,
    deleteShipment,
    trackShipment,
    trackByOrderId,
    getShippingSettings,
    updateShippingSettings,
    getShippingZones,
    createShippingZone,
    updateShippingZone,
    deleteShippingZone,
    getUserNotifications,
    markNotificationRead,
    getPendingOrders
} = require("../controllers/shippingController");


// ==========================================
// SHIPMENT CRUD
// ==========================================
router.get("/", listShipments);
router.post("/", createShipment);
router.get("/pending-orders", getPendingOrders);
router.get("/track/:trackingNumber", trackShipment);
router.get("/track-order/:orderId", trackByOrderId);
router.get("/:id", getShipmentById);
router.put("/:id", updateShipment);
router.put("/:id/status", updateShipmentStatus);
router.delete("/:id", deleteShipment);


// ==========================================
// SHIPPING SETTINGS
// ==========================================
router.get("/settings/all", getShippingSettings);
router.put("/settings/update", updateShippingSettings);


// ==========================================
// SHIPPING ZONES
// ==========================================
router.get("/zones/all", getShippingZones);
router.post("/zones/add", createShippingZone);
router.put("/zones/:id", updateShippingZone);
router.delete("/zones/:id", deleteShippingZone);


// ==========================================
// NOTIFICATIONS
// ==========================================
router.get("/notifications/user/:userId", getUserNotifications);
router.put("/notifications/:id/read", markNotificationRead);


module.exports = router;
