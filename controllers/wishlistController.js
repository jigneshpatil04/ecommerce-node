// ==========================================
// WISHLIST CONTROLLER
// ==========================================

const db = require("../config/db");


// ==========================================
// ADD PRODUCT TO WISHLIST
// POST /api/wishlist
// ==========================================

exports.addToWishlist = async (req, res) => {

    try {

        const { user_id, product_id } = req.body;

        // Validate
        if (!user_id || !product_id) {

            return res.status(400).json({
                success: false,
                message: "user_id and product_id are required."
            });

        }

        // Check product exists
        const [product] = await db.query(
            "SELECT id FROM products WHERE id = ?",
            [product_id]
        );

        if (product.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Product not found."
            });

        }

        // Check already exists
        const [existing] = await db.query(
            `SELECT id
             FROM wishlist
             WHERE user_id = ? AND product_id = ?`,
            [user_id, product_id]
        );

        if (existing.length > 0) {

            return res.status(409).json({
                success: false,
                message: "Product is already in wishlist."
            });

        }

        // Insert wishlist
        const [result] = await db.query(
            `INSERT INTO wishlist
             (user_id, product_id)
             VALUES (?, ?)`,
            [user_id, product_id]
        );

        res.status(201).json({
            success: true,
            message: "Product added to wishlist.",
            wishlist_id: result.insertId
        });

    } catch (error) {

        console.error(
            "Add Wishlist Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to add product to wishlist."
        });

    }

};


// ==========================================
// GET USER WISHLIST
// GET /api/wishlist?user_id=1
// ==========================================

exports.getWishlist = async (req, res) => {

    try {

        const user_id = req.query.user_id;

        if (!user_id) {

            return res.status(400).json({
                success: false,
                message: "user_id is required."
            });

        }

        const [wishlist] = await db.query(

            `SELECT
                w.id AS wishlist_id,
                w.user_id,
                w.product_id,
                w.created_at,

                p.name,
                p.description,
                p.price,
                p.category,
                p.image,
                p.stock

             FROM wishlist w

             INNER JOIN products p
             ON w.product_id = p.id

             WHERE w.user_id = ?

             ORDER BY w.created_at DESC`,

            [user_id]

        );

        res.json({
            success: true,
            count: wishlist.length,
            wishlist: wishlist
        });

    } catch (error) {

        console.error(
            "Get Wishlist Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to load wishlist."
        });

    }

};


// ==========================================
// REMOVE PRODUCT FROM WISHLIST
// DELETE /api/wishlist/:productId
// ==========================================

exports.removeFromWishlist = async (req, res) => {

    try {

        const productId = req.params.productId;
        const userId = req.query.user_id || req.body.user_id;

        if (!userId) {

            return res.status(400).json({
                success: false,
                message: "user_id is required."
            });

        }

        const [result] = await db.query(

            `DELETE FROM wishlist
             WHERE user_id = ?
             AND product_id = ?`,

            [userId, productId]

        );

        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Product was not found in wishlist."
            });

        }

        res.json({
            success: true,
            message: "Product removed from wishlist."
        });

    } catch (error) {

        console.error(
            "Remove Wishlist Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to remove product."
        });

    }

};