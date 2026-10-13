// ============================================================
// INVENTORY MANAGEMENT CONTROLLER
// Handles Product & Variant Stock Tracking, Low-Stock Alerts,
// Out-of-Stock Lists, Size & Color Wise Stock & Bulk Updates
// ============================================================

const db = require("../config/db");

// Default threshold for low stock alert
const DEFAULT_LOW_STOCK_THRESHOLD = 5;

// ============================================================
// 1. GET INVENTORY OVERVIEW & LIST
// GET /api/admin/inventory
// Query params: status (all|low_stock|out_of_stock|in_stock),
// category, search, threshold
// ============================================================
exports.getInventory = async (req, res) => {
    try {
        const {
            status = "all",
            category = "all",
            search = "",
            threshold = DEFAULT_LOW_STOCK_THRESHOLD
        } = req.query;

        const lowStockLimit = Math.max(1, parseInt(threshold, 10) || DEFAULT_LOW_STOCK_THRESHOLD);

        // Fetch all products
        let productSql = `
            SELECT 
                p.id,
                p.name,
                p.description,
                p.price,
                p.category,
                p.brand,
                p.sizes,
                p.image,
                COALESCE(p.stock, 0) AS base_stock,
                p.created_at
            FROM products p
            WHERE 1=1
        `;
        const productParams = [];

        if (category && category !== "all") {
            productSql += ` AND p.category = ?`;
            productParams.push(category);
        }

        if (search && search.trim() !== "") {
            productSql += ` AND (p.name LIKE ? OR p.category LIKE ? OR p.brand LIKE ?)`;
            const searchWildcard = `%${search.trim()}%`;
            productParams.push(searchWildcard, searchWildcard, searchWildcard);
        }

        productSql += ` ORDER BY p.name ASC, p.id DESC`;

        const [products] = await db.query(productSql, productParams);

        // Fetch all variants for all products
        const [variants] = await db.query(`
            SELECT 
                v.id,
                v.product_id,
                v.size,
                v.color,
                COALESCE(v.extra_price, 0) AS extra_price,
                COALESCE(v.stock, 0) AS stock,
                v.image,
                v.created_at
            FROM product_variants v
            ORDER BY 
                v.product_id ASC,
                FIELD(v.size, 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'),
                v.color ASC
        `);

        // Group variants by product_id
        const variantsByProduct = {};
        for (const v of variants) {
            if (!variantsByProduct[v.product_id]) {
                variantsByProduct[v.product_id] = [];
            }

            // Determine variant status
            const vStock = Number(v.stock) || 0;
            let vStatus = "in_stock";
            if (vStock === 0) {
                vStatus = "out_of_stock";
            } else if (vStock <= lowStockLimit) {
                vStatus = "low_stock";
            }

            variantsByProduct[v.product_id].push({
                id: v.id,
                product_id: v.product_id,
                size: v.size,
                color: v.color,
                extra_price: Number(v.extra_price) || 0,
                stock: vStock,
                image: v.image,
                status: vStatus
            });
        }

        // Process each product and its stock health
        let totalWarehouseUnits = 0;
        let totalValuation = 0;
        let totalVariantsCount = 0;
        let lowStockAlertCount = 0;
        let outOfStockAlertCount = 0;
        let inStockCount = 0;

        const processedProducts = products.map((prod) => {
            const prodVariants = variantsByProduct[prod.id] || [];
            const hasVariants = prodVariants.length > 0;
            const baseStock = Number(prod.base_stock) || 0;
            const price = Number(prod.price) || 0;

            let totalVariantStock = 0;
            let lowStockVarCount = 0;
            let outOfStockVarCount = 0;

            if (hasVariants) {
                totalVariantsCount += prodVariants.length;
                prodVariants.forEach((v) => {
                    totalVariantStock += v.stock;
                    if (v.stock === 0) {
                        outOfStockVarCount++;
                    } else if (v.stock <= lowStockLimit) {
                        lowStockVarCount++;
                    }
                });
            }

            // Effective total units available for this product
            const effectiveStock = hasVariants ? totalVariantStock : baseStock;
            totalWarehouseUnits += effectiveStock;
            totalValuation += effectiveStock * price;

            // Determine overall product stock status
            let overallStatus = "in_stock";
            if (hasVariants) {
                if (totalVariantStock === 0 || outOfStockVarCount === prodVariants.length) {
                    overallStatus = "out_of_stock";
                } else if (outOfStockVarCount > 0 || lowStockVarCount > 0 || totalVariantStock <= lowStockLimit) {
                    overallStatus = "low_stock";
                }
            } else {
                if (baseStock === 0) {
                    overallStatus = "out_of_stock";
                } else if (baseStock <= lowStockLimit) {
                    overallStatus = "low_stock";
                }
            }

            if (overallStatus === "out_of_stock") {
                outOfStockAlertCount++;
            } else if (overallStatus === "low_stock") {
                lowStockAlertCount++;
            } else {
                inStockCount++;
            }

            // Normalise image
            let img = prod.image;
            if (typeof img === "string" && img.startsWith("[")) {
                try {
                    const parsed = JSON.parse(img);
                    if (Array.isArray(parsed) && parsed.length > 0) img = parsed[0];
                } catch (e) {}
            }

            return {
                id: prod.id,
                name: prod.name,
                category: prod.category || "General",
                brand: prod.brand || "",
                price: price,
                image: img || "/images/shirt2.jpg",
                base_stock: baseStock,
                effective_stock: effectiveStock,
                has_variants: hasVariants,
                variants_count: prodVariants.length,
                total_variant_stock: totalVariantStock,
                low_stock_variants_count: lowStockVarCount,
                out_of_stock_variants_count: outOfStockVarCount,
                status: overallStatus,
                variants: prodVariants
            };
        });

        // Apply Status Filter if not 'all'
        let filteredProducts = processedProducts;
        if (status === "low_stock") {
            filteredProducts = processedProducts.filter(p => p.status === "low_stock");
        } else if (status === "out_of_stock") {
            filteredProducts = processedProducts.filter(p => p.status === "out_of_stock");
        } else if (status === "in_stock") {
            filteredProducts = processedProducts.filter(p => p.status === "in_stock");
        }

        // Distinct categories for filter dropdown
        const [categoriesRows] = await db.query(`
            SELECT DISTINCT category 
            FROM products 
            WHERE category IS NOT NULL AND category != ''
            ORDER BY category ASC
        `);
        const categories = categoriesRows.map(c => c.category);

        // Low stock alerts list for quick view banner / drawer
        const criticalAlerts = processedProducts
            .filter(p => p.status === "low_stock" || p.status === "out_of_stock")
            .map(p => ({
                id: p.id,
                name: p.name,
                category: p.category,
                image: p.image,
                status: p.status,
                stock: p.effective_stock,
                has_variants: p.has_variants,
                low_variants: p.variants.filter(v => v.status === "low_stock" || v.status === "out_of_stock")
            }));

        return res.json({
            success: true,
            summary: {
                totalProducts: products.length,
                totalVariants: totalVariantsCount,
                totalUnits: totalWarehouseUnits,
                totalValuation: Math.round(totalValuation * 100) / 100,
                inStockCount,
                lowStockCount: lowStockAlertCount,
                outOfStockCount: outOfStockAlertCount,
                threshold: lowStockLimit
            },
            categories,
            criticalAlerts,
            totalFiltered: filteredProducts.length,
            products: filteredProducts
        });

    } catch (error) {
        console.error("GET INVENTORY ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load inventory data",
            error: error.message
        });
    }
};

// ============================================================
// 2. UPDATE MAIN PRODUCT STOCK
// PUT /api/admin/inventory/product/:id/stock
// ============================================================
exports.updateProductStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock, syncVariants } = req.body;

        if (stock === undefined || stock === null || isNaN(stock) || Number(stock) < 0) {
            return res.status(400).json({
                success: false,
                message: "Stock quantity must be a valid non-negative number"
            });
        }

        const newStock = parseInt(stock, 10);

        // Update product table
        await db.execute(
            `UPDATE products SET stock = ? WHERE id = ?`,
            [newStock, id]
        );

        // Optional: If syncVariants is true and product has variants, update all variants proportionally or evenly
        if (syncVariants) {
            const [variants] = await db.query(
                `SELECT id FROM product_variants WHERE product_id = ?`,
                [id]
            );
            if (variants.length > 0) {
                const perVariantStock = Math.floor(newStock / variants.length);
                await db.execute(
                    `UPDATE product_variants SET stock = ? WHERE product_id = ?`,
                    [perVariantStock, id]
                );
            }
        }

        return res.json({
            success: true,
            message: `Product stock updated to ${newStock} units`,
            productId: Number(id),
            stock: newStock
        });

    } catch (error) {
        console.error("UPDATE PRODUCT STOCK ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update product stock",
            error: error.message
        });
    }
};

// ============================================================
// 3. UPDATE SPECIFIC VARIANT STOCK (SIZE & COLOR)
// PUT /api/admin/inventory/variant/:id/stock
// ============================================================
exports.updateVariantStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock, syncProductTotal = true } = req.body;

        if (stock === undefined || stock === null || isNaN(stock) || Number(stock) < 0) {
            return res.status(400).json({
                success: false,
                message: "Variant stock must be a valid non-negative number"
            });
        }

        const newStock = parseInt(stock, 10);

        // Find variant to get product_id
        const [varRows] = await db.query(
            `SELECT id, product_id, size, color FROM product_variants WHERE id = ?`,
            [id]
        );

        if (varRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Variant not found"
            });
        }

        const variant = varRows[0];

        // Update variant stock
        await db.execute(
            `UPDATE product_variants SET stock = ? WHERE id = ?`,
            [newStock, id]
        );

        // Optionally sync main product stock to sum of all variants
        let newTotalProductStock = null;
        if (syncProductTotal) {
            const [sumResult] = await db.query(
                `SELECT COALESCE(SUM(stock), 0) AS total_stock FROM product_variants WHERE product_id = ?`,
                [variant.product_id]
            );
            newTotalProductStock = Number(sumResult[0]?.total_stock || 0);

            await db.execute(
                `UPDATE products SET stock = ? WHERE id = ?`,
                [newTotalProductStock, variant.product_id]
            );
        }

        return res.json({
            success: true,
            message: `Variant (${variant.size} / ${variant.color}) stock updated to ${newStock}`,
            variantId: Number(id),
            productId: variant.product_id,
            size: variant.size,
            color: variant.color,
            stock: newStock,
            totalProductStock: newTotalProductStock
        });

    } catch (error) {
        console.error("UPDATE VARIANT STOCK ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update variant stock",
            error: error.message
        });
    }
};

// ============================================================
// 4. QUICK RESTOCK (+Quantity)
// POST /api/admin/inventory/quick-restock
// ============================================================
exports.quickRestock = async (req, res) => {
    try {
        const { type, id, quantity } = req.body;

        const addQty = parseInt(quantity, 10);
        if (!addQty || addQty <= 0) {
            return res.status(400).json({
                success: false,
                message: "Restock quantity must be greater than 0"
            });
        }

        if (type === "variant") {
            const [varRows] = await db.query(
                `SELECT id, product_id, size, color, stock FROM product_variants WHERE id = ?`,
                [id]
            );
            if (varRows.length === 0) {
                return res.status(404).json({ success: false, message: "Variant not found" });
            }

            const currentStock = Number(varRows[0].stock || 0);
            const updatedStock = currentStock + addQty;

            await db.execute(
                `UPDATE product_variants SET stock = stock + ? WHERE id = ?`,
                [addQty, id]
            );

            // Sync product total
            const [sumResult] = await db.query(
                `SELECT COALESCE(SUM(stock), 0) AS total_stock FROM product_variants WHERE product_id = ?`,
                [varRows[0].product_id]
            );
            const totalStock = Number(sumResult[0]?.total_stock || 0);
            await db.execute(`UPDATE products SET stock = ? WHERE id = ?`, [totalStock, varRows[0].product_id]);

            return res.json({
                success: true,
                message: `Added +${addQty} units to ${varRows[0].size} / ${varRows[0].color}. New stock: ${updatedStock}`,
                stock: updatedStock,
                totalProductStock: totalStock
            });

        } else {
            // Product base restock
            const [prodRows] = await db.query(
                `SELECT id, name, stock FROM products WHERE id = ?`,
                [id]
            );
            if (prodRows.length === 0) {
                return res.status(404).json({ success: false, message: "Product not found" });
            }

            const currentStock = Number(prodRows[0].stock || 0);
            const updatedStock = currentStock + addQty;

            await db.execute(
                `UPDATE products SET stock = stock + ? WHERE id = ?`,
                [addQty, id]
            );

            return res.json({
                success: true,
                message: `Added +${addQty} units to ${prodRows[0].name}. New stock: ${updatedStock}`,
                stock: updatedStock
            });
        }

    } catch (error) {
        console.error("QUICK RESTOCK ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to restock inventory",
            error: error.message
        });
    }
};

// ============================================================
// 5. BULK UPDATE MULTIPLE VARIANTS
// POST /api/admin/inventory/bulk-update
// ============================================================
exports.bulkUpdateStock = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { updates } = req.body; // Array of { id, stock, type: 'variant'|'product' }
        if (!Array.isArray(updates) || updates.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
                success: false,
                message: "No stock updates provided"
            });
        }

        const affectedProductIds = new Set();

        for (const item of updates) {
            const stockVal = Math.max(0, parseInt(item.stock, 10) || 0);

            if (item.type === "variant") {
                await connection.execute(
                    `UPDATE product_variants SET stock = ? WHERE id = ?`,
                    [stockVal, item.id]
                );
                if (item.product_id) {
                    affectedProductIds.add(item.product_id);
                }
            } else {
                await connection.execute(
                    `UPDATE products SET stock = ? WHERE id = ?`,
                    [stockVal, item.id]
                );
            }
        }

        // Recalculate total product stocks for any affected products
        for (const prodId of affectedProductIds) {
            const [sumResult] = await connection.query(
                `SELECT COALESCE(SUM(stock), 0) AS total_stock FROM product_variants WHERE product_id = ?`,
                [prodId]
            );
            const totalStock = Number(sumResult[0]?.total_stock || 0);
            await connection.execute(
                `UPDATE products SET stock = ? WHERE id = ?`,
                [totalStock, prodId]
            );
        }

        await connection.commit();
        connection.release();

        return res.json({
            success: true,
            message: `Successfully updated stock for ${updates.length} item(s)`,
            count: updates.length
        });

    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error("BULK UPDATE ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to perform bulk stock update",
            error: error.message
        });
    }
};
