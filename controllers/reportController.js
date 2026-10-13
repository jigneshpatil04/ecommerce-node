// ==========================================
// REPORT & ANALYTICS CONTROLLER
// Aggregates sales, revenue, top products, cancelled orders
// Supports daily, weekly, monthly and custom date filtering
// ==========================================

const db = require("../config/db");

// ==========================================
// HELPER: BUILD DATE FILTER CONDITION
// ==========================================
function getDateFilterSql(period, startDate, endDate) {
    let sqlCondition = "";
    const params = [];
    const now = new Date();

    if (startDate && endDate) {
        sqlCondition = " AND o.created_at >= ? AND o.created_at <= ?";
        params.push(new Date(startDate + "T00:00:00"), new Date(endDate + "T23:59:59"));
        return { sqlCondition, params };
    }

    switch (period) {
        case "today":
            sqlCondition = " AND DATE(o.created_at) = CURDATE()";
            break;
        case "yesterday":
            sqlCondition = " AND DATE(o.created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)";
            break;
        case "this_week":
            sqlCondition = " AND YEARWEEK(o.created_at, 1) = YEARWEEK(CURDATE(), 1)";
            break;
        case "last_week":
            sqlCondition = " AND YEARWEEK(o.created_at, 1) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 1 WEEK), 1)";
            break;
        case "this_month":
            sqlCondition = " AND YEAR(o.created_at) = YEAR(CURDATE()) AND MONTH(o.created_at) = MONTH(CURDATE())";
            break;
        case "last_month":
            sqlCondition = " AND o.created_at >= DATE_SUB(DATE_FORMAT(CURDATE() ,'%Y-%m-01'), INTERVAL 1 MONTH) AND o.created_at < DATE_FORMAT(CURDATE() ,'%Y-%m-01')";
            break;
        case "this_year":
            sqlCondition = " AND YEAR(o.created_at) = YEAR(CURDATE())";
            break;
        case "all":
        default:
            sqlCondition = "";
            break;
    }

    return { sqlCondition, params };
}

// ==========================================
// 1. GET FULL REPORTS & ANALYTICS SUMMARY
// GET /api/admin/reports/analytics
// ==========================================
exports.getAnalytics = async (req, res) => {
    try {
        const { period = "all", startDate, endDate } = req.query;
        const { sqlCondition, params } = getDateFilterSql(period, startDate, endDate);

        // ----------------------------------------------------
        // A. SUMMARY TOTALS (Revenue, Orders, Cancelled, AOV)
        // ----------------------------------------------------
        const summarySql = `
            SELECT
                COUNT(*) AS total_orders,
                COALESCE(SUM(CASE WHEN status != 'Cancelled' THEN total ELSE 0 END), 0) AS total_revenue,
                COALESCE(SUM(CASE WHEN status = 'Delivered' OR status = 'Completed' THEN total ELSE 0 END), 0) AS delivered_revenue,
                COALESCE(SUM(CASE WHEN status = 'Pending' OR status = 'Processing' OR status = 'Confirmed' OR status = 'Shipped' THEN total ELSE 0 END), 0) AS in_progress_revenue,
                COALESCE(SUM(CASE WHEN status = 'Cancelled' THEN total ELSE 0 END), 0) AS cancelled_revenue,
                COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) AS cancelled_orders,
                COUNT(CASE WHEN status = 'Delivered' OR status = 'Completed' THEN 1 END) AS delivered_orders,
                COUNT(CASE WHEN status = 'Pending' THEN 1 END) AS pending_orders
            FROM orders o
            WHERE 1=1 ${sqlCondition}
        `;

        const [summaryRows] = await db.execute(summarySql, params);
        const s = summaryRows[0] || {};

        const totalOrders = Number(s.total_orders || 0);
        const totalRevenue = Number(s.total_revenue || 0);
        const cancelledOrders = Number(s.cancelled_orders || 0);
        const cancelledRevenue = Number(s.cancelled_revenue || 0);
        const deliveredOrders = Number(s.delivered_orders || 0);
        const deliveredRevenue = Number(s.delivered_revenue || 0);
        const inProgressRevenue = Number(s.in_progress_revenue || 0);

        const validOrdersCount = totalOrders - cancelledOrders;
        const averageOrderValue = validOrdersCount > 0 ? (totalRevenue / validOrdersCount) : 0;
        const cancellationRate = totalOrders > 0 ? ((cancelledOrders / totalOrders) * 100) : 0;

        // ----------------------------------------------------
        // B. TOTAL UNITS SOLD
        // ----------------------------------------------------
        const unitsSql = `
            SELECT COALESCE(SUM(oi.quantity), 0) AS total_units_sold
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status != 'Cancelled' ${sqlCondition}
        `;
        const [unitRows] = await db.execute(unitsSql, params);
        const totalUnitsSold = Number(unitRows[0]?.total_units_sold || 0);

        // ----------------------------------------------------
        // C. SALES TREND OVER TIME (Daily / Monthly)
        // ----------------------------------------------------
        let trendSql = "";
        if (period === "today" || period === "yesterday") {
            // Hourly breakdown
            trendSql = `
                SELECT 
                    HOUR(o.created_at) AS time_key,
                    DATE_FORMAT(o.created_at, '%h %p') AS label,
                    COUNT(*) AS orders_count,
                    COALESCE(SUM(CASE WHEN o.status != 'Cancelled' THEN o.total ELSE 0 END), 0) AS revenue,
                    COALESCE(SUM(CASE WHEN o.status = 'Cancelled' THEN 1 ELSE 0 END), 0) AS cancelled_count
                FROM orders o
                WHERE 1=1 ${sqlCondition}
                GROUP BY HOUR(o.created_at), label
                ORDER BY HOUR(o.created_at) ASC
            `;
        } else if (period === "this_week" || period === "last_week" || period === "this_month" || period === "last_month") {
            // Daily breakdown
            trendSql = `
                SELECT 
                    DATE(o.created_at) AS time_key,
                    DATE_FORMAT(o.created_at, '%d %b (%a)') AS label,
                    COUNT(*) AS orders_count,
                    COALESCE(SUM(CASE WHEN o.status != 'Cancelled' THEN o.total ELSE 0 END), 0) AS revenue,
                    COALESCE(SUM(CASE WHEN o.status = 'Cancelled' THEN 1 ELSE 0 END), 0) AS cancelled_count
                FROM orders o
                WHERE 1=1 ${sqlCondition}
                GROUP BY DATE(o.created_at), label
                ORDER BY DATE(o.created_at) ASC
            `;
        } else {
            // Monthly / All-time breakdown
            trendSql = `
                SELECT 
                    DATE_FORMAT(o.created_at, '%Y-%m') AS time_key,
                    DATE_FORMAT(o.created_at, '%b %Y') AS label,
                    COUNT(*) AS orders_count,
                    COALESCE(SUM(CASE WHEN o.status != 'Cancelled' THEN o.total ELSE 0 END), 0) AS revenue,
                    COALESCE(SUM(CASE WHEN o.status = 'Cancelled' THEN 1 ELSE 0 END), 0) AS cancelled_count
                FROM orders o
                WHERE 1=1 ${sqlCondition}
                GROUP BY DATE_FORMAT(o.created_at, '%Y-%m'), label
                ORDER BY DATE_FORMAT(o.created_at, '%Y-%m') ASC
            `;
        }

        const [trendRows] = await db.execute(trendSql, params);

        // ----------------------------------------------------
        // D. MOST-SELLING PRODUCTS (Top Performers)
        // ----------------------------------------------------
        const topProductsSql = `
            SELECT 
                oi.product_id,
                COALESCE(MAX(p.name), oi.product_name) AS product_name,
                COALESCE(MAX(p.category), 'General') AS category,
                COALESCE(MAX(p.image), '/images/shirt2.jpg') AS image,
                COALESCE(MAX(p.price), oi.price) AS current_price,
                SUM(oi.quantity) AS units_sold,
                SUM(oi.price * oi.quantity) AS total_revenue,
                COUNT(DISTINCT o.id) AS orders_count
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE o.status != 'Cancelled' ${sqlCondition}
            GROUP BY oi.product_id, oi.product_name
            ORDER BY units_sold DESC, total_revenue DESC
            LIMIT 10
        `;
        const [topProductsRaw] = await db.execute(topProductsSql, params);

        const topProducts = topProductsRaw.map((item) => {
            let img = item.image;
            if (typeof img === "string" && img.startsWith("[")) {
                try {
                    const parsed = JSON.parse(img);
                    if (Array.isArray(parsed) && parsed.length > 0) img = parsed[0];
                } catch (e) {}
            }
            return {
                ...item,
                image: img || "/images/shirt2.jpg",
                units_sold: Number(item.units_sold || 0),
                total_revenue: Number(item.total_revenue || 0),
                current_price: Number(item.current_price || 0)
            };
        });

        // ----------------------------------------------------
        // E. CANCELLED ORDERS DETAILED LIST
        // ----------------------------------------------------
        const cancelledOrdersSql = `
            SELECT 
                o.id,
                o.customer_name,
                o.email,
                o.phone,
                o.total,
                o.payment_method,
                o.created_at,
                COUNT(oi.id) AS items_count,
                GROUP_CONCAT(CONCAT(oi.product_name, ' (x', oi.quantity, ')') SEPARATOR ', ') AS items_summary
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.status = 'Cancelled' ${sqlCondition}
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `;
        const [cancelledOrdersList] = await db.execute(cancelledOrdersSql, params);

        // ----------------------------------------------------
        // F. SALES BY CATEGORY
        // ----------------------------------------------------
        const categorySql = `
            SELECT 
                COALESCE(p.category, 'Uncategorized') AS category_name,
                COALESCE(SUM(oi.quantity), 0) AS units_sold,
                COALESCE(SUM(oi.price * oi.quantity), 0) AS revenue,
                COUNT(DISTINCT o.id) AS orders_count
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE o.status != 'Cancelled' ${sqlCondition}
            GROUP BY category_name
            ORDER BY revenue DESC
        `;
        const [categoryRows] = await db.execute(categorySql, params);

        // ----------------------------------------------------
        // G. SALES BY PAYMENT METHOD
        // ----------------------------------------------------
        const paymentSql = `
            SELECT 
                o.payment_method,
                COUNT(*) AS count,
                COALESCE(SUM(CASE WHEN o.status != 'Cancelled' THEN o.total ELSE 0 END), 0) AS revenue
            FROM orders o
            WHERE 1=1 ${sqlCondition}
            GROUP BY o.payment_method
        `;
        const [paymentRows] = await db.execute(paymentSql, params);

        // ----------------------------------------------------
        // H. RECENT COMPLETED / ALL ORDERS FOR LOG TABLE
        // ----------------------------------------------------
        const recentOrdersSql = `
            SELECT 
                o.id,
                o.customer_name,
                o.email,
                o.payment_method,
                o.total,
                o.status,
                o.created_at,
                COUNT(oi.id) AS items_count
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE 1=1 ${sqlCondition}
            GROUP BY o.id
            ORDER BY o.created_at DESC
            LIMIT 50
        `;
        const [recentOrders] = await db.execute(recentOrdersSql, params);

        return res.json({
            success: true,
            period,
            summary: {
                totalRevenue,
                totalOrders,
                totalUnitsSold,
                averageOrderValue: Math.round(averageOrderValue * 100) / 100,
                deliveredRevenue,
                deliveredOrders,
                inProgressRevenue,
                cancelledOrders,
                cancelledRevenue,
                cancellationRate: Math.round(cancellationRate * 10) / 10
            },
            salesTrend: trendRows.map(r => ({
                timeKey: r.time_key,
                label: r.label,
                orders: Number(r.orders_count || 0),
                revenue: Number(r.revenue || 0),
                cancelled: Number(r.cancelled_count || 0)
            })),
            topProducts,
            cancelledOrdersList,
            categorySales: categoryRows.map(c => ({
                category: c.category_name,
                units: Number(c.units_sold || 0),
                revenue: Number(c.revenue || 0),
                orders: Number(c.orders_count || 0)
            })),
            paymentMethods: paymentRows.map(p => ({
                method: p.payment_method || 'Online',
                count: Number(p.count || 0),
                revenue: Number(p.revenue || 0)
            })),
            recentOrders
        });

    } catch (error) {
        if (error.code === 'ECONNREFUSED' || error.name === 'AggregateError' || String(error).includes('ECONNREFUSED')) {
            console.log("ℹ️ [Offline Mode] Serving fallback reports & analytics.");
            return res.json({
                success: true,
                period: req.query.period || "all",
                summary: {
                    totalRevenue: 48920,
                    totalOrders: 18,
                    totalUnitsSold: 35,
                    averageOrderValue: 2717.78,
                    deliveredRevenue: 38500,
                    deliveredOrders: 14,
                    inProgressRevenue: 10420,
                    cancelledOrders: 1,
                    cancelledRevenue: 699,
                    cancellationRate: 5.5
                },
                salesTrend: [
                    { timeKey: "Day 1", label: "Mon", orders: 3, revenue: 8400, cancelled: 0 },
                    { timeKey: "Day 2", label: "Tue", orders: 5, revenue: 12500, cancelled: 0 },
                    { timeKey: "Day 3", label: "Wed", orders: 4, revenue: 10200, cancelled: 0 },
                    { timeKey: "Day 4", label: "Thu", orders: 6, revenue: 17820, cancelled: 1 }
                ],
                topProducts: [],
                cancelledOrdersList: [],
                categorySales: [
                    { category: "T-Shirts", units: 15, revenue: 12000, orders: 10 },
                    { category: "Shirts", units: 10, revenue: 15000, orders: 8 },
                    { category: "Jackets", units: 6, revenue: 14000, orders: 5 },
                    { category: "Jeans", units: 4, revenue: 7920, orders: 4 }
                ],
                paymentMethods: [
                    { method: "COD", count: 8, revenue: 16500 },
                    { method: "Online", count: 10, revenue: 32420 }
                ],
                recentOrders: [],
                isOfflineMode: true
            });
        }
        console.error("getAnalytics error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate reports & analytics",
            error: error.message
        });
    }
};

// ==========================================
// 2. EXPORT RAW REPORT DATA (JSON FOR CSV / PDF)
// GET /api/admin/reports/export-data
// ==========================================
exports.getExportData = async (req, res) => {
    try {
        const { period = "all", startDate, endDate } = req.query;
        const { sqlCondition, params } = getDateFilterSql(period, startDate, endDate);

        // Detailed orders dump with customer & item info
        const exportSql = `
            SELECT 
                o.id AS order_id,
                o.created_at AS order_date,
                o.customer_name,
                o.email,
                o.phone,
                o.address,
                o.city,
                o.state,
                o.pincode,
                o.payment_method,
                o.status AS order_status,
                o.subtotal,
                o.shipping,
                o.total,
                oi.product_id,
                oi.product_name,
                oi.color,
                oi.size,
                oi.price AS item_price,
                oi.quantity AS item_quantity,
                (oi.price * oi.quantity) AS item_total
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE 1=1 ${sqlCondition}
            ORDER BY o.id DESC, oi.id ASC
        `;

        const [rows] = await db.execute(exportSql, params);

        return res.json({
            success: true,
            period,
            totalRows: rows.length,
            data: rows
        });

    } catch (error) {
        console.error("getExportData error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch export data",
            error: error.message
        });
    }
};
