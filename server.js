// ==========================================
// LOAD ENVIRONMENT VARIABLES FIRST
// ==========================================
require("dotenv").config();

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const wishlistRoutes =  require("./routes/wishlistRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const variantRoutes = require("./routes/variantRoutes");
const stripeRoutes = require("./routes/stripeRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const reportRoutes = require("./routes/reportRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const shippingRoutes = require("./routes/shippingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");
const orderNotificationRoutes = require("./routes/orderNotificationRoutes");
// const orderRoutes = require("./routes/orderRoutes");


// ==========================================
// CREATE EXPRESS APP
// ==========================================

const app = express();


// ==========================================
// SERVER START CHECK
// ==========================================

console.log("");
console.log("=================================");
console.log("UPDATED SERVER.JS IS RUNNING");
console.log("SERVER FILE:");
console.log(__filename);
console.log("=================================");

// ==========================================
// ONE-TIME ORDER CLEANUP AS REQUESTED
// ==========================================
const fs = require("fs");
const orderCleanupFlag = path.join(__dirname, ".orders_cleared");
if (!fs.existsSync(orderCleanupFlag)) {
    (async () => {
        try {
            const db = require("./config/db");
            await db.execute("DELETE FROM order_items");
            await db.execute("DELETE FROM orders");
            fs.writeFileSync(orderCleanupFlag, new Date().toISOString());
            console.log("=================================");
            console.log("OLD ORDERS REMOVED AS REQUESTED");
            console.log("=================================");
        } catch (err) {
            console.error("Auto clear orders notice:", err.message);
        }
    })();
}


// ==========================================
// IMPORT ROUTES
// ==========================================

const adminRoutes =
    require("./routes/adminRoutes");

const productRoutes =
    require("./routes/productRoutes");

const userRoutes =
    require("./routes/userRoutes");

const orderRoutes =
    require("./routes/orderRoutes");


// ==========================================
// MIDDLEWARE
// ==========================================

// URL encoded data
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);


// JSON data
app.use(
    express.json()
);


// ==========================================
// STATIC PUBLIC FOLDER
// ==========================================

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);

app.use(
    "/public",
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);

// ==========================================
// STATIC VIEWS FOLDER
// ==========================================

app.use(
    express.static(
        path.join(
            __dirname,
            "views"
        )
    )
);

app.use(
    "/views",
    express.static(
        path.join(
            __dirname,
            "views"
        )
    )
);


// ==========================================
// API ROUTES
// ==========================================

app.use(
    "/api/admin",
    adminRoutes
);

app.use(
    "/api/products",
    productRoutes
);

app.use(
    "/api/users",
    userRoutes
);

app.use(
    "/api/orders",
    orderRoutes
);

app.use(
    "/api/wishlist",
    wishlistRoutes
);

app.use(
    "/api/reviews",
    reviewRoutes
);

app.use(
    "/api/variants",
    variantRoutes
);

app.use(
    "/api/stripe",
    stripeRoutes
);

app.use(
    "/api/banners",
    bannerRoutes
);

app.use(
    "/api/admin/reports",
    reportRoutes
);

app.use(
    "/api/admin/inventory",
    inventoryRoutes
);

app.use(
    "/api/shipments",
    shippingRoutes
);

app.use(
    "/api/payments",
    paymentRoutes
);

app.use(
    "/api/activity-logs",
    activityLogRoutes
);

app.use(
    "/api/order-notifications",
    orderNotificationRoutes
);

// ==========================================
// 24/7 CUSTOMER SUPPORT TICKET API
// ==========================================
app.post("/api/support", async (req, res) => {
    try {
        const { name, email, subject, order_id, message, user_id } = req.body || {};
        const ticketId = "SUP-" + Math.floor(100000 + Math.random() * 900000);

        console.log(`[CUSTOMER SUPPORT] Received Ticket #${ticketId}:`, {
            name: name || "Anonymous",
            email: email || "N/A",
            subject: subject || "General Inquiry",
            order_id: order_id || "N/A",
            message: message ? message.substring(0, 100) : "N/A"
        });

        // Optional log entry to database if table exists
        try {
            const db = require("./config/db");
            await db.execute(
                "INSERT INTO activity_logs (action, description, created_at) VALUES (?, ?, NOW())",
                ["SUPPORT_TICKET", `Customer Support Ticket #${ticketId} submitted by ${name || 'User'} (${email || 'No email'})`]
            );
        } catch (dbErr) {
            // activity_logs table might not exist or optional, proceed gracefully
        }

        return res.status(200).json({
            success: true,
            ticket_id: ticketId,
            message: "Your support request has been logged successfully. Our team will contact you shortly."
        });
    } catch (err) {
        console.error("Support API error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to submit support request"
        });
    }
});


// ==========================================
// AI GARMENT COLOR DETECTION API (GEMINI VISION)
// ==========================================

app.post("/api/ai/detect-color", async (req, res) => {
    try {
        const { image } = req.body || {};
        if (!image) {
            return res.status(400).json({ success: false, message: "Image data is required" });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.json({ success: false, message: "GEMINI_API_KEY not configured, using local AI model" });
        }

        let mimeType = "image/jpeg";
        let base64Data = image;

        if (typeof image === "string" && image.startsWith("data:")) {
            const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                mimeType = matches[1];
                base64Data = matches[2];
            }
        }

        const promptText = "You are a professional fashion color extraction AI. Look at this clothing product image and determine the exact primary color of the main garment (shirt/t-shirt/polo/hoodie/jacket/pants) worn by the person or displayed. Disregard the background completely (e.g. ignore sand, trees, sky, walls) and disregard model skin. If a shirt is white under sunlight, classify as White. If heather olive, classify as Green or Olive. Reply with strictly ONE word from this list: [Black, White, Blue, Red, Green, Grey, Brown, Yellow, Pink, Orange, Navy, Teal, Olive, Maroon, Beige, Purple].";

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: promptText },
                        { inline_data: { mime_type: mimeType, data: base64Data } }
                    ]
                }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 10
                }
            })
        });

        clearTimeout(timeout);

        if (!response.ok) {
            return res.json({ success: false, message: "Gemini API error, falling back to local AI" });
        }

        const result = await response.json();
        const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
        const cleanColor = rawText.replace(/[^a-zA-Z]/g, "").trim();

        const validColors = ["Black", "White", "Blue", "Red", "Green", "Grey", "Brown", "Yellow", "Pink", "Orange", "Navy", "Teal", "Olive", "Maroon", "Beige", "Purple"];
        const matched = validColors.find(c => c.toLowerCase() === cleanColor.toLowerCase());

        if (matched) {
            return res.json({ success: true, color: matched, source: "gemini-ai" });
        }

        return res.json({ success: false, message: "Unrecognized color from AI, falling back" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
});


// ==========================================
// WISHLIST PAGE
// ==========================================

app.get(
    [
        "/wishlist",
        "/wishlist.html",
        "/views/wishlist.html"
    ],
    (req, res) => {
        res.sendFile(
            path.join(
                __dirname,
                "views",
                "wishlist.html"
            )
        );
    }
);


// ==========================================
// ORDERS PAGE
// ==========================================

app.get(
    [
        "/orders",
        "/orders.html",
        "/views/orders.html"
    ],
    (req, res) => {
        res.sendFile(
            path.join(
                __dirname,
                "views",
                "orders.html"
            )
        );
    }
);


// ==========================================
// ORDER DETAILS PAGE
// ==========================================

app.get(
    [
        "/order-details",
        "/order-details.html",
        "/views/order-details.html"
    ],
    (req, res) => {
        res.sendFile(
            path.join(
                __dirname,
                "views",
                "order-details.html"
            )
        );
    }
);


// ==========================================
// HOME PAGE
// ==========================================

app.get(
    [
        "/",
        "/index",
        "/index.html",
        "/views/index.html",
        "/views/index"
    ],
    (req, res) => {
        res.sendFile(
            path.join(
                __dirname,
                "views",
                "index.html"
            )
        );
    }
);


// ==========================================
// PRODUCTS PAGE
// ==========================================

app.get(
    [
        "/products",
        "/products.html",
        "/views/products.html"
    ],
    (req, res) => {
        res.sendFile(
            path.join(
                __dirname,
                "views",
                "products.html"
            )
        );
    }
);


// ==========================================
// CATEGORY ROUTES
// ==========================================

app.get(
    "/t-shirts",
    (req, res) => {

        res.redirect(
            "/products.html?category=t-shirts"
        );

    }
);


app.get(
    "/shirts",
    (req, res) => {

        res.redirect(
            "/products.html?category=shirts"
        );

    }
);


app.get(
    "/jeans",
    (req, res) => {

        res.redirect(
            "/products.html?category=jeans"
        );

    }
);


app.get(
    "/pants",
    (req, res) => {

        res.redirect(
            "/products.html?category=pants"
        );

    }
);


app.get(
    "/jackets",
    (req, res) => {

        res.redirect(
            "/products.html?category=jackets"
        );

    }
);


app.get(
    "/hoodies",
    (req, res) => {

        res.redirect(
            "/products.html?category=hoodies"
        );

    }
);


app.get(
    "/shorts",
    (req, res) => {

        res.redirect(
            "/products.html?category=shorts"
        );

    }
);


app.get(
    "/shoes",
    (req, res) => {

        res.redirect(
            "/products.html?category=shoes"
        );

    }
);


app.get(
    "/accessories",
    (req, res) => {

        res.redirect(
            "/products.html?category=accessories"
        );

    }
);


// ==========================================
// CATEGORIES PAGE
// ==========================================

app.get(
    [
        "/categories",
        "/categories.html",
        "/views/categories.html",
        "/views/categories"
    ],
    (req, res) => {
        res.sendFile(
            path.join(
                __dirname,
                "views",
                "categories.html"
            )
        );
    }
);


// ==========================================
// CART PAGE
// ==========================================

app.get(
    [
        "/cart",
        "/cart.html",
        "/views/cart.html",
        "/views/cart"
    ],
    (req, res) => {
        res.sendFile(
            path.join(
                __dirname,
                "views",
                "cart.html"
            )
        );
    }
);


// ==========================================
// CHECKOUT PAGE
// ==========================================

app.get(
    ["/checkout", "/checkout.html", "/views/checkout.html", "/views/checkout"],
    (req, res) => {
        res.sendFile(
            path.join(
                __dirname,
                "views",
                "checkout.html"
            )
        );
    }
);


// ==========================================
// PAYMENT SUCCESS PAGE
// ==========================================

app.get(
    ["/payment-success", "/payment-success.html", "/views/payment-success.html"],
    (req, res) => {
        res.sendFile(
            path.join(
                __dirname,
                "views",
                "payment-success.html"
            )
        );
    }
);


// ==========================================
// LOGIN PAGE
// ==========================================

app.get(
    [
        "/login",
        "/login.html",
        "/views/login.html",
        "/views/login"
    ],
    (req, res) => {
        res.sendFile(
            path.join(
                __dirname,
                "views",
                "login.html"
            )
        );
    }
);


// ==========================================
// REGISTER PAGE
// ==========================================

app.get(
    [
        "/register",
        "/register.html",
        "/views/register.html",
        "/views/register"
    ],
    (req, res) => {
        res.sendFile(
            path.join(
                __dirname,
                "views",
                "register.html"
            )
        );
    }
);


// ==========================================
// PRODUCT DETAILS PAGE
// ==========================================

app.get(
    [
        "/product-details",
        "/product-details.html",
        "/views/product-details.html",
        "/views/product-details"
    ],
    (req, res) => {
        res.sendFile(
            path.join(
                __dirname,
                "views",
                "product-details.html"
            )
        );
    }
);


app.get(
    "/product-details",
    (req, res) => {

        res.redirect(
            "/product-details.html"
        );

    }
);


// ==========================================
// ORDER SUCCESS PAGE
// ==========================================

app.get(
    "/order-success",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "views",
                "order-success.html"
            )
        );

    }
);


app.get(
    "/order-success.html",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "views",
                "order-success.html"
            )
        );

    }
);


// ==========================================
// ADMIN DASHBOARD
// ==========================================

app.get(
    [
        "/admin/dashboard",
        "/admin/dashboard.html"
    ],
    (req, res) => {

        console.log(
            "ADMIN DASHBOARD REQUESTED"
        );

        res.sendFile(
            path.join(
                __dirname,
                "views",
                "admin",
                "dashboard.html"
            )
        );

    }
);


// ==========================================
// ADMIN PRODUCTS
// ==========================================

app.get(
    [
        "/admin/products",
        "/admin/products.html"
    ],
    (req, res) => {

        console.log(
            "ADMIN PRODUCTS REQUESTED"
        );

        res.sendFile(
            path.join(
                __dirname,
                "views",
                "admin",
                "products.html"
            )
        );

    }
);


// ==========================================
// ADMIN PRODUCTS CATEGORIES
// ==========================================

app.get(
    [
        "/admin/products/categories",
        "/admin/products/categories.html"
    ],
    (req, res) => {

        console.log(
            "ADMIN PRODUCTS CATEGORIES REQUESTED"
        );

        res.sendFile(
            path.join(
                __dirname,
                "views",
                "admin",
                "products",
                "categories.html"
            )
        );

    }
);


app.get(
    "/admin/products/categories.css",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "views",
                "admin",
                "products",
                "categories.css"
            )
        );

    }
);


app.get(
    "/admin/products/categories.js",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "views",
                "admin",
                "products",
                "categories.js"
            )
        );

    }
);


// ==========================================
// ADMIN ORDERS
// ==========================================

app.get(
    [
        "/admin/orders",
        "/admin/orders.html"
    ],
    (req, res) => {
        res.redirect("/admin/shipping.html");
    }
);


// ==========================================
// ADMIN USERS
// ==========================================

app.get(
    [
        "/admin/users",
        "/admin/users.html"
    ],
    (req, res) => {

        console.log(
            "ADMIN USERS REQUESTED"
        );

        res.sendFile(
            path.join(
                __dirname,
                "views",
                "admin",
                "users.html"
            )
        );

    }
);


// ==========================================
// ADMIN BANNERS
// ==========================================

app.get(
    [
        "/admin/banners",
        "/admin/banners.html"
    ],
    (req, res) => {
        console.log("ADMIN BANNERS REQUESTED");
        res.sendFile(
            path.join(
                __dirname,
                "views",
                "admin",
                "banners.html"
            )
        );
    }
);


// ==========================================
// ADMIN REPORTS & ANALYTICS
// ==========================================

app.get(
    [
        "/admin/reports",
        "/admin/reports.html"
    ],
    (req, res) => {
        console.log("ADMIN REPORTS REQUESTED");
        res.sendFile(
            path.join(
                __dirname,
                "views",
                "admin",
                "reports.html"
            )
        );
    }
);


// ==========================================
// ADMIN INVENTORY MANAGEMENT
// ==========================================

app.get(
    [
        "/admin/inventory",
        "/admin/inventory.html"
    ],
    (req, res) => {
        console.log("ADMIN INVENTORY REQUESTED");
        res.sendFile(
            path.join(
                __dirname,
                "views",
                "admin",
                "inventory.html"
            )
        );
    }
);


// ==========================================
// ADMIN SHIPPING MODULE
// ==========================================

app.get(
    ["/admin/shipping", "/admin/shipping.html"],
    (req, res) => {
        console.log("ADMIN SHIPPING REQUESTED");
        res.sendFile(path.join(__dirname, "views", "admin", "shipping.html"));
    }
);

app.get(
    ["/admin/shipping-settings", "/admin/shipping-settings.html"],
    (req, res) => {
        res.sendFile(path.join(__dirname, "views", "admin", "shipping-settings.html"));
    }
);

app.get(
    ["/admin/create-shipment", "/admin/create-shipment.html"],
    (req, res) => {
        res.sendFile(path.join(__dirname, "views", "admin", "create-shipment.html"));
    }
);

app.get(
    ["/admin/shipment-detail", "/admin/shipment-detail.html"],
    (req, res) => {
        res.sendFile(path.join(__dirname, "views", "admin", "shipment-detail.html"));
    }
);


// ==========================================
// ADMIN PAYMENTS & REFUNDS
// ==========================================

app.get(
    ["/admin/payments", "/admin/payments.html"],
    (req, res) => {
        console.log("ADMIN PAYMENTS REQUESTED");
        res.sendFile(path.join(__dirname, "views", "admin", "payments.html"));
    }
);

// ==========================================
// ADMIN ACTIVITY LOGS
// ==========================================
app.get(
    ["/admin/activity-logs", "/admin/activity-logs.html"],
    (req, res) => {
        res.sendFile(path.join(__dirname, "views", "admin", "activity-logs.html"));
    }
);

// ==========================================
// ADMIN ORDER NOTIFICATIONS
// ==========================================
app.get(
    ["/admin/order-notifications", "/admin/order-notifications.html"],
    (req, res) => {
        res.sendFile(path.join(__dirname, "views", "admin", "order-notifications.html"));
    }
);


// ==========================================
// ADMIN SETTINGS
// ==========================================
// IMPORTANT:
// Your file is:
// views/admin/settings.html
// ==========================================

app.get(
    [
        "/admin/settings",
        "/admin/settings.html"
    ],
    (req, res) => {

        console.log("");
        console.log("=================================");
        console.log("ADMIN SETTINGS ROUTE HIT");
        console.log("=================================");

        res.sendFile(
            path.join(
                __dirname,
                "views",
                "admin",
                "settings.html"
            )
        );

    }
);


// ==========================================
// TEST SETTINGS ROUTE
// ==========================================
// Temporary test route
// ==========================================

app.get(
    "/test-settings",
    (req, res) => {

        res.send(
            "SETTINGS ROUTE IS WORKING"
        );

    }
);


const placeholderHandler = (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "images",
            "product-placeholder.jpg"
        )
    );
};

app.get("/images/placeholder.jpg", placeholderHandler);
app.get("/images/product-placeholder.jpg", placeholderHandler);
app.get("/placeholder.jpg", placeholderHandler);
app.get("/product-placeholder.jpg", placeholderHandler);
app.get("/admin/placeholder.jpg", placeholderHandler);
app.get("/admin/product-placeholder.jpg", placeholderHandler);
app.get("/admin/images/placeholder.jpg", placeholderHandler);
app.get("/admin/images/product-placeholder.jpg", placeholderHandler);


// ==========================================
// 404 ROUTE
// ==========================================
// IMPORTANT:
// This MUST be at the very bottom,
// after all routes.
// ==========================================

app.use(
    (req, res) => {

        console.log("");
        console.log("=================================");
        console.log("404 ROUTE NOT FOUND");
        console.log("=================================");
        console.log(
            "Method:",
            req.method
        );
        console.log(
            "URL:",
            req.originalUrl
        );

        res.status(404).json({

            success: false,

            message: "Route not found",

            path: req.originalUrl

        });

    }
);


// ==========================================
// START SERVER
// ==========================================

const PORT =
    process.env.PORT || 5000;


app.listen(
    PORT,
    () => {

        console.log("");
        console.log("=================================");
        console.log(
            `Server running at http://localhost:${PORT}`
        );
        console.log("=================================");

    }
);
