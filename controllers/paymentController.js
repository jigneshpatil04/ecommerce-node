// ==========================================
// PAYMENT CONTROLLER
// Handles Payments, Refunds, Analytics & Exports
// ==========================================

const db = require("../config/db");
const { logActivity } = require("./activityLogController");

// Auto-sync helper to ensure any order missing a payment record is automatically registered
const syncMissingOrders = async () => {
    try {
        const [missingOrders] = await db.query(`
            SELECT id, customer_name, email, phone, total, payment_method, status, created_at
            FROM orders
            WHERE id NOT IN (SELECT order_id FROM payments)
            ORDER BY id ASC
        `);
        for (const order of missingOrders) {
            const payCode = `PAY${1000 + order.id}`;
            const isCod = (order.payment_method && order.payment_method.toUpperCase() === 'COD');
            let status = 'Successful';
            let txn = `TXN_${Date.now()}_${order.id}`;
            let failReason = null;

            if (order.status && order.status.toLowerCase() === 'cancelled') {
                status = 'Failed';
                txn = null;
                failReason = 'Order was cancelled';
            } else if (isCod) {
                if (order.status && (order.status.toLowerCase() === 'delivered' || order.status.toLowerCase() === 'completed')) {
                    status = 'Successful';
                } else {
                    status = 'Pending';
                    txn = null;
                }
            }

            await db.query(`
                INSERT IGNORE INTO payments 
                (payment_id, order_id, customer_name, customer_email, customer_phone, amount, payment_method, status, transaction_id, failure_reason, payment_date, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                payCode,
                order.id,
                order.customer_name || 'Customer',
                order.email || 'customer@example.com',
                order.phone || '9876543210',
                parseFloat(order.total || 0),
                isCod ? 'COD' : 'Online',
                status,
                txn,
                failReason,
                order.created_at || new Date(),
                order.created_at || new Date()
            ]);
        }
    } catch (e) {
        console.error("Auto sync orders to payments error:", e);
    }
};

// ==========================================
// 1. GET ALL PAYMENTS (with search, filter, date range, pagination)
// ==========================================
const getPayments = async (req, res) => {
    try {
        await syncMissingOrders();
        const {
            search = "",
            method = "all",
            status = "all",
            dateRange = "all",
            startDate,
            endDate,
            page = 1,
            limit = 15
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        let where = ["1=1"];
        let params = [];

        // Search Payment ID, Order ID, Customer name
        if (search && search.trim() !== "") {
            const s = `%${search.trim()}%`;
            where.push("(p.payment_id LIKE ? OR CAST(p.order_id AS CHAR) LIKE ? OR p.customer_name LIKE ? OR p.transaction_id LIKE ?)");
            params.push(s, s, s, s);
        }

        // Method filter (Online, COD, etc.)
        if (method && method.toLowerCase() !== "all") {
            where.push("LOWER(p.payment_method) = ?");
            params.push(method.toLowerCase());
        }

        // Status filter (Successful, Pending, Failed, Refunded)
        if (status && status.toLowerCase() !== "all") {
            where.push("LOWER(p.status) = ?");
            params.push(status.toLowerCase());
        }

        // Date Range preset
        if (dateRange && dateRange !== "all") {
            const now = new Date();
            if (dateRange === "today") {
                where.push("DATE(p.payment_date) = CURDATE()");
            } else if (dateRange === "yesterday") {
                where.push("DATE(p.payment_date) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)");
            } else if (dateRange === "last7days") {
                where.push("p.payment_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
            } else if (dateRange === "thismonth") {
                where.push("MONTH(p.payment_date) = MONTH(CURRENT_DATE()) AND YEAR(p.payment_date) = YEAR(CURRENT_DATE())");
            } else if (dateRange === "lastmonth") {
                where.push("p.payment_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH)");
            } else if (dateRange === "custom" && startDate && endDate) {
                where.push("DATE(p.payment_date) BETWEEN ? AND ?");
                params.push(startDate, endDate);
            }
        }

        const whereSql = where.join(" AND ");

        // Fetch payments list
        const [payments] = await db.query(`
            SELECT p.*, o.status as order_status, o.address, o.city
            FROM payments p
            LEFT JOIN orders o ON p.order_id = o.id
            WHERE ${whereSql}
            ORDER BY p.payment_date DESC
            LIMIT ? OFFSET ?
        `, [...params, parseInt(limit), offset]);

        // Total count
        const [[{ total }]] = await db.query(`
            SELECT COUNT(*) as total
            FROM payments p
            WHERE ${whereSql}
        `, params);

        res.json({
            success: true,
            payments,
            total,
            page: parseInt(page),
            limit: parseInt(limit)
        });

    } catch (err) {
        console.error("getPayments error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ==========================================
// 2. GET PAYMENT STATS & KPI DASHBOARD
// ==========================================
const getPaymentStats = async (req, res) => {
    try {
        await syncMissingOrders();
        // Overall revenue summary
        const [[stats]] = await db.query(`
            SELECT 
                COALESCE(SUM(CASE WHEN status = 'Successful' THEN amount ELSE 0 END), 0) AS totalRevenue,
                COALESCE(SUM(CASE WHEN status = 'Successful' AND payment_method = 'Online' THEN amount ELSE 0 END), 0) AS onlineRevenue,
                COALESCE(SUM(CASE WHEN status = 'Successful' AND payment_method = 'COD' THEN amount ELSE 0 END), 0) AS codRevenue,
                COALESCE(SUM(CASE WHEN status = 'Refunded' THEN amount ELSE 0 END), 0) AS refundTotal,
                COUNT(CASE WHEN status = 'Successful' THEN 1 END) AS successfulCount,
                COUNT(CASE WHEN status = 'Pending' THEN 1 END) AS pendingCount,
                COUNT(CASE WHEN status = 'Failed' THEN 1 END) AS failedCount,
                COUNT(CASE WHEN status = 'Refunded' THEN 1 END) AS refundedCount,
                COUNT(*) AS totalTransactions
            FROM payments
        `);

        // Daily trend for chart (last 7 days)
        const [dailyTrends] = await db.query(`
            SELECT 
                DATE_FORMAT(payment_date, '%d %b') AS day_label,
                DATE(payment_date) as full_date,
                COALESCE(SUM(CASE WHEN status = 'Successful' THEN amount ELSE 0 END), 0) AS successful_amount,
                COALESCE(SUM(CASE WHEN payment_method = 'Online' AND status = 'Successful' THEN amount ELSE 0 END), 0) AS online_amount,
                COALESCE(SUM(CASE WHEN payment_method = 'COD' AND status = 'Successful' THEN amount ELSE 0 END), 0) AS cod_amount
            FROM payments
            WHERE payment_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            GROUP BY DATE(payment_date), DATE_FORMAT(payment_date, '%d %b')
            ORDER BY full_date ASC
        `);

        res.json({
            success: true,
            stats: {
                totalRevenue: parseFloat(stats.totalRevenue),
                onlineRevenue: parseFloat(stats.onlineRevenue),
                codRevenue: parseFloat(stats.codRevenue),
                refundTotal: parseFloat(stats.refundTotal),
                successfulCount: parseInt(stats.successfulCount),
                pendingCount: parseInt(stats.pendingCount),
                failedCount: parseInt(stats.failedCount),
                refundedCount: parseInt(stats.refundedCount),
                totalTransactions: parseInt(stats.totalTransactions)
            },
            dailyTrends
        });

    } catch (err) {
        console.error("getPaymentStats error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ==========================================
// 3. GET SINGLE PAYMENT DETAILS
// ==========================================
const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;
        const [[payment]] = await db.query(`
            SELECT p.*, o.address, o.city, o.state, o.pincode, o.status as order_status, o.created_at as order_date
            FROM payments p
            LEFT JOIN orders o ON p.order_id = o.id
            WHERE p.id = ? OR p.payment_id = ?
        `, [id, id]);

        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }

        // Fetch refund history if any
        const [refunds] = await db.query(`
            SELECT * FROM refunds WHERE payment_id = ? OR order_id = ?
        `, [payment.payment_id, payment.order_id]);

        res.json({
            success: true,
            payment,
            refunds
        });

    } catch (err) {
        console.error("getPaymentById error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ==========================================
// 4. UPDATE PAYMENT STATUS (e.g. Mark COD as Paid / Successful)
// ==========================================
const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, failure_reason } = req.body;

        const validStatuses = ['Successful', 'Pending', 'Failed', 'Refunded'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value" });
        }

        const [[existing]] = await db.query("SELECT * FROM payments WHERE id = ? OR payment_id = ?", [id, id]);
        if (!existing) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }

        await db.query(`
            UPDATE payments 
            SET status = ?, failure_reason = ? 
            WHERE id = ? OR payment_id = ?
        `, [status, failure_reason || null, id, id]);

        // Sync order payment_status
        const ordPayStatus = status === 'Successful' ? 'paid' : (status === 'Failed' ? 'failed' : 'pending');
        await db.query(`UPDATE orders SET payment_status = ? WHERE id = ?`, [ordPayStatus, existing.order_id]);

        logActivity({
            admin_name: "Admin",
            action: "Updated Payment Status",
            module: "Payments",
            details: `Payment ${existing.payment_id} (Order #${existing.order_id}) status marked as ${status}`,
            status: status === "Successful" ? "success" : (status === "Failed" ? "danger" : "info"),
            icon: "fa-credit-card"
        });

        res.json({
            success: true,
            message: `Payment status updated to ${status}`
        });

    } catch (err) {
        console.error("updatePaymentStatus error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ==========================================
// 5. REFUND MANAGEMENT
// ==========================================

// Get all refund requests
const getRefunds = async (req, res) => {
    try {
        const { status = "all" } = req.query;
        let where = ["1=1"];
        let params = [];

        if (status && status !== "all") {
            where.push("status = ?");
            params.push(status);
        }

        const [refunds] = await db.query(`
            SELECT r.*, p.payment_method, p.transaction_id
            FROM refunds r
            LEFT JOIN payments p ON r.payment_id = p.payment_id
            WHERE ${where.join(" AND ")}
            ORDER BY r.created_at DESC
        `, params);

        res.json({ success: true, refunds });
    } catch (err) {
        console.error("getRefunds error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Create a refund request
const createRefund = async (req, res) => {
    try {
        const { order_id, payment_id, amount, reason } = req.body;

        const [[payment]] = await db.query("SELECT * FROM payments WHERE payment_id = ? OR order_id = ?", [payment_id || '', order_id]);
        if (!payment) {
            return res.status(404).json({ success: false, message: "Associated payment not found" });
        }

        const refund_id = `REF${Date.now().toString().slice(-6)}`;
        await db.query(`
            INSERT INTO refunds (refund_id, payment_id, order_id, customer_name, amount, reason, status)
            VALUES (?, ?, ?, ?, ?, ?, 'Pending')
        `, [
            refund_id,
            payment.payment_id,
            payment.order_id,
            payment.customer_name,
            amount || payment.amount,
            reason || 'Customer requested cancellation/return'
        ]);

        res.json({
            success: true,
            message: "Refund request initiated",
            refund_id
        });

    } catch (err) {
        console.error("createRefund error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update refund status (Approve, Processing, Completed, Reject)
const updateRefundStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'Processing', 'Completed', 'Rejected'

        const [[refund]] = await db.query("SELECT * FROM refunds WHERE id = ? OR refund_id = ?", [id, id]);
        if (!refund) {
            return res.status(404).json({ success: false, message: "Refund request not found" });
        }

        let approved_at = refund.approved_at;
        let completed_at = refund.completed_at;

        if (status === 'Processing' || status === 'Completed') {
            if (!approved_at) approved_at = new Date();
        }
        if (status === 'Completed') {
            completed_at = new Date();
            // Also mark payment as Refunded
            if (refund.payment_id) {
                await db.query("UPDATE payments SET status = 'Refunded' WHERE payment_id = ?", [refund.payment_id]);
            }
        }

        await db.query(`
            UPDATE refunds 
            SET status = ?, approved_at = ?, completed_at = ?
            WHERE id = ? OR refund_id = ?
        `, [status, approved_at, completed_at, id, id]);

        logActivity({
            admin_name: "Admin",
            action: "Updated Refund Status",
            module: "Payments",
            details: `Refund ${refund.refund_id} (Order #${refund.order_id}, ₹${refund.amount}) marked as ${status}`,
            status: status === "Completed" ? "success" : (status === "Rejected" ? "danger" : "info"),
            icon: "fa-arrow-rotate-left"
        });

        res.json({
            success: true,
            message: `Refund status updated to ${status}`
        });

    } catch (err) {
        console.error("updateRefundStatus error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ==========================================
// 6. EXPORT PAYMENTS (CSV data generator)
// ==========================================
const exportPayments = async (req, res) => {
    try {
        await syncMissingOrders();
        const { method, status, dateRange, startDate, endDate } = req.query;
        let where = ["1=1"];
        let params = [];

        if (method && method !== "all") {
            where.push("LOWER(p.payment_method) = ?");
            params.push(method.toLowerCase());
        }
        if (status && status !== "all") {
            where.push("LOWER(p.status) = ?");
            params.push(status.toLowerCase());
        }
        if (dateRange && dateRange !== "all") {
            if (dateRange === "today") where.push("DATE(p.payment_date) = CURDATE()");
            else if (dateRange === "last7days") where.push("p.payment_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
            else if (dateRange === "thismonth") where.push("MONTH(p.payment_date) = MONTH(CURRENT_DATE())");
            else if (dateRange === "custom" && startDate && endDate) {
                where.push("DATE(p.payment_date) BETWEEN ? AND ?");
                params.push(startDate, endDate);
            }
        }

        const [rows] = await db.query(`
            SELECT p.payment_id, p.order_id, p.customer_name, p.customer_email, p.amount, p.payment_method, p.status, p.transaction_id, p.payment_date
            FROM payments p
            WHERE ${where.join(" AND ")}
            ORDER BY p.payment_date DESC
        `, params);

        res.json({
            success: true,
            records: rows
        });

    } catch (err) {
        console.error("exportPayments error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getPayments,
    getPaymentStats,
    getPaymentById,
    updatePaymentStatus,
    getRefunds,
    createRefund,
    updateRefundStatus,
    exportPayments
};
