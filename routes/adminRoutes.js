// ==========================================
// ADMIN ROUTES
// ==========================================

const express = require("express");

const router = express.Router();


// ==========================================
// ADMIN CONTROLLER
// ==========================================

const adminController =
    require("../controllers/adminController");

const orderController =
    require("../controllers/orderController");


// ==========================================
// ADMIN LOGIN
// POST /api/admin/login
// ==========================================

router.post(
    "/login",
    adminController.loginAdmin
);


// ==========================================
// ADMIN DASHBOARD DATA
// GET /api/admin/dashboard
// ==========================================

router.get(
    "/dashboard",
    adminController.getDashboardData
);


// ==========================================
// ADMIN ORDERS
// GET /api/admin/orders
// ==========================================

router.get(
    "/orders",
    orderController.getOrders
);


// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;