// ==========================================
// ADMIN ORDER NOTIFICATIONS CONTROLLER
// Real-time Order Alerts, Unread Tracking & Dispatch Links
// ==========================================

const db = require("../config/db");
const { logActivity } = require("./activityLogController");

let isTableInitialized = false;

// ==========================================
// AUTO-INITIALIZE TABLE IF NOT EXISTS
// ==========================================
async function initOrderNotificationTable() {
    if (isTableInitialized) return;
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS admin_order_notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                customer_name VARCHAR(150) NOT NULL DEFAULT 'Customer',
                customer_email VARCHAR(150) NULL,
                customer_phone VARCHAR(50) NULL,
                total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
                items_count INT DEFAULT 1,
                payment_method VARCHAR(50) DEFAULT 'Online',
                payment_status VARCHAR(50) DEFAULT 'Pending',
                order_status VARCHAR(50) DEFAULT 'pending',
                is_read TINYINT(1) DEFAULT 0,
                read_at DATETIME NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_is_read (is_read),
                INDEX idx_order_id (order_id),
                INDEX idx_created_at (created_at)
            )
        `);

        // Check if table is empty
        const [rows] = await db.execute("SELECT COUNT(*) AS total FROM admin_order_notifications");
        if (rows[0].total === 0) {
            console.log("Seeding initial order notifications...");
            
            // Check if existing orders exist in 'orders' table
            const [orders] = await db.query(
                `SELECT id, customer_name, email, phone, COALESCE(total, total_amount, 0) as total, 
                        COALESCE(payment_method, 'Online') as payment_method, 
                        COALESCE(payment_status, 'paid') as payment_status,
                        COALESCE(status, 'pending') as status, created_at 
                 FROM orders ORDER BY created_at DESC LIMIT 15`
            );

            if (orders && orders.length > 0) {
                // Populate from existing orders
                for (let i = 0; i < orders.length; i++) {
                    const o = orders[i];
                    // Keep first 3 as unread
                    const isRead = i < 3 ? 0 : 1;
                    await db.execute(
                        `INSERT INTO admin_order_notifications 
                         (order_id, customer_name, customer_email, customer_phone, total_amount, payment_method, payment_status, order_status, is_read, created_at)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            o.id,
                            o.customer_name || 'Customer',
                            o.email || null,
                            o.phone || null,
                            parseFloat(o.total) || 0,
                            o.payment_method || 'Online',
                            o.payment_status || 'Pending',
                            o.status || 'pending',
                            isRead,
                            o.created_at || new Date()
                        ]
                    );
                }
            } else {
                // Insert realistic sample order notifications
                const sampleNotifications = [
                    [1025, 'Rahul Sharma', 'rahul@gmail.com', '9876543210', 2499.00, 2, 'Online', 'Successful', 'pending', 0, 'NOW() - INTERVAL 5 MINUTE'],
                    [1026, 'Priya Patel', 'priya.p@gmail.com', '9823456781', 1299.00, 1, 'COD', 'Pending', 'pending', 0, 'NOW() - INTERVAL 25 MINUTE'],
                    [1027, 'Amit Verma', 'amit.v@outlook.com', '9712345678', 3499.00, 3, 'UPI', 'Successful', 'processing', 0, 'NOW() - INTERVAL 1 HOUR'],
                    [1028, 'Sneha Rao', 'sneha.rao@gmail.com', '9834567890', 899.00, 1, 'Online', 'Successful', 'shipped', 1, 'NOW() - INTERVAL 4 HOUR'],
                    [1029, 'Vikas Gupta', 'vikas.g@yahoo.com', '9890123456', 4599.00, 4, 'COD', 'Pending', 'shipped', 1, 'NOW() - INTERVAL 1 DAY'],
                    [1030, 'Ananya Desai', 'ananya.d@gmail.com', '9765432109', 1799.00, 2, 'Online', 'Successful', 'delivered', 1, 'NOW() - INTERVAL 2 DAY']
                ];

                for (const sn of sampleNotifications) {
                    await db.execute(
                        `INSERT INTO admin_order_notifications 
                         (order_id, customer_name, customer_email, customer_phone, total_amount, items_count, payment_method, payment_status, order_status, is_read, created_at)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ${sn[10]})`,
                        [sn[0], sn[1], sn[2], sn[3], sn[4], sn[5], sn[6], sn[7], sn[8], sn[9]]
                    );
                }
            }
        }
        isTableInitialized = true;
    } catch (err) {
        console.error("initOrderNotificationTable error:", err.message);
    }
}

// Ensure table exists on import
initOrderNotificationTable();

// ==========================================
// HELPER: NOTIFY NEW ORDER (CALLED ON CHECKOUT)
// ==========================================
const notifyNewOrder = async ({
    order_id,
    customer_name = "Customer",
    customer_email = null,
    customer_phone = null,
    total_amount = 0,
    items_count = 1,
    payment_method = "Online",
    payment_status = "Pending",
    order_status = "pending"
}) => {
    try {
        await initOrderNotificationTable();
        await db.execute(
            `INSERT INTO admin_order_notifications 
             (order_id, customer_name, customer_email, customer_phone, total_amount, items_count, payment_method, payment_status, order_status, is_read)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
            [order_id, customer_name, customer_email, customer_phone, total_amount, items_count, payment_method, payment_status, order_status]
        );

        if (logActivity) {
            logActivity({
                admin_name: "System",
                action: "New Order Placed",
                module: "Shipping",
                details: `New Order #${order_id} placed by ${customer_name} (₹${parseFloat(total_amount).toFixed(2)}, ${payment_method})`,
                status: "success",
                icon: "fa-bell"
            });
        }
    } catch (err) {
        console.error("notifyNewOrder error:", err.message);
    }
};

// ==========================================
// 1. GET ALL ORDER NOTIFICATIONS
// ==========================================
const getOrderNotifications = async (req, res) => {
    try {
        await initOrderNotificationTable();
        const {
            filter = "all", // 'all', 'unread', 'read'
            search = "",
            page = 1,
            limit = 15
        } = req.query;

        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.max(1, parseInt(limit) || 15);
        const offset = (pageNum - 1) * limitNum;

        let where = ["1=1"];
        let params = [];

        if (filter === "unread") {
            where.push("is_read = 0");
        } else if (filter === "read") {
            where.push("is_read = 1");
        }

        if (search && search.trim() !== "") {
            const s = `%${search.trim()}%`;
            where.push("(CAST(order_id AS CHAR) LIKE ? OR customer_name LIKE ? OR customer_email LIKE ? OR customer_phone LIKE ?)");
            params.push(s, s, s, s);
        }

        const whereSql = where.join(" AND ");

        // Total matching
        const [countRows] = await db.execute(
            `SELECT COUNT(*) AS total FROM admin_order_notifications WHERE ${whereSql}`,
            params
        );
        const total = countRows[0].total;

        // Fetch notifications
        const [notifications] = await db.query(
            `SELECT id, order_id, customer_name, customer_email, customer_phone, 
                    total_amount, items_count, payment_method, payment_status, 
                    order_status, is_read, read_at, created_at
             FROM admin_order_notifications
             WHERE ${whereSql}
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?`,
            [...params, limitNum, offset]
        );

        // Fetch summary KPI counts
        const [[{ unreadCount }]] = await db.execute(
            "SELECT COUNT(*) AS unreadCount FROM admin_order_notifications WHERE is_read = 0"
        );

        const [[{ todayCount }]] = await db.execute(
            "SELECT COUNT(*) AS todayCount FROM admin_order_notifications WHERE DATE(created_at) = CURDATE()"
        );

        const [[{ totalOrders }]] = await db.execute(
            "SELECT COUNT(*) AS totalOrders FROM admin_order_notifications"
        );

        const [[{ pendingRevenue }]] = await db.execute(
            "SELECT COALESCE(SUM(total_amount), 0) AS pendingRevenue FROM admin_order_notifications WHERE is_read = 0"
        );

        res.json({
            success: true,
            notifications,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum) || 1,
            stats: {
                total: totalOrders,
                unread: unreadCount,
                today: todayCount,
                pendingRevenue: parseFloat(pendingRevenue).toFixed(2)
            }
        });

    } catch (err) {
        if (err.code === 'ECONNREFUSED' || err.name === 'AggregateError' || String(err).includes('ECONNREFUSED')) {
            return res.json({
                success: true,
                notifications: [],
                total: 0,
                page: 1,
                limit: 15,
                totalPages: 1,
                stats: { total: 0, unread: 0, today: 0, pendingRevenue: "0.00" },
                isOfflineMode: true
            });
        }
        console.error("getOrderNotifications error:", err);
        res.status(500).json({ success: false, message: "Error fetching order notifications", error: err.message });
    }
};

// ==========================================
// 2. GET UNREAD COUNT (FOR SIDEBAR BADGE)
// ==========================================
const getUnreadCount = async (req, res) => {
    try {
        await initOrderNotificationTable();
        const [[{ count }]] = await db.execute(
            "SELECT COUNT(*) AS count FROM admin_order_notifications WHERE is_read = 0"
        );
        res.json({ success: true, count });
    } catch (err) {
        if (err.code === 'ECONNREFUSED' || err.name === 'AggregateError' || String(err).includes('ECONNREFUSED')) {
            return res.json({ success: true, count: 0, isOfflineMode: true });
        }
        console.error("getUnreadCount error:", err);
        res.status(500).json({ success: false, count: 0, message: err.message });
    }
};

// ==========================================
// 3. MARK SINGLE NOTIFICATION AS READ / UNREAD
// ==========================================
const toggleReadStatus = async (req, res) => {
    try {
        await initOrderNotificationTable();
        const { id } = req.params;
        const { is_read } = req.body; // 1 or 0

        const newReadStatus = is_read !== undefined ? (is_read ? 1 : 0) : 1;
        const readAt = newReadStatus ? new Date() : null;

        await db.execute(
            "UPDATE admin_order_notifications SET is_read = ?, read_at = ? WHERE id = ?",
            [newReadStatus, readAt, id]
        );

        const [[{ count }]] = await db.execute(
            "SELECT COUNT(*) AS count FROM admin_order_notifications WHERE is_read = 0"
        );

        res.json({ success: true, message: `Notification marked as ${newReadStatus ? 'read' : 'unread'}`, unreadCount: count });
    } catch (err) {
        console.error("toggleReadStatus error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ==========================================
// 4. MARK ALL AS READ
// ==========================================
const markAllAsRead = async (req, res) => {
    try {
        await initOrderNotificationTable();
        await db.execute(
            "UPDATE admin_order_notifications SET is_read = 1, read_at = NOW() WHERE is_read = 0"
        );
        res.json({ success: true, message: "All order notifications marked as read", unreadCount: 0 });
    } catch (err) {
        console.error("markAllAsRead error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ==========================================
// 5. DELETE SINGLE NOTIFICATION
// ==========================================
const deleteOrderNotification = async (req, res) => {
    try {
        await initOrderNotificationTable();
        const { id } = req.params;
        await db.execute("DELETE FROM admin_order_notifications WHERE id = ?", [id]);

        const [[{ count }]] = await db.execute(
            "SELECT COUNT(*) AS count FROM admin_order_notifications WHERE is_read = 0"
        );

        res.json({ success: true, message: "Notification deleted", unreadCount: count });
    } catch (err) {
        console.error("deleteOrderNotification error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ==========================================
// 6. CLEAR READ NOTIFICATIONS
// ==========================================
const clearReadNotifications = async (req, res) => {
    try {
        await initOrderNotificationTable();
        await db.execute("DELETE FROM admin_order_notifications WHERE is_read = 1");
        res.json({ success: true, message: "Cleared read notifications" });
    } catch (err) {
        console.error("clearReadNotifications error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getOrderNotifications,
    getUnreadCount,
    toggleReadStatus,
    markAllAsRead,
    deleteOrderNotification,
    clearReadNotifications,
    notifyNewOrder
};
