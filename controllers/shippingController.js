// ==========================================
// SHIPPING CONTROLLER
// ==========================================

const db = require("../config/db");
const { logActivity } = require("./activityLogController");


// ==========================================
// GET ALL SHIPMENTS
// ==========================================
const listShipments = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let where = ["1=1"];
        let params = [];

        if (status && status !== "all") {
            where.push("s.shipping_status = ?");
            params.push(status);
        }

        if (search) {
            where.push("(s.tracking_number LIKE ? OR s.customer_name LIKE ? OR s.order_id LIKE ?)");
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const whereClause = where.join(" AND ");

        const [shipments] = await db.query(
            `SELECT s.*, o.total as order_total
             FROM shipments s
             LEFT JOIN orders o ON s.order_id = o.id
             WHERE ${whereClause}
             ORDER BY s.created_at DESC
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        const [[{ total }]] = await db.query(
            `SELECT COUNT(*) as total FROM shipments s WHERE ${whereClause}`,
            params
        );

        // Status summary counts
        const [counts] = await db.query(
            `SELECT shipping_status, COUNT(*) as cnt FROM shipments GROUP BY shipping_status`
        );
        const summary = { All: total, Pending: 0, Processing: 0, Shipped: 0, In_Transit: 0, Delivered: 0 };
        counts.forEach(r => { summary[r.shipping_status] = r.cnt; });

        res.json({ success: true, shipments, total, summary, page: parseInt(page), limit: parseInt(limit) });

    } catch (err) {
        if (err.code === 'ECONNREFUSED' || err.name === 'AggregateError' || String(err).includes('ECONNREFUSED')) {
            console.log("ℹ️ [Offline Mode] Serving fallback shipments list.");
            return res.json({
                success: true,
                shipments: [
                    {
                        id: 1,
                        order_id: 1001,
                        customer_name: "Jignesh Patil",
                        courier_name: "BlueDart",
                        tracking_number: "BD9322159403IN",
                        shipping_status: "Delivered",
                        created_at: new Date().toISOString(),
                        order_total: 649
                    }
                ],
                total: 1,
                summary: { All: 1, Pending: 0, Processing: 0, Shipped: 0, In_Transit: 0, Delivered: 1 },
                page: 1,
                limit: 20,
                isOfflineMode: true
            });
        }
        console.error("listShipments error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};


// ==========================================
// GET SINGLE SHIPMENT
// ==========================================
const getShipmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const [[shipment]] = await db.query(
            `SELECT s.*, o.total as order_total, o.status as order_status
             FROM shipments s
             LEFT JOIN orders o ON s.order_id = o.id
             WHERE s.id = ?`,
            [id]
        );

        if (!shipment) {
            return res.status(404).json({ success: false, message: "Shipment not found" });
        }

        res.json({ success: true, shipment });

    } catch (err) {
        console.error("getShipmentById error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};


// ==========================================
// CREATE SHIPMENT
// ==========================================
const createShipment = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const {
            order_id, customer_name, address, phone,
            courier_name, tracking_number, shipping_date,
            expected_delivery, notes
        } = req.body;

        // Validate order exists
        const [[order]] = await conn.query(
            "SELECT id, status, user_id FROM orders WHERE id = ?",
            [order_id]
        );
        if (!order) {
            await conn.rollback();
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Check no duplicate shipment
        const [[existing]] = await conn.query(
            "SELECT id FROM shipments WHERE order_id = ?",
            [order_id]
        );
        if (existing) {
            await conn.rollback();
            return res.status(400).json({ success: false, message: "Shipment already exists for this order" });
        }

        // Insert shipment
        const [result] = await conn.query(
            `INSERT INTO shipments
             (order_id, customer_name, address, phone, courier_name, tracking_number,
              shipping_date, expected_delivery, shipping_status, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Processing', ?)`,
            [order_id, customer_name, address, phone, courier_name, tracking_number,
             shipping_date, expected_delivery, notes || null]
        );

        // Update order status to Processing
        await conn.query(
            "UPDATE orders SET status = 'processing' WHERE id = ?",
            [order_id]
        );

        // Create notification for user
        if (order.user_id) {
            await conn.query(
                `INSERT INTO shipping_notifications (user_id, order_id, message)
                 VALUES (?, ?, ?)`,
                [order.user_id, order_id, `ðŸ“¦ Your order #${order_id} is being processed for shipment.`]
            );
        }

        await conn.commit();

        logActivity({
            admin_name: "Admin",
            action: "Created Shipment",
            module: "Shipping",
            details: `Created shipment for Order #${order_id} via ${courier_name || 'Courier'} (Tracking: ${tracking_number || 'N/A'})`,
            status: "success",
            icon: "fa-truck-fast"
        });

        res.json({
            success: true,
            message: "Shipment created successfully",
            shipment_id: result.insertId
        });

    } catch (err) {
        await conn.rollback();
        console.error("createShipment error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        conn.release();
    }
};


// ==========================================
// UPDATE SHIPMENT
// ==========================================
const updateShipment = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            courier_name, tracking_number,
            shipping_date, expected_delivery, notes
        } = req.body;

        await db.query(
            `UPDATE shipments
             SET courier_name = ?, tracking_number = ?,
                 shipping_date = ?, expected_delivery = ?, notes = ?
             WHERE id = ?`,
            [courier_name, tracking_number, shipping_date, expected_delivery, notes, id]
        );

        res.json({ success: true, message: "Shipment updated successfully" });

    } catch (err) {
        console.error("updateShipment error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};


// ==========================================
// UPDATE SHIPMENT STATUS
// ==========================================
const updateShipmentStatus = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { id } = req.params;
        const { shipping_status } = req.body;

        const validStatuses = ["Pending", "Processing", "Shipped", "In_Transit", "Delivered"];
        if (!validStatuses.includes(shipping_status)) {
            return res.status(400).json({ success: false, message: "Invalid shipping status" });
        }

        // Get current shipment
        const [[shipment]] = await conn.query(
            "SELECT * FROM shipments WHERE id = ?",
            [id]
        );
        if (!shipment) {
            await conn.rollback();
            return res.status(404).json({ success: false, message: "Shipment not found" });
        }

        // Set delivery_date when delivered
        const deliveryDate = shipping_status === "Delivered" ? new Date().toISOString().split("T")[0] : null;

        await conn.query(
            `UPDATE shipments SET shipping_status = ?, delivery_date = COALESCE(?, delivery_date)
             WHERE id = ?`,
            [shipping_status, deliveryDate, id]
        );

        // Sync order status
        const orderStatusMap = {
            Pending: "pending",
            Processing: "processing",
            Shipped: "shipped",
            In_Transit: "shipped",
            Delivered: "delivered"
        };
        await conn.query(
            "UPDATE orders SET status = ? WHERE id = ?",
            [orderStatusMap[shipping_status], shipment.order_id]
        );

        // Notification messages
        const notifMap = {
            Shipped: `ðŸ“¦ Your order #${shipment.order_id} has been shipped! Courier: ${shipment.courier_name || "N/A"}, Tracking: ${shipment.tracking_number || "N/A"}`,
            In_Transit: `ðŸšš Your order #${shipment.order_id} is currently in transit.`,
            Delivered: `âœ… Your order #${shipment.order_id} has been delivered. Thank you for shopping with us!`,
            Processing: `âš™ï¸ Your order #${shipment.order_id} is being processed.`,
            Pending: `ðŸ• Your order #${shipment.order_id} shipment is pending.`
        };

        // Get order's user_id
        const [[order]] = await conn.query("SELECT user_id FROM orders WHERE id = ?", [shipment.order_id]);
        if (order && order.user_id && notifMap[shipping_status]) {
            await conn.query(
                `INSERT INTO shipping_notifications (user_id, order_id, message)
                 VALUES (?, ?, ?)`,
                [order.user_id, shipment.order_id, notifMap[shipping_status]]
            );
        }

        await conn.commit();

        logActivity({
            admin_name: "Admin",
            action: "Updated Shipping Status",
            module: "Shipping",
            details: `Shipment #${id} (Order #${shipment.order_id}) status updated to ${shipping_status.replace('_', ' ')}`,
            status: shipping_status === "Delivered" ? "success" : "info",
            icon: "fa-route"
        });

        res.json({
            success: true,
            message: `Shipment status updated to ${shipping_status}`,
            notification: notifMap[shipping_status]
        });

    } catch (err) {
        await conn.rollback();
        console.error("updateShipmentStatus error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        conn.release();
    }
};


// ==========================================
// DELETE SHIPMENT
// ==========================================
const deleteShipment = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM shipments WHERE id = ?", [id]);
        res.json({ success: true, message: "Shipment deleted" });
    } catch (err) {
        console.error("deleteShipment error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};


// ==========================================
// TRACK SHIPMENT BY TRACKING NUMBER
// ==========================================
const trackShipment = async (req, res) => {
    try {
        const { trackingNumber } = req.params;
        const [[shipment]] = await db.query(
            `SELECT s.*, o.total as order_total, o.created_at as order_date
             FROM shipments s
             LEFT JOIN orders o ON s.order_id = o.id
             WHERE s.tracking_number = ?`,
            [trackingNumber]
        );

        if (!shipment) {
            return res.status(404).json({ success: false, message: "No shipment found with this tracking number" });
        }

        // Build timeline
        const statusOrder = ["Pending", "Processing", "Shipped", "In_Transit", "Delivered"];
        const currentIdx = statusOrder.indexOf(shipment.shipping_status);

        const timeline = [
            { label: "Order Confirmed", icon: "fa-check-circle", status: "order_confirmed", completed: true },
            { label: "Shipment Created", icon: "fa-box", status: "Pending", completed: currentIdx >= 0 },
            { label: "Processing", icon: "fa-gears", status: "Processing", completed: currentIdx >= 1 },
            { label: "Picked Up / Shipped", icon: "fa-truck-fast", status: "Shipped", completed: currentIdx >= 2 },
            { label: "In Transit", icon: "fa-route", status: "In_Transit", completed: currentIdx >= 3 },
            { label: "Out for Delivery", icon: "fa-truck-ramp-box", status: "out_for_delivery", completed: currentIdx >= 4 },
            { label: "Delivered", icon: "fa-circle-check", status: "Delivered", completed: currentIdx >= 4 }
        ];

        res.json({ success: true, shipment, timeline });

    } catch (err) {
        console.error("trackShipment error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};


// ==========================================
// TRACK SHIPMENT BY ORDER ID (for users)
// ==========================================
const trackByOrderId = async (req, res) => {
    try {
        const { orderId } = req.params;
        const [[shipment]] = await db.query(
            `SELECT s.*, o.total as order_total, o.created_at as order_date
             FROM shipments s
             LEFT JOIN orders o ON s.order_id = o.id
             WHERE s.order_id = ?`,
            [orderId]
        );

        if (!shipment) {
            return res.status(404).json({ success: false, message: "No shipment found for this order" });
        }

        const statusOrder = ["Pending", "Processing", "Shipped", "In_Transit", "Delivered"];
        const currentIdx = statusOrder.indexOf(shipment.shipping_status);

        const timeline = [
            { label: "Order Confirmed", icon: "fa-check-circle", completed: true },
            { label: "Shipment Created", icon: "fa-box", completed: currentIdx >= 0 },
            { label: "Processing", icon: "fa-gears", completed: currentIdx >= 1 },
            { label: "Picked Up", icon: "fa-truck-fast", completed: currentIdx >= 2 },
            { label: "In Transit", icon: "fa-route", completed: currentIdx >= 3 },
            { label: "Out for Delivery", icon: "fa-truck-ramp-box", completed: currentIdx >= 4 },
            { label: "Delivered", icon: "fa-circle-check", completed: currentIdx >= 4 }
        ];

        res.json({ success: true, shipment, timeline });

    } catch (err) {
        console.error("trackByOrderId error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};


// ==========================================
// GET SHIPPING SETTINGS
// ==========================================
const getShippingSettings = async (req, res) => {
    try {
        const [[settings]] = await db.query("SELECT * FROM shipping_settings WHERE id = 1");
        const [zones] = await db.query("SELECT * FROM shipping_zones ORDER BY id");
        res.json({ success: true, settings, zones });
    } catch (err) {
        console.error("getShippingSettings error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};


// ==========================================
// UPDATE SHIPPING SETTINGS
// ==========================================
const updateShippingSettings = async (req, res) => {
    try {
        const {
            standard_price, free_above, delivery_time_min,
            delivery_time_max, enabled, cod_available
        } = req.body;

        await db.query(
            `UPDATE shipping_settings
             SET standard_price = ?, free_above = ?, delivery_time_min = ?,
                 delivery_time_max = ?, enabled = ?, cod_available = ?
             WHERE id = 1`,
            [standard_price, free_above, delivery_time_min, delivery_time_max,
             enabled ? 1 : 0, cod_available ? 1 : 0]
        );

        res.json({ success: true, message: "Shipping settings updated successfully" });

    } catch (err) {
        console.error("updateShippingSettings error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};


// ==========================================
// GET / UPDATE / DELETE SHIPPING ZONES
// ==========================================
const getShippingZones = async (req, res) => {
    try {
        const [zones] = await db.query("SELECT * FROM shipping_zones ORDER BY id");
        res.json({ success: true, zones });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const createShippingZone = async (req, res) => {
    try {
        const { region_name, price } = req.body;
        const [result] = await db.query(
            "INSERT INTO shipping_zones (region_name, price) VALUES (?, ?)",
            [region_name, price]
        );
        res.json({ success: true, id: result.insertId, message: "Shipping zone added" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateShippingZone = async (req, res) => {
    try {
        const { id } = req.params;
        const { region_name, price } = req.body;
        await db.query(
            "UPDATE shipping_zones SET region_name = ?, price = ? WHERE id = ?",
            [region_name, price, id]
        );
        res.json({ success: true, message: "Shipping zone updated" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteShippingZone = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM shipping_zones WHERE id = ?", [id]);
        res.json({ success: true, message: "Shipping zone deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// ==========================================
// GET USER SHIPPING NOTIFICATIONS
// ==========================================
const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const [notifs] = await db.query(
            `SELECT * FROM shipping_notifications
             WHERE user_id = ?
             ORDER BY created_at DESC
             LIMIT 20`,
            [userId]
        );
        res.json({ success: true, notifications: notifs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const markNotificationRead = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("UPDATE shipping_notifications SET is_read = 1 WHERE id = ?", [id]);
        res.json({ success: true, message: "Notification marked as read" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// ==========================================
// GET ORDERS WITHOUT SHIPMENTS (for create form)
// ==========================================
const getPendingOrders = async (req, res) => {
    try {
        const [orders] = await db.query(
            `SELECT o.id, o.status, o.total, o.created_at,
                    COALESCE(o.customer_name, u.name) as customer_name,
                    o.phone, o.email,
                    o.address, o.city, o.state
             FROM orders o
             LEFT JOIN users u ON o.user_id = u.id
             WHERE o.id NOT IN (SELECT order_id FROM shipments)
               AND o.status NOT IN ('cancelled', 'delivered')
             ORDER BY o.created_at DESC`,
            []
        );
        res.json({ success: true, orders });
    } catch (err) {
        console.error("getPendingOrders error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};


module.exports = {
    listShipments,
    getShipmentById,
    createShipment,
    updateShipment,
    updateShipmentStatus,
    deleteShipment,
    trackShipment,
    trackByOrderId,
    getShippingSettings,
    updateShippingSettings,
    getShippingZones,
    createShippingZone,
    updateShippingZone,
    deleteShippingZone,
    getUserNotifications,
    markNotificationRead,
    getPendingOrders
};

