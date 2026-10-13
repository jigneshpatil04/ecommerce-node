
// ==========================================
// REVIEW ROUTES
// ==========================================

const express = require("express");

const router = express.Router();

const reviewController =
    require("../controllers/reviewController");


// ==========================================
// GET REVIEWS
// ==========================================

router.get(
    "/product/:productId",
    reviewController.getProductReviews
);

router.get(
    "/can-review/:productId",
    reviewController.canReviewProduct
);


// ==========================================
// ADD REVIEW
// ==========================================

router.post(
    "/",
    reviewController.addReview
);


// ==========================================
// UPDATE REVIEW
// ==========================================

router.put(
    "/:id",
    reviewController.updateReview
);


// ==========================================
// DELETE REVIEW
// ==========================================

router.delete(
    "/:id",
    reviewController.deleteReview
);


module.exports = router;

