
// ==========================================
// ORDER ROUTES
// ==========================================

const express = require("express");

const router = express.Router();


// ==========================================
// ORDER CONTROLLER
// ==========================================

const orderController = require("../controllers/orderController");


// ==========================================
// CREATE ORDER
// POST /api/orders
// ==========================================

router.post(
    "/",
    orderController.createOrder
);


// ==========================================
// GET USER ORDERS
// GET /api/orders
// ==========================================

router.get(
    "/",
    orderController.getUserOrders
);


// ==========================================
// UPDATE ORDER STATUS
// PUT /api/orders/:id
// ==========================================

router.put(
    "/:id",
    orderController.updateOrderStatus
);


// ==========================================
// GET ORDER DETAILS
// GET /api/orders/:id
// ==========================================

router.get(
    "/:id",
    orderController.getOrderDetails
);


// ==========================================
// CANCEL ORDER
// PUT /api/orders/:id/cancel
// ==========================================

router.put(
    "/:id/cancel",
    orderController.cancelOrder
);


// ==========================================
// CLEAR ALL ORDERS
// DELETE /api/orders/clear-all
// ==========================================

router.delete(
    "/clear-all",
    orderController.clearAllOrders
);

router.post(
    "/clear-all",
    orderController.clearAllOrders
);

router.delete(
    "/clear/all",
    orderController.clearAllOrders
);


// ==========================================
// DELETE ORDER
// DELETE /api/orders/:id
// ==========================================

router.delete(
    "/:id",
    orderController.deleteOrder
);


// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;


