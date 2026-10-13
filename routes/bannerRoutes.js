// ==========================================
// BANNER ROUTES
// ==========================================

const express = require("express");
const router = express.Router();
const bannerController = require("../controllers/bannerController");
const upload = require("../middleware/uploadMiddleware");

// Public user-side active banners
router.get("/", bannerController.getPublicBanners);

// Admin-side all banners (with stats and schedule calculation)
router.get("/admin", bannerController.getAdminBanners);

// Single banner by ID
router.get("/:id", bannerController.getBannerById);

// Create banner (supports image upload)
router.post("/", upload.single("image"), bannerController.createBanner);

// Update banner (supports optional new image upload)
router.put("/:id", upload.single("image"), bannerController.updateBanner);

// Toggle show / hide status
router.patch("/:id/status", bannerController.toggleBannerStatus);

// Delete banner
router.delete("/:id", bannerController.deleteBanner);

module.exports = router;
