// ==========================================
// WISHLIST ROUTES
// ==========================================

const express = require("express");

const router = express.Router();

const wishlistController =
    require("../controllers/wishlistController");


// ==========================================
// ADD TO WISHLIST
// POST /api/wishlist
// ==========================================

router.post(
    "/",
    wishlistController.addToWishlist
);


// ==========================================
// GET WISHLIST
// GET /api/wishlist?user_id=1
// ==========================================

router.get(
    "/",
    wishlistController.getWishlist
);


// ==========================================
// REMOVE FROM WISHLIST
// DELETE /api/wishlist/:productId
// ==========================================

router.delete(
    "/:productId",
    wishlistController.removeFromWishlist
);


module.exports = router;