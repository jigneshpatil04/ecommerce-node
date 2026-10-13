
// ==========================================
// REVIEW CONTROLLER
// ==========================================

const db = require("../config/db");


// ==========================================
// GET PRODUCT REVIEWS
// GET /api/reviews/product/:productId
// ==========================================

exports.getProductReviews = async (req, res) => {

    try {

        const productId = Number(req.params.productId);

        // ==========================================
        // VALIDATE PRODUCT ID
        // ==========================================

        if (!Number.isInteger(productId) || productId <= 0) {

            return res.status(400).json({

                success: false,

                message: "Invalid product ID."

            });

        }


        // ==========================================
        // GET REVIEWS
        // ==========================================

        const [reviews] = await db.query(
            `
            SELECT
                r.id,
                r.product_id,
                r.user_id,
                r.rating,
                r.review,
                r.review AS review_text,
                r.created_at,
                r.updated_at,
                COALESCE(
                    u.name,
                    'Customer'
                ) AS user_name,
                EXISTS(
                    SELECT 1 FROM orders o
                    JOIN order_items oi ON o.id = oi.order_id
                    WHERE o.user_id = r.user_id 
                      AND oi.product_id = r.product_id 
                      AND LOWER(o.status) = 'delivered'
                ) AS verified_buyer
            FROM reviews r
            LEFT JOIN users u
                ON r.user_id = u.id
            WHERE r.product_id = ?
            ORDER BY r.created_at DESC
            `,
            [productId]
        );

        // ==========================================
        // CALCULATE RATING SUMMARY
        // ==========================================

        let averageRating = 0;
        const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        if (reviews.length > 0) {
            const totalRating = reviews.reduce(
                (sum, item) => {
                    const r = Math.min(5, Math.max(1, Math.round(Number(item.rating) || 5)));
                    starCounts[r] = (starCounts[r] || 0) + 1;
                    return sum + Number(item.rating);
                },
                0
            );

            averageRating = Number(
                (totalRating / reviews.length).toFixed(1)
            );
        }

        // ==========================================
        // RESPONSE
        // ==========================================

        res.json({
            success: true,
            summary: {
                total_reviews: reviews.length,
                average_rating: averageRating,
                star_counts: starCounts
            },
            totalReviews: reviews.length,
            averageRating: averageRating,
            reviews: reviews
        });

    }

    catch (error) {

        console.error(
            "GET REVIEWS ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to load reviews."

        });

    }

};


// ==========================================
// CHECK USER REVIEW ELIGIBILITY
// GET /api/reviews/can-review/:productId
// ==========================================

exports.canReviewProduct = async (req, res) => {
    try {
        const productId = Number(req.params.productId);
        const userId = Number(req.query.user_id || req.query.userId);

        if (!productId || !userId) {
            return res.json({
                success: true,
                canReview: false,
                hasDeliveredOrder: false,
                reason: "Login required"
            });
        }

        // Check if user has an order for this product that is delivered
        const [deliveredOrders] = await db.query(
            `
            SELECT o.id, o.status, o.created_at
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = ? 
              AND oi.product_id = ? 
              AND LOWER(o.status) = 'delivered'
            LIMIT 1
            `,
            [userId, productId]
        );

        // Check if user already reviewed
        const [existing] = await db.query(
            `
            SELECT id, rating, review, review AS review_text, created_at
            FROM reviews
            WHERE product_id = ? AND user_id = ?
            LIMIT 1
            `,
            [productId, userId]
        );

        const hasDelivered = deliveredOrders.length > 0;
        const alreadyReviewed = existing.length > 0;

        res.json({
            success: true,
            hasDeliveredOrder: hasDelivered,
            canReview: true,
            isDeliveredBuyer: hasDelivered,
            alreadyReviewed: alreadyReviewed,
            existingReview: alreadyReviewed ? existing[0] : null
        });
    } catch (error) {
        console.error("CAN REVIEW CHECK ERROR:", error);
        res.status(500).json({ success: false, message: "Error checking review eligibility" });
    }
};


// ==========================================
// CREATE / ADD REVIEW
// POST /api/reviews
// ==========================================

exports.createReview = async (req, res) => {

    try {

        const {

            product_id,

            user_id,

            rating,

            review,

            review_text

        } = req.body;


        const rawReview = (review !== undefined && review !== null) ? review : review_text;

        // ==========================================
        // VALIDATE REQUIRED FIELDS
        // ==========================================

        if (
            !product_id ||
            !user_id ||
            rating === undefined ||
            rating === null ||
            rawReview === undefined ||
            rawReview === null ||
            String(rawReview).trim() === ""
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Product, user, rating and review are required."

            });

        }


        // ==========================================
        // CONVERT VALUES
        // ==========================================

        const productId =
            Number(product_id);

        const userId =
            Number(user_id);

        const reviewRating =
            Number(rating);

        const reviewText =
            String(rawReview).trim();


        // ==========================================
        // VALIDATE PRODUCT ID
        // ==========================================

        if (
            !Number.isInteger(productId) ||
            productId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid product ID."

            });

        }


        // ==========================================
        // VALIDATE USER ID
        // ==========================================

        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid user ID."

            });

        }


        // ==========================================
        // VALIDATE RATING
        // ==========================================

        if (
            !Number.isInteger(reviewRating) ||
            reviewRating < 1 ||
            reviewRating > 5
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Rating must be between 1 and 5."

            });

        }


        // ==========================================
        // VALIDATE REVIEW TEXT
        // ==========================================

        if (!reviewText) {

            return res.status(400).json({

                success: false,

                message:
                    "Please write a review."

            });

        }


        // ==========================================
        // CHECK PRODUCT
        // ==========================================

        const [product] =
            await db.query(

                `
                SELECT id

                FROM products

                WHERE id = ?
                `,

                [productId]

            );


        if (product.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Product not found."

            });

        }


        // ==========================================
        // CHECK EXISTING REVIEW
        // ==========================================

        const [existingReview] =
            await db.query(

                `
                SELECT id

                FROM reviews

                WHERE product_id = ?

                AND user_id = ?
                `,

                [
                    productId,
                    userId
                ]

            );


        if (existingReview.length > 0) {
            await db.query(
                `
                UPDATE reviews
                SET rating = ?, review = ?, updated_at = NOW()
                WHERE id = ? AND user_id = ?
                `,
                [reviewRating, reviewText, existingReview[0].id, userId]
            );

            return res.status(200).json({
                success: true,
                message: "Your review has been updated successfully!",
                reviewId: existingReview[0].id,
                review_id: existingReview[0].id,
                isUpdate: true
            });
        }


        // ==========================================
        // INSERT REVIEW
        // ==========================================

        const [result] =
            await db.query(

                `
                INSERT INTO reviews

                (
                    product_id,
                    user_id,
                    rating,
                    review
                )

                VALUES (?, ?, ?, ?)
                `,

                [
                    productId,
                    userId,
                    reviewRating,
                    reviewText
                ]

            );


        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(201).json({

            success: true,

            message:
                "Review added successfully.",

            reviewId:
                result.insertId,

            review_id:
                result.insertId

        });

    }

    catch (error) {

        console.error(
            "CREATE REVIEW ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to add review."

        });

    }

};



// ==========================================
// ALIAS
// Allows routes using addReview to continue
// ==========================================

exports.addReview =
    exports.createReview;



// ==========================================
// UPDATE REVIEW
// PUT /api/reviews/:id
// ==========================================

exports.updateReview = async (req, res) => {

    try {

        const reviewId =
            Number(req.params.id);

        const {

            user_id,

            rating,

            review,

            review_text

        } = req.body;


        // ==========================================
        // VALIDATE REVIEW ID
        // ==========================================

        if (
            !Number.isInteger(reviewId) ||
            reviewId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid review ID."

            });

        }


        // ==========================================
        // VALIDATE USER
        // ==========================================

        const userId =
            Number(user_id);

        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Review ID and user ID are required."

            });

        }


        // ==========================================
        // CONVERT VALUES
        // ==========================================

        const reviewRating =
            Number(rating);

        const rawReview = (review !== undefined && review !== null) ? review : review_text;
        const reviewText =
            String(rawReview || "").trim();


        // ==========================================
        // VALIDATE RATING
        // ==========================================

        if (
            !Number.isInteger(reviewRating) ||
            reviewRating < 1 ||
            reviewRating > 5
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Rating must be between 1 and 5."

            });

        }


        // ==========================================
        // VALIDATE REVIEW
        // ==========================================

        if (!reviewText) {

            return res.status(400).json({

                success: false,

                message:
                    "Review cannot be empty."

            });

        }


        // ==========================================
        // CHECK REVIEW OWNERSHIP
        // ==========================================

        const [existingReview] =
            await db.query(

                `
                SELECT id

                FROM reviews

                WHERE id = ?

                AND user_id = ?
                `,

                [
                    reviewId,
                    userId
                ]

            );


        if (existingReview.length === 0) {

            return res.status(403).json({

                success: false,

                message:
                    "You can only edit your own review."

            });

        }


        // ==========================================
        // UPDATE REVIEW
        // ==========================================

        await db.query(

            `
            UPDATE reviews

            SET

                rating = ?,

                review = ?

            WHERE id = ?

            AND user_id = ?
            `,

            [
                reviewRating,

                reviewText,

                reviewId,

                userId
            ]

        );


        // ==========================================
        // RESPONSE
        // ==========================================

        res.json({

            success: true,

            message:
                "Review updated successfully."

        });

    }

    catch (error) {

        console.error(
            "UPDATE REVIEW ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to update review."

        });

    }

};



// ==========================================
// DELETE REVIEW
// DELETE /api/reviews/:id
// ==========================================

exports.deleteReview = async (req, res) => {

    try {

        const reviewId =
            Number(req.params.id);


        // ==========================================
        // GET USER ID
        // Supports body OR query parameter
        // ==========================================

        const userId =
            Number(
                req.body?.user_id ||
                req.query.user_id
            );


        // ==========================================
        // VALIDATE IDs
        // ==========================================

        if (
            !Number.isInteger(reviewId) ||
            reviewId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid review ID."

            });

        }


        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Review ID and user ID are required."

            });

        }


        // ==========================================
        // CHECK REVIEW OWNERSHIP
        // ==========================================

        const [existingReview] =
            await db.query(

                `
                SELECT id

                FROM reviews

                WHERE id = ?

                AND user_id = ?
                `,

                [
                    reviewId,
                    userId
                ]

            );


        if (existingReview.length === 0) {

            return res.status(403).json({

                success: false,

                message:
                    "You can only delete your own review."

            });

        }


        // ==========================================
        // DELETE REVIEW
        // ==========================================

        const [result] =
            await db.query(

                `
                DELETE FROM reviews

                WHERE id = ?

                AND user_id = ?
                `,

                [
                    reviewId,
                    userId
                ]

            );


        // ==========================================
        // CHECK DELETE RESULT
        // ==========================================

        if (
            result.affectedRows === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Review not found."

            });

        }


        // ==========================================
        // RESPONSE
        // ==========================================

        res.json({

            success: true,

            message:
                "Review deleted successfully."

        });

    }

    catch (error) {

        console.error(
            "DELETE REVIEW ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to delete review."

        });

    }

};

