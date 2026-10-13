// ==========================================
// ORDER CONTROLLER
// ==========================================

const db = require("../config/db");

// In-memory fallback orders for offline mode
const offlineOrders = [
    {
        id: 1001,
        user_id: 1,
        customer_name: "Jignesh Patil",
        email: "jigneshpatil142@gmail.com",
        phone: "9322159403",
        address: "12, Ring Road",
        city: "Dhule",
        state: "Maharashtra",
        pincode: "425409",
        payment_method: "COD",
        subtotal: 599,
        shipping: 50,
        total: 649,
        status: "pending",
        created_at: new Date().toISOString(),
        items: [
            {
                id: 1,
                order_id: 1001,
                product_id: 62,
                product_name: "Urban Graphic Tee",
                price: 599,
                quantity: 1,
                color: "White",
                size: "M",
                image: "/images/tshirt2.jpg"
            }
        ]
    }
];


// ==========================================
// CREATE ORDER
// POST /api/orders
// ==========================================

exports.createOrder = async (req, res) => {

    console.log("");
    console.log("=================================");
    console.log("ORDER REQUEST RECEIVED");
    console.log("=================================");

    console.log("REQUEST BODY:");
    console.log(
        JSON.stringify(req.body, null, 2)
    );

    let connection = null;

    try {

        // ==========================================
        // CHECK REQUEST BODY
        // ==========================================

        if (!req.body) {

            return res.status(400).json({
                success: false,
                message: "Request body is missing."
            });

        }


        // ==========================================
        // GET DATABASE CONNECTION
        // ==========================================

        connection = await db.getConnection();


        // ==========================================
        // GET USER ID
        // ==========================================

        let userId =
            req.body.user_id ||
            req.body.userId ||
            null;


        // ==========================================
        // GET CUSTOMER DATA
        // ==========================================

        const customerName =
            req.body.customerName ||
            req.body.name ||
            "";

        const email =
            req.body.email ||
            "";

        const phone =
            req.body.phone ||
            "";

        const address =
            req.body.address ||
            "";

        const city =
            req.body.city ||
            "";

        const state =
            req.body.state ||
            "";

        const pincode =
            req.body.pincode ||
            "";

        const paymentMethod =
            req.body.paymentMethod ||
            req.body.payment_method ||
            "COD";


        // ==========================================
        // FIND USER ID USING EMAIL
        // ==========================================

        if (!userId && email) {

            const [users] =
                await connection.execute(
                    `
                    SELECT id
                    FROM users
                    WHERE email = ?
                    LIMIT 1
                    `,
                    [email]
                );

            if (users.length > 0) {

                userId =
                    users[0].id;

            }

        }


        // ==========================================
        // GET PRODUCTS
        // ==========================================

        const products =
            Array.isArray(req.body.products)
                ? req.body.products
                : [];


        // ==========================================
        // GET TOTALS
        // ==========================================

        const subtotal =
            Number(
                req.body.subtotal
            ) || 0;

        const shipping =
            Number(
                req.body.shipping
            ) || 0;

        const total =
            Number(
                req.body.total
            ) || 0;


        // ==========================================
        // DEBUG CUSTOMER DATA
        // ==========================================

        console.log("");
        console.log("CUSTOMER DATA");
        console.log("---------------------------------");

        console.log(
            "User ID:",
            userId
        );

        console.log(
            "Customer Name:",
            customerName
        );

        console.log(
            "Email:",
            email
        );

        console.log(
            "Phone:",
            phone
        );

        console.log(
            "Address:",
            address
        );

        console.log(
            "City:",
            city
        );

        console.log(
            "State:",
            state
        );

        console.log(
            "Pincode:",
            pincode
        );

        console.log(
            "Payment Method:",
            paymentMethod
        );

        console.log(
            "Subtotal:",
            subtotal
        );

        console.log(
            "Shipping:",
            shipping
        );

        console.log(
            "Total:",
            total
        );


        // ==========================================
        // VALIDATION
        // ==========================================

        if (!customerName) {

            return res.status(400).json({
                success: false,
                message: "Customer name is required."
            });

        }


        if (!phone) {

            return res.status(400).json({
                success: false,
                message: "Phone number is required."
            });

        }


        if (
            !Array.isArray(products) ||
            products.length === 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Order must contain at least one product."
            });

        }


        // ==========================================
        // DEBUG PRODUCTS
        // ==========================================

        console.log("");
        console.log("ORDER PRODUCTS");
        console.log("---------------------------------");

        console.log(
            JSON.stringify(
                products,
                null,
                2
            )
        );


        // ==========================================
        // START TRANSACTION
        // ==========================================

        console.log("");
        console.log(
            "STARTING DATABASE TRANSACTION..."
        );

        await connection.beginTransaction();


        // ==========================================
        // INSERT ORDER
        // ==========================================

        console.log("");
        console.log("INSERTING ORDER...");


        const orderSql = `
            INSERT INTO orders
            (
                user_id,
                customer_name,
                email,
                phone,
                address,
                city,
                state,
                pincode,
                payment_method,
                subtotal,
                shipping,
                total
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;


        const orderValues = [

            userId,
            customerName,
            email,
            phone,
            address,
            city,
            state,
            pincode,
            paymentMethod,
            subtotal,
            shipping,
            total

        ];


        const [orderResult] =
            await connection.execute(
                orderSql,
                orderValues
            );


        const orderId =
            orderResult.insertId;


        console.log(
            "ORDER CREATED:",
            orderId
        );


        // ==========================================
        // INSERT ORDER ITEMS
        // ==========================================

        console.log("");
        console.log(
            "INSERTING ORDER ITEMS..."
        );


        const itemSql = `
            INSERT INTO order_items
            (
                order_id,
                product_id,
                product_name,
                color,
                size,
                price,
                quantity
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;


        for (const product of products) {

            // ==========================================
            // PRODUCT ID
            // ==========================================

            const productId =
                product.productId ||
                product.id ||
                product.product_id;


            if (
                productId === undefined ||
                productId === null ||
                productId === ""
            ) {

                throw new Error(
                    "Product ID is missing from order item."
                );

            }


            // ==========================================
            // PRODUCT NAME
            // ==========================================

            const productName =
                product.name ||
                product.title ||
                "Product";


            // ==========================================
            // PRODUCT PRICE
            // ==========================================

            const price =
                Number(
                    product.price
                ) || 0;


            // ==========================================
            // PRODUCT QUANTITY
            // ==========================================

            const quantity =
                Number(
                    product.quantity
                ) || 1;


            // ==========================================
            // COLOR & SIZE
            // ==========================================

            const color =
                product.color ||
                product.selectedColor ||
                null;

            const size =
                product.size ||
                product.selectedSize ||
                null;


            console.log("");
            console.log("Order Item:");

            console.log(
                "Product ID:",
                productId
            );

            console.log(
                "Product Name:",
                productName
            );

            console.log(
                "Color:",
                color
            );

            console.log(
                "Size:",
                size
            );

            console.log(
                "Price:",
                price
            );

            console.log(
                "Quantity:",
                quantity
            );


            // ==========================================
            // CHECK VARIANT / PRODUCT STOCK AVAILABILITY
            // ==========================================

            if (color) {
                const [varRows] = await connection.execute(
                    `
                    SELECT id, color, stock
                    FROM product_variants
                    WHERE product_id = ? AND LOWER(TRIM(color)) = LOWER(TRIM(?))
                    `,
                    [productId, color]
                );

                if (varRows.length > 0) {
                    const currentVariantStock = Number(varRows[0].stock) || 0;
                    if (currentVariantStock < quantity) {
                        await connection.rollback();
                        return res.status(400).json({
                            success: false,
                            message: `Sorry, ${productName} (${color}) is out of stock or does not have enough stock available.`
                        });
                    }
                }
            } else {
                const [prodRows] = await connection.execute(
                    `
                    SELECT id, name, stock
                    FROM products
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [productId]
                );

                if (prodRows.length > 0) {
                    const currentProdStock = Number(prodRows[0].stock) || 0;
                    if (currentProdStock < quantity) {
                        await connection.rollback();
                        return res.status(400).json({
                            success: false,
                            message: `Sorry, ${productName} is out of stock.`
                        });
                    }
                }
            }


            // ==========================================
            // INSERT ITEM
            // ==========================================

            await connection.execute(
                itemSql,
                [
                    orderId,
                    productId,
                    productName,
                    color,
                    size,
                    price,
                    quantity
                ]
            );


            // ==========================================
            // DEDUCT VARIANT STOCK
            // ==========================================

            if (color) {
                console.log(
                    `Deducting variant stock for Product ID ${productId}, Color ${color}, Quantity ${quantity}`
                );

                await connection.execute(
                    `
                    UPDATE product_variants
                    SET stock = GREATEST(0, stock - ?)
                    WHERE product_id = ? AND LOWER(TRIM(color)) = LOWER(TRIM(?))
                    `,
                    [quantity, productId, color]
                );
            }


            // ==========================================
            // DEDUCT MAIN PRODUCT STOCK
            // ==========================================

            console.log(
                `Deducting main product stock for Product ID ${productId}, Quantity ${quantity}`
            );

            await connection.execute(
                `
                UPDATE products
                SET stock = GREATEST(0, stock - ?)
                WHERE id = ?
                `,
                [quantity, productId]
            );

        }


        // ==========================================
        // INSERT PAYMENT RECORD
        // ==========================================
        try {
            const isCod = (paymentMethod && paymentMethod.toUpperCase() === "COD");
            const paymentStatus = isCod ? "Pending" : "Successful";
            const paymentCode = `PAY${1000 + orderId}`;
            const txnId = isCod ? null : `TXN_${Date.now()}_${orderId}`;

            await connection.execute(`
                INSERT INTO payments 
                (payment_id, order_id, customer_name, customer_email, customer_phone, amount, payment_method, status, transaction_id, payment_date, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, [
                paymentCode,
                orderId,
                customerName || "Customer",
                email || "customer@example.com",
                phone || "9876543210",
                parseFloat(total) || 0,
                isCod ? "COD" : "Online",
                paymentStatus,
                txnId
            ]);
            console.log("PAYMENT RECORD CREATED:", paymentCode);
        } catch (payErr) {
            console.error("Error creating payment record in transaction:", payErr);
        }


        // ==========================================
        // COMMIT TRANSACTION
        // ==========================================

        await connection.commit();

        try {
            const { notifyNewOrder } = require("./orderNotificationController");
            notifyNewOrder({
                order_id: orderId,
                customer_name: customerName,
                customer_email: email,
                customer_phone: phone,
                total_amount: total,
                items_count: Array.isArray(products) ? products.length : 1,
                payment_method: paymentMethod,
                payment_status: paymentMethod === "COD" ? "Pending" : "Paid",
                order_status: "pending"
            });
        } catch (notifErr) {
            console.error("Error triggering order notification:", notifErr);
        }

        console.log("");
        console.log(
            "================================="
        );

        console.log(
            "ORDER SAVED SUCCESSFULLY"
        );

        console.log(
            "ORDER ID:",
            orderId
        );

        console.log(
            "USER ID:",
            userId
        );

        console.log(
            "================================="
        );


        // ==========================================
        // SUCCESS RESPONSE
        // ==========================================

        return res.status(201).json({

            success: true,

            message:
                "Order placed successfully.",

            orderId:
                orderId,

            user_id:
                userId

        });

    }


    // ==========================================
    // ERROR
    // ==========================================

    catch (error) {

        console.error("");
        console.error(
            "================================="
        );

        console.error(
            "ORDER INSERT ERROR"
        );

        console.error(
            "================================="
        );

        console.error(
            "Message:",
            error.message
        );

        console.error(
            "Code:",
            error.code
        );

        console.error(
            "SQL State:",
            error.sqlState
        );


        // ==========================================
        // ROLLBACK
        // ==========================================

        if (connection) {

            try {

                await connection.rollback();

                console.log(
                    "Transaction rolled back."
                );

            }

            catch (rollbackError) {

                console.error(
                    "Rollback error:",
                    rollbackError.message
                );

            }

        }

        const isConnError = error.code === 'ECONNREFUSED' ||
            error.name === 'AggregateError' ||
            (error.errors && error.errors.some(e => e.code === 'ECONNREFUSED')) ||
            String(error).includes("ECONNREFUSED");

        if (isConnError) {
            console.log("ℹ️ [Offline Mode] Database offline. Saving order in mock storage.");
            const newOrderId = Math.floor(100000 + Math.random() * 900000);
            const b = req.body || {};
            const newOrder = {
                id: newOrderId,
                user_id: b.user_id || b.userId || 1,
                customer_name: b.customerName || b.customer_name || "Customer",
                email: b.email || "customer@example.com",
                phone: b.phone || "9999999999",
                address: b.address || "",
                city: b.city || "",
                state: b.state || "",
                pincode: b.pincode || "",
                payment_method: b.paymentMethod || "COD",
                subtotal: Number(b.subtotal) || 0,
                shipping: Number(b.shipping) || 0,
                total: Number(b.total) || 0,
                status: "pending",
                created_at: new Date().toISOString(),
                items: Array.isArray(b.products) ? b.products.map((p, i) => ({
                    id: i + 1,
                    order_id: newOrderId,
                    product_id: p.productId || p.id || 1,
                    product_name: p.name || "Product",
                    price: p.price || 0,
                    quantity: p.quantity || 1,
                    color: p.color || null,
                    size: p.size || null,
                    image: p.image || "/images/tshirt1.jpg"
                })) : []
            };
            offlineOrders.unshift(newOrder);

            return res.status(201).json({
                success: true,
                message: "Order placed successfully (Offline Mode).",
                orderId: newOrderId,
                order_id: newOrderId,
                id: newOrderId,
                user_id: newOrder.user_id,
                isOfflineMode: true
            });
        }

        return res.status(500).json({

            success: false,

            message:
                "Failed to save order.",

            error:
                error.message

        });

    }


    // ==========================================
    // RELEASE CONNECTION
    // ==========================================

    finally {

        if (connection) {

            connection.release();

        }

    }

};



// ==========================================
// GET ALL ORDERS - ADMIN
// GET /api/orders
// ==========================================

exports.getOrders = async (req, res) => {

    console.log("");
    console.log("=================================");
    console.log("GET ALL ORDERS - ADMIN");
    console.log("=================================");

    try {

        const [orders] =
            await db.execute(`
                SELECT
                    id,
                    user_id,
                    customer_name,
                    email,
                    phone,
                    address,
                    city,
                    state,
                    pincode,
                    payment_method,
                    subtotal,
                    shipping,
                    total,
                    status,
                    created_at
                FROM orders
                ORDER BY id DESC
            `);


        console.log(
            "Total Orders:",
            orders.length
        );

        for (const order of orders) {
            const [items] = await db.execute(
                `
                SELECT
                    oi.id,
                    oi.order_id,
                    oi.product_id,
                    oi.product_name,
                    oi.price,
                    oi.quantity,
                    oi.color,
                    oi.size,
                    p.name AS product_name_from_products,
                    p.image,
                    p.category,
                    pv.image AS variant_image
                FROM order_items oi
                LEFT JOIN products p
                ON oi.product_id = p.id
                LEFT JOIN product_variants pv
                ON oi.product_id = pv.product_id AND LOWER(TRIM(oi.color)) = LOWER(TRIM(pv.color))
                WHERE oi.order_id = ?
                GROUP BY oi.id
                ORDER BY oi.id ASC
                `,
                [order.id]
            );

            order.items = (items || []).map(function (item) {
                if (item.variant_image && item.variant_image !== "null" && String(item.variant_image).trim() !== "") {
                    item.image = item.variant_image;
                } else if (typeof item.image === "string" && item.image.trim().startsWith("[")) {
                    try {
                        const parsed = JSON.parse(item.image.trim());
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            item.image = parsed[0];
                        }
                    } catch (e) {}
                }
                return item;
            });
        }

        return res.status(200).json({

            success: true,

            count:
                orders.length,

            orders:
                orders

        });

    }


    catch (error) {

        const isConnError = error.code === 'ECONNREFUSED' ||
            error.name === 'AggregateError' ||
            (error.errors && error.errors.some(e => e.code === 'ECONNREFUSED')) ||
            String(error).includes("ECONNREFUSED");

        if (isConnError) {
            console.log("ℹ️ [Offline Mode] Serving offline orders list.");
            return res.status(200).json({
                success: true,
                count: offlineOrders.length,
                orders: offlineOrders,
                isOfflineMode: true
            });
        }

        console.error("GET ORDERS ERROR:", error);

        return res.status(500).json({

            success: false,

            message:
                "Failed to get orders.",

            error:
                error.message

        });

    }

};



// ==========================================
// GET USER ORDERS
// GET /api/orders/user?user_id=1
// ==========================================

exports.getUserOrders = async (req, res) => {

    try {

        const userId =
            req.query.user_id ||
            req.query.userId ||
            null;

        const email =
            req.query.email ||
            null;


        // ==========================================
        // CHECK USER ID / EMAIL
        // ==========================================

        if (!userId && !email) {

            return res.status(400).json({

                success: false,

                message:
                    "user_id is required."

            });

        }


        // ==========================================
        // GET USER ORDERS
        // ==========================================

        let orders;


        if (userId) {

            [orders] =
                await db.execute(
                    `
                    SELECT *
                    FROM orders
                    WHERE user_id = ?
                    ORDER BY created_at DESC
                    `,
                    [userId]
                );

        }

        else {

            [orders] =
                await db.execute(
                    `
                    SELECT *
                    FROM orders
                    WHERE email = ?
                    ORDER BY created_at DESC
                    `,
                    [email]
                );

        }

        // Attach ordered products to each order
        for (const order of orders) {
            const [items] = await db.execute(
                `
                SELECT
                    oi.id,
                    oi.order_id,
                    oi.product_id,
                    oi.product_name,
                    oi.price,
                    oi.quantity,
                    oi.color,
                    oi.size,
                    p.name AS product_name_from_products,
                    p.image,
                    p.category,
                    pv.image AS variant_image
                FROM order_items oi
                LEFT JOIN products p
                ON oi.product_id = p.id
                LEFT JOIN product_variants pv
                ON oi.product_id = pv.product_id AND LOWER(TRIM(oi.color)) = LOWER(TRIM(pv.color))
                WHERE oi.order_id = ?
                GROUP BY oi.id
                ORDER BY oi.id ASC
                `,
                [order.id]
            );

            order.items = (items || []).map(function (item) {
                if (item.variant_image && item.variant_image !== "null" && String(item.variant_image).trim() !== "") {
                    item.image = item.variant_image;
                } else if (typeof item.image === "string" && item.image.trim().startsWith("[")) {
                    try {
                        const parsed = JSON.parse(item.image.trim());
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            item.image = parsed[0];
                        }
                    } catch (e) {}
                }
                return item;
            });
        }


        return res.json({

            success: true,

            count:
                orders.length,

            orders:
                orders

        });

    }


    catch (error) {

        const isConnError = error.code === 'ECONNREFUSED' ||
            error.name === 'AggregateError' ||
            (error.errors && error.errors.some(e => e.code === 'ECONNREFUSED')) ||
            String(error).includes("ECONNREFUSED");

        if (isConnError) {
            console.log("ℹ️ [Offline Mode] Serving user offline orders.");
            return res.status(200).json({
                success: true,
                count: offlineOrders.length,
                orders: offlineOrders,
                isOfflineMode: true
            });
        }

        console.error(
            "Get User Orders Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load orders.",

            error:
                error.message

        });

    }

};



// ==========================================
// GET SINGLE ORDER - ADMIN
// GET /api/orders/:id
// ==========================================

exports.getOrderById = async (
    req,
    res
) => {

    console.log("");
    console.log("=================================");
    console.log("GET SINGLE ORDER");
    console.log("=================================");


    try {

        const orderId =
            Number(
                req.params.id
            );


        // ==========================================
        // VALIDATE ORDER ID
        // ==========================================

        if (
            !Number.isInteger(orderId) ||
            orderId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid order ID."

            });

        }


        // ==========================================
        // GET ORDER
        // ==========================================

        const [orders] =
            await db.execute(
                `
                SELECT *
                FROM orders
                WHERE id = ?
                `,
                [orderId]
            );


        if (
            orders.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Order not found."

            });

        }


        // ==========================================
        // GET ORDER ITEMS
        // ==========================================

        const [items] =
            await db.execute(
                `
                SELECT
                    oi.*,
                    p.name AS product_name_from_products,
                    p.image,
                    pv.image AS variant_image
                FROM order_items oi
                LEFT JOIN products p
                ON oi.product_id = p.id
                LEFT JOIN product_variants pv
                ON oi.product_id = pv.product_id AND LOWER(TRIM(oi.color)) = LOWER(TRIM(pv.color))
                WHERE oi.order_id = ?
                GROUP BY oi.id
                ORDER BY oi.id ASC
                `,
                [orderId]
            );

        const mappedItems = (items || []).map(function (item) {
            if (item.variant_image && item.variant_image !== "null" && String(item.variant_image).trim() !== "") {
                item.image = item.variant_image;
            } else if (typeof item.image === "string" && item.image.trim().startsWith("[")) {
                try {
                    const parsed = JSON.parse(item.image.trim());
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        item.image = parsed[0];
                    }
                } catch (e) {}
            }
            return item;
        });

        return res.json({

            success: true,

            order:
                orders[0],

            items:
                mappedItems

        });

    }


    catch (error) {

        console.error(
            "Get order error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to get order.",

            error:
                error.message

        });

    }

};



// ==========================================
// GET ORDER DETAILS - USER
// GET /api/orders/:id/details?user_id=1
// ==========================================

exports.getOrderDetails = async (
    req,
    res
) => {

    try {

        const orderId =
            Number(
                req.params.id
            );

        const userId =
            req.query.user_id ||
            req.query.userId;


        // ==========================================
        // VALIDATE ORDER ID
        // ==========================================

        if (
            !Number.isInteger(orderId) ||
            orderId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid order ID."

            });

        }


        // ==========================================
        // VALIDATE USER ID
        // ==========================================

        if (!userId) {

            return res.status(400).json({

                success: false,

                message:
                    "user_id is required."

            });

        }


        // ==========================================
        // GET ORDER
        // ==========================================

        const [orders] =
            await db.execute(
                `
                SELECT *
                FROM orders
                WHERE id = ?
                AND user_id = ?
                `,
                [
                    orderId,
                    userId
                ]
            );


        if (
            orders.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Order not found."

            });

        }


        // ==========================================
        // GET ORDER ITEMS
        // ==========================================

        const [items] =
            await db.execute(
                `
                SELECT
                    oi.*,
                    p.name,
                    p.image

                FROM order_items oi

                LEFT JOIN products p
                ON oi.product_id = p.id

                WHERE oi.order_id = ?

                ORDER BY oi.id ASC
                `,
                [orderId]
            );


        return res.json({

            success: true,

            order:
                orders[0],

            items:
                items

        });

    }


    catch (error) {

        console.error(
            "Get Order Details Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load order details.",

            error:
                error.message

        });

    }

};



// ==========================================
// UPDATE ORDER STATUS - ADMIN
// PUT /api/orders/:id
// ==========================================

exports.updateOrderStatus = async (
    req,
    res
) => {

    console.log("");
    console.log("=================================");
    console.log("UPDATE ORDER STATUS");
    console.log("=================================");


    try {

        const orderId =
            Number(
                req.params.id
            );


        const status =
            req.body.status;


        console.log(
            "Order ID:",
            orderId
        );

        console.log(
            "New Status:",
            status
        );


        // ==========================================
        // VALIDATE ORDER ID
        // ==========================================

        if (
            !Number.isInteger(orderId) ||
            orderId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid order ID."

            });

        }


        // ==========================================
        // ALLOWED STATUSES
        // ==========================================

        const allowedStatuses = [

            "Pending",
            "Confirmed",
            "Processing",
            "Shipped",
            "Delivered",
            "Completed",
            "Cancelled"

        ];


        if (
            !allowedStatuses.includes(status)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid order status."

            });

        }


        // ==========================================
        // CHECK ORDER EXISTS
        // ==========================================

        const [existingOrders] =
            await db.execute(
                `
                SELECT id
                FROM orders
                WHERE id = ?
                `,
                [orderId]
            );


        if (
            existingOrders.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Order not found."

            });

        }


        // ==========================================
        // UPDATE STATUS
        // ==========================================

        await db.execute(
            `
            UPDATE orders
            SET status = ?
            WHERE id = ?
            `,
            [
                status,
                orderId
            ]
        );

        // Synchronize payment status
        try {
            const st = status.toLowerCase();
            if (st === 'delivered' || st === 'completed') {
                await db.execute(`
                    UPDATE payments 
                    SET status = 'Successful', updated_at = NOW()
                    WHERE order_id = ? AND status = 'Pending'
                `, [orderId]);
            } else if (st === 'cancelled') {
                await db.execute(`
                    UPDATE payments 
                    SET status = CASE WHEN payment_method = 'COD' THEN 'Failed' ELSE 'Refunded' END,
                        failure_reason = 'Order cancelled',
                        updated_at = NOW()
                    WHERE order_id = ?
                `, [orderId]);
            }
        } catch (pSyncErr) {
            console.error("Error syncing payment status:", pSyncErr);
        }

        console.log(
            "Order status updated successfully."
        );


        return res.json({

            success: true,

            message:
                "Order status updated successfully.",

            orderId:
                orderId,

            status:
                status

        });

    }


    catch (error) {

        console.error(
            "Update order status error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to update order status.",

            error:
                error.message

        });

    }

};



// ==========================================
// CANCEL ORDER - USER
// PUT /api/orders/:id/cancel
// ==========================================

exports.cancelOrder = async (
    req,
    res
) => {

    try {

        const orderId =
            Number(
                req.params.id
            );


        const userId =
            req.body.user_id ||
            req.body.userId;


        // ==========================================
        // VALIDATE ORDER ID
        // ==========================================

        if (
            !Number.isInteger(orderId) ||
            orderId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid order ID."

            });

        }


        // ==========================================
        // VALIDATE USER ID
        // ==========================================

        if (!userId) {

            return res.status(400).json({

                success: false,

                message:
                    "user_id is required."

            });

        }


        // ==========================================
        // FIND USER ORDER
        // ==========================================

        const [orders] =
            await db.execute(
                `
                SELECT
                    id,
                    status
                FROM orders
                WHERE id = ?
                AND user_id = ?
                `,
                [
                    orderId,
                    userId
                ]
            );


        if (
            orders.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Order not found."

            });

        }


        // ==========================================
        // CURRENT STATUS
        // ==========================================

        const currentStatus =
            String(
                orders[0].status ||
                "Pending"
            ).toLowerCase();


        // ==========================================
        // CHECK STATUS
        // ==========================================

        if (
            currentStatus !== "pending" &&
            currentStatus !== "processing" &&
            currentStatus !== "confirmed"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "This order can no longer be cancelled."

            });

        }


        // ==========================================
        // UPDATE STATUS
        // ==========================================

        await db.execute(
            `
            UPDATE orders
            SET status = 'Cancelled'
            WHERE id = ?
            AND user_id = ?
            `,
            [
                orderId,
                userId
            ]
        );


        return res.json({

            success: true,

            message:
                "Order cancelled successfully."

        });

    }


    catch (error) {

        console.error(
            "Cancel Order Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to cancel order.",

            error:
                error.message

        });

    }

};



// ==========================================
// DELETE ORDER - ADMIN
// DELETE /api/orders/:id
// ==========================================

exports.deleteOrder = async (
    req,
    res
) => {

    try {

        const orderId =
            Number(
                req.params.id
            );


        // ==========================================
        // VALIDATE ORDER ID
        // ==========================================

        if (
            !Number.isInteger(orderId) ||
            orderId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid order ID."

            });

        }


        // ==========================================
        // DELETE ORDER ITEMS FIRST
        // ==========================================

        await db.execute(
            `
            DELETE FROM order_items
            WHERE order_id = ?
            `,
            [orderId]
        );


        // ==========================================
        // DELETE ORDER
        // ==========================================

        const [result] =
            await db.execute(
                `
                DELETE FROM orders
                WHERE id = ?
                `,
                [orderId]
            );


        if (
            result.affectedRows === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Order not found."

            });

        }


        return res.json({

            success: true,

            message:
                "Order deleted successfully."

        });

    }


    catch (error) {

        console.error(
            "Delete order error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to delete order.",

            error:
                error.message

        });

    }

};



// ==========================================
// CLEAR ALL ORDERS
// DELETE /api/orders/clear-all
// ==========================================

exports.clearAllOrders = async (req, res) => {

    try {

        const userId =
            req.body?.user_id ||
            req.query?.user_id ||
            null;

        console.log("CLEAR ALL ORDERS REQUEST, userId:", userId);

        if (userId) {

            const [userOrders] = await db.execute(
                `SELECT id FROM orders WHERE user_id = ?`,
                [userId]
            );

            if (userOrders.length > 0) {

                for (const o of userOrders) {

                    await db.execute(
                        `DELETE FROM order_items WHERE order_id = ?`,
                        [o.id]
                    );

                }

                await db.execute(
                    `DELETE FROM orders WHERE user_id = ?`,
                    [userId]
                );

            }

        } else {

            await db.execute(`DELETE FROM order_items`);
            await db.execute(`DELETE FROM orders`);

        }

        return res.json({

            success: true,

            message:
                "All orders cleared successfully."

        });

    }

    catch (error) {

        console.error(
            "Clear all orders error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to clear orders.",

            error:
                error.message

        });

    }

};