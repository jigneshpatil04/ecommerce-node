// ==========================================
// ACTIVITY LOG CONTROLLER
// Real-time Audit Trail & Administrative Logs
// ==========================================

const db = require("../config/db");

let isTableInitialized = false;

// ==========================================
// AUTO-INITIALIZE TABLE IF NOT EXISTS
// ==========================================
async function initActivityLogTable() {
    if (isTableInitialized) return;
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                admin_name VARCHAR(100) DEFAULT 'Admin',
                admin_id INT NULL,
                action VARCHAR(100) NOT NULL,
                module VARCHAR(50) NOT NULL,
                details TEXT NULL,
                ip_address VARCHAR(50) DEFAULT '127.0.0.1',
                status ENUM('success', 'warning', 'danger', 'info') DEFAULT 'success',
                icon VARCHAR(50) DEFAULT 'fa-clock-rotate-left',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_module (module),
                INDEX idx_status (status),
                INDEX idx_created_at (created_at)
            )
        `);

        // Seed initial realistic activity logs if empty
        const [rows] = await db.execute("SELECT COUNT(*) AS total FROM activity_logs");
        if (rows[0].total === 0) {
            console.log("Seeding initial activity logs...");
            const sampleLogs = [
                ['Admin', 1, 'Logged In', 'Auth', 'Admin logged in successfully to management console', '127.0.0.1', 'info', 'fa-right-to-bracket', 'NOW() - INTERVAL 10 MINUTE'],
                ['Admin', 1, 'Updated Settings', 'Settings', 'Updated store configuration: Standard shipping set to ₹50, Free shipping above ₹999', '127.0.0.1', 'success', 'fa-gear', 'NOW() - INTERVAL 35 MINUTE'],
                ['Admin', 1, 'Created Shipment', 'Shipping', 'Created shipment for Order #1001 via BlueDart (Tracking: BD12345)', '127.0.0.1', 'success', 'fa-truck-fast', 'NOW() - INTERVAL 1 HOUR'],
                ['Admin', 1, 'Status Updated', 'Shipping', 'Shipment for Order #1002 marked as In Transit', '127.0.0.1', 'info', 'fa-route', 'NOW() - INTERVAL 2 HOUR'],
                ['Admin', 1, 'Stock Adjusted', 'Inventory', 'Updated stock for Denim Jacket (Size: L, Color: Blue): 15 -> 25 units', '127.0.0.1', 'success', 'fa-boxes-stacked', 'NOW() - INTERVAL 3 HOUR'],
                ['Admin', 1, 'Low Stock Alert', 'Inventory', 'Product Casual Sneakers (Size: 9) reached low stock threshold (3 units left)', '127.0.0.1', 'warning', 'fa-triangle-exclamation', 'NOW() - INTERVAL 5 HOUR'],
                ['Admin', 1, 'Refund Processed', 'Payments', 'Approved refund of ₹1,499 for cancelled Order #1020', '127.0.0.1', 'success', 'fa-arrow-rotate-left', 'NOW() - INTERVAL 7 HOUR'],
                ['Admin', 1, 'Payment Received', 'Payments', 'Received online payment of ₹2,499 for Order #1025 (TXN_987123)', '127.0.0.1', 'success', 'fa-circle-check', 'NOW() - INTERVAL 12 HOUR'],
                ['Admin', 1, 'Category Added', 'Categories', 'Added new category: Summer Essentials', '127.0.0.1', 'success', 'fa-layer-group', 'NOW() - INTERVAL 1 DAY'],
                ['Admin', 1, 'Banner Updated', 'Banners', 'Updated Hero Banner display order and activated Festive Sale promo', '127.0.0.1', 'success', 'fa-images', 'NOW() - INTERVAL 2 DAY'],
                ['Admin', 1, 'Product Modified', 'Products', 'Updated price and description for Cotton Casual Shirt (₹899 -> ₹799)', '127.0.0.1', 'info', 'fa-pen-to-square', 'NOW() - INTERVAL 3 DAY']
            ];

            for (const log of sampleLogs) {
                await db.execute(
                    `INSERT INTO activity_logs (admin_name, admin_id, action, module, details, ip_address, status, icon, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ${log[8]})`,
                    [log[0], log[1], log[2], log[3], log[4], log[5], log[6], log[7]]
                );
            }
        }
        isTableInitialized = true;
    } catch (err) {
        console.error("initActivityLogTable error:", err.message);
    }
}

// Ensure table exists on first import
initActivityLogTable();

// ==========================================
// HELPER: LOG ACTIVITY INTERNALLY
// ==========================================
const logActivity = async ({
    admin_name = "Admin",
    admin_id = 1,
    action,
    module,
    details = "",
    ip_address = "127.0.0.1",
    status = "success",
    icon = "fa-clock-rotate-left"
}) => {
    try {
        await initActivityLogTable();
        await db.execute(
            `INSERT INTO activity_logs (admin_name, admin_id, action, module, details, ip_address, status, icon)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [admin_name, admin_id, action, module, details, ip_address, status, icon]
        );
    } catch (err) {
        console.error("logActivity error:", err.message);
    }
};

// ==========================================
// GET ALL ACTIVITY LOGS (Paginated + Filtered)
// ==========================================
const getActivityLogs = async (req, res) => {
    try {
        await initActivityLogTable();
        const {
            search = "",
            module = "all",
            status = "all",
            date_filter = "all",
            page = 1,
            limit = 15
        } = req.query;

        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.max(1, parseInt(limit) || 15);
        const offset = (pageNum - 1) * limitNum;

        let where = ["1=1"];
        let params = [];

        if (module && module !== "all") {
            where.push("module = ?");
            params.push(module);
        }

        if (status && status !== "all") {
            where.push("status = ?");
            params.push(status);
        }

        if (search && search.trim() !== "") {
            const s = `%${search.trim()}%`;
            where.push("(action LIKE ? OR details LIKE ? OR admin_name LIKE ? OR ip_address LIKE ?)");
            params.push(s, s, s, s);
        }

        // Date filter
        if (date_filter === "today") {
            where.push("DATE(created_at) = CURDATE()");
        } else if (date_filter === "yesterday") {
            where.push("DATE(created_at) = CURDATE() - INTERVAL 1 DAY");
        } else if (date_filter === "last7") {
            where.push("created_at >= NOW() - INTERVAL 7 DAY");
        } else if (date_filter === "last30") {
            where.push("created_at >= NOW() - INTERVAL 30 DAY");
        }

        const whereSql = where.join(" AND ");

        // Query total
        const [countRows] = await db.execute(
            `SELECT COUNT(*) AS total FROM activity_logs WHERE ${whereSql}`,
            params
        );
        const total = countRows[0].total;

        // Query logs
        const [logs] = await db.query(
            `SELECT id, admin_name, admin_id, action, module, details, ip_address, status, icon, created_at
             FROM activity_logs
             WHERE ${whereSql}
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?`,
            [...params, limitNum, offset]
        );

        res.json({
            success: true,
            logs,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum) || 1
        });
    } catch (err) {
        if (err.code === 'ECONNREFUSED' || err.name === 'AggregateError' || String(err).includes('ECONNREFUSED')) {
            return res.json({
                success: true,
                logs: [],
                total: 0,
                page: 1,
                limit: 15,
                totalPages: 1,
                isOfflineMode: true
            });
        }
        console.error("getActivityLogs error:", err);
        res.status(500).json({ success: false, message: "Server error fetching activity logs", error: err.message });
    }
};

// ==========================================
// GET LOG STATISTICS & METRICS
// ==========================================
const getActivityStats = async (req, res) => {
    try {
        await initActivityLogTable();

        const [totalRows] = await db.execute("SELECT COUNT(*) AS total FROM activity_logs");
        const total = totalRows[0].total;

        const [todayRows] = await db.execute("SELECT COUNT(*) AS today FROM activity_logs WHERE DATE(created_at) = CURDATE()");
        const today = todayRows[0].today;

        const [secRows] = await db.execute("SELECT COUNT(*) AS count FROM activity_logs WHERE module IN ('Settings', 'Auth', 'Users')");
        const securitySettings = secRows[0].count;

        const [orderRows] = await db.execute("SELECT COUNT(*) AS count FROM activity_logs WHERE module IN ('Shipping', 'Payments', 'Inventory', 'Products')");
        const ordersOps = orderRows[0].count;

        // Module breakdown
        const [moduleCounts] = await db.execute(
            "SELECT module, COUNT(*) AS count FROM activity_logs GROUP BY module ORDER BY count DESC LIMIT 8"
        );

        // Status breakdown
        const [statusCounts] = await db.execute(
            "SELECT status, COUNT(*) AS count FROM activity_logs GROUP BY status"
        );

        res.json({
            success: true,
            stats: {
                total,
                today,
                securitySettings,
                ordersOps,
                moduleCounts,
                statusCounts
            }
        });
    } catch (err) {
        if (err.code === 'ECONNREFUSED' || err.name === 'AggregateError' || String(err).includes('ECONNREFUSED')) {
            return res.json({
                success: true,
                stats: {
                    total: 0,
                    today: 0,
                    securitySettings: 0,
                    ordersOps: 0,
                    moduleCounts: [],
                    statusCounts: []
                },
                isOfflineMode: true
            });
        }
        console.error("getActivityStats error:", err);
        res.status(500).json({ success: false, message: "Error fetching stats", error: err.message });
    }
};

// ==========================================
// CREATE ACTIVITY LOG (MANUAL/API)
// ==========================================
const createActivityLog = async (req, res) => {
    try {
        await initActivityLogTable();
        const {
            admin_name = "Admin",
            action,
            module,
            details = "",
            status = "success",
            icon = "fa-clock-rotate-left"
        } = req.body;

        if (!action || !module) {
            return res.status(400).json({ success: false, message: "Action and module are required" });
        }

        const ip_address = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";

        await db.execute(
            `INSERT INTO activity_logs (admin_name, action, module, details, ip_address, status, icon)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [admin_name, action, module, details, ip_address, status, icon]
        );

        res.json({ success: true, message: "Activity logged successfully" });
    } catch (err) {
        console.error("createActivityLog error:", err);
        res.status(500).json({ success: false, message: "Error creating log", error: err.message });
    }
};

// ==========================================
// CLEAR ALL OR OLD ACTIVITY LOGS
// ==========================================
const clearActivityLogs = async (req, res) => {
    try {
        await initActivityLogTable();
        const { days = 0 } = req.body;

        if (days && parseInt(days) > 0) {
            await db.execute(`DELETE FROM activity_logs WHERE created_at < NOW() - INTERVAL ? DAY`, [parseInt(days)]);
            await logActivity({
                admin_name: "Admin",
                action: "Cleared Logs",
                module: "Settings",
                details: `Cleared activity logs older than ${days} days`,
                status: "warning",
                icon: "fa-trash"
            });
            return res.json({ success: true, message: `Cleared activity logs older than ${days} days` });
        }

        await db.execute("DELETE FROM activity_logs");
        await logActivity({
            admin_name: "Admin",
            action: "Cleared All Logs",
            module: "Settings",
            details: "Cleared all activity history logs",
            status: "warning",
            icon: "fa-trash"
        });

        res.json({ success: true, message: "All activity logs have been cleared" });
    } catch (err) {
        console.error("clearActivityLogs error:", err);
        res.status(500).json({ success: false, message: "Error clearing logs", error: err.message });
    }
};

// ==========================================
// EXPORT ACTIVITY LOGS
// ==========================================
const exportActivityLogs = async (req, res) => {
    try {
        await initActivityLogTable();
        const [logs] = await db.query(
            `SELECT id, admin_name, action, module, details, ip_address, status, created_at
             FROM activity_logs
             ORDER BY created_at DESC
             LIMIT 1000`
        );
        res.json({ success: true, logs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getActivityLogs,
    getActivityStats,
    createActivityLog,
    clearActivityLogs,
    exportActivityLogs,
    logActivity
};
