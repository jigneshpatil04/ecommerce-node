// ============================================================
// INVENTORY MANAGEMENT ROUTES
// ============================================================

const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");

// Get full inventory overview, filtered products & stats
router.get("/", inventoryController.getInventory);

// Update single base product stock
router.put("/product/:id/stock", inventoryController.updateProductStock);

// Update specific variant stock (size & color)
router.put("/variant/:id/stock", inventoryController.updateVariantStock);

// Quick Restock (+Quantity)
router.post("/quick-restock", inventoryController.quickRestock);

// Bulk Update multiple variants / products
router.post("/bulk-update", inventoryController.bulkUpdateStock);

module.exports = router;
