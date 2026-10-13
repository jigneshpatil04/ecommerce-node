// ==========================================
// BANNER CONTROLLER
// Handles Homepage & Promotional Banners
// ==========================================

const db = require("../config/db");
const fs = require("fs");
const path = require("path");

// ==========================================
// INITIALIZE BANNER TABLE & SEED IF EMPTY
// ==========================================
let isTableInitialized = false;

async function initBannerTable() {
    if (isTableInitialized) return;
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS banners (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                subtitle TEXT NULL,
                badge VARCHAR(100) NULL,
                image VARCHAR(255) NOT NULL,
                link VARCHAR(255) NULL,
                button_text VARCHAR(100) DEFAULT 'EXPLORE COLLECTION',
                secondary_link VARCHAR(255) NULL,
                secondary_button_text VARCHAR(100) NULL,
                position VARCHAR(50) DEFAULT 'hero',
                start_date DATETIME NULL,
                end_date DATETIME NULL,
                status ENUM('active', 'inactive') DEFAULT 'active',
                display_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Check if table is empty
        const [rows] = await db.execute("SELECT COUNT(*) AS total FROM banners");
        if (rows[0].total === 0) {
            // Seed initial hero and promotional banners
            await db.execute(`
                INSERT INTO banners 
                (title, subtitle, badge, image, link, button_text, secondary_link, secondary_button_text, position, status, display_order)
                VALUES 
                (
                    'DEFINE YOUR STYLE',
                    'Discover luxury tailored cuts, bespoke textures, and statement modern silhouettes designed to command every room.',
                    'SPRING / SUMMER 2025',
                    '/images/jacket1.jpg',
                    '/products.html',
                    'EXPLORE COLLECTION',
                    '#trending-section',
                    'VIEW TRENDING PICKS',
                    'hero',
                    'active',
                    1
                ),
                (
                    'CRAFTED FOR DISTINCTION',
                    'Impeccably tailored Egyptian cotton, crisp spread collars, and timeless executive elegance built for leaders.',
                    'ATELIER EXCLUSIVE',
                    '/images/shirt2.jpg',
                    '/products.html?category=shirts',
                    'SHOP FORMALWEAR',
                    '/products.html',
                    'NEW ARRIVALS',
                    'hero',
                    'active',
                    2
                ),
                (
                    'UNAPOLOGETICALLY BOLD',
                    'Heavyweight vintage washes, drop-shoulder comfort, and modern relaxed denim for fearless street styling.',
                    'STREET CULTURE',
                    '/images/tshirt1.jpg',
                    '/products.html?category=t-shirts',
                    'SHOP STREETWEAR',
                    '/products.html',
                    'EXPLORE ALL',
                    'hero',
                    'active',
                    3
                ),
                (
                    'SPECIAL OFFER — 40% OFF',
                    'Refresh your capsule with our signature luxury designer drops. Use your exclusive seasonal discount code at checkout before midnight!',
                    'LIMITED TIME EVENT',
                    '/images/jacket2.jpg',
                    '/products.html',
                    'SHOP 40% OFF NOW',
                    null,
                    null,
                    'promo',
                    'active',
                    4
                )
            `);
            console.log("✅ Seeded initial banners table");
        }

        isTableInitialized = true;
    } catch (err) {
        console.error("Banner Table Init Warning:", err.message);
    }
}

// Ensure table exists on module load
initBannerTable();

// ==========================================
// HELPER: CALCULATE BANNER SCHEDULE STATUS
// ==========================================
function computeScheduleStatus(banner) {
    if (banner.status === "inactive") {
        return "hidden";
    }
    const now = new Date();
    if (banner.start_date) {
        const start = new Date(banner.start_date);
        if (now < start) {
            return "scheduled";
        }
    }
    if (banner.end_date) {
        const end = new Date(banner.end_date);
        if (now > end) {
            return "expired";
        }
    }
    return "active";
}

// ==========================================
// 1. GET PUBLIC ACTIVE BANNERS (FOR USER SIDE)
// GET /api/banners
// Filters: active, start_date <= now, end_date >= now
// ==========================================
exports.getPublicBanners = async (req, res) => {
    try {
        await initBannerTable();
        const { position } = req.query;

        const now = new Date();
        let query = `
            SELECT * FROM banners 
            WHERE status = 'active'
              AND (start_date IS NULL OR start_date <= ?)
              AND (end_date IS NULL OR end_date >= ?)
        `;
        const params = [now, now];

        if (position) {
            query += " AND position = ?";
            params.push(position);
        }

        query += " ORDER BY display_order ASC, id ASC";

        const [banners] = await db.execute(query, params);

        return res.json({
            success: true,
            count: banners.length,
            banners
        });
    } catch (error) {
        if (error.code === 'ECONNREFUSED' || error.name === 'AggregateError' || (error.errors && error.errors.some(e => e.code === 'ECONNREFUSED')) || String(error).includes("ECONNREFUSED")) {
            return res.json({
                success: true,
                count: 0,
                banners: []
            });
        }
        console.error("getPublicBanners error:", error.message || error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch banners",
            error: error.message
        });
    }
};

// ==========================================
// 2. GET ALL BANNERS (FOR ADMIN SIDE)
// GET /api/banners/admin
// ==========================================
exports.getAdminBanners = async (req, res) => {
    try {
        await initBannerTable();
        const { position, status } = req.query;

        let query = "SELECT * FROM banners WHERE 1=1";
        const params = [];

        if (position) {
            query += " AND position = ?";
            params.push(position);
        }
        if (status) {
            query += " AND status = ?";
            params.push(status);
        }

        query += " ORDER BY display_order ASC, id DESC";

        const [rawBanners] = await db.execute(query, params);

        // Augment banners with computed schedule status
        const banners = rawBanners.map(b => ({
            ...b,
            schedule_status: computeScheduleStatus(b)
        }));

        // Compute summary counts
        const stats = {
            total: banners.length,
            active: banners.filter(b => b.schedule_status === "active").length,
            scheduled: banners.filter(b => b.schedule_status === "scheduled").length,
            expired: banners.filter(b => b.schedule_status === "expired").length,
            hidden: banners.filter(b => b.schedule_status === "hidden").length
        };

        return res.json({
            success: true,
            stats,
            banners
        });
    } catch (error) {
        console.error("getAdminBanners error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch admin banners",
            error: error.message
        });
    }
};

// ==========================================
// 3. GET SINGLE BANNER
// GET /api/banners/:id
// ==========================================
exports.getBannerById = async (req, res) => {
    try {
        await initBannerTable();
        const { id } = req.params;
        const [rows] = await db.execute("SELECT * FROM banners WHERE id = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Banner not found"
            });
        }

        const banner = rows[0];
        banner.schedule_status = computeScheduleStatus(banner);

        return res.json({
            success: true,
            banner
        });
    } catch (error) {
        console.error("getBannerById error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch banner",
            error: error.message
        });
    }
};

// ==========================================
// 4. CREATE NEW BANNER
// POST /api/banners
// ==========================================
exports.createBanner = async (req, res) => {
    try {
        await initBannerTable();

        const {
            title,
            subtitle,
            badge,
            link,
            button_text,
            secondary_link,
            secondary_button_text,
            position = "hero",
            start_date,
            end_date,
            status = "active",
            display_order = 0,
            imageUrl
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Banner title is required"
            });
        }

        // Determine image path from uploaded file or provided URL
        let finalImage = "";
        if (req.file) {
            finalImage = `/images/${req.file.filename}`;
        } else if (imageUrl && imageUrl.trim()) {
            finalImage = imageUrl.trim();
        } else {
            return res.status(400).json({
                success: false,
                message: "Please upload an image or provide an image URL"
            });
        }

        // Format dates or NULL
        const startDateFormatted = start_date && start_date.trim() ? new Date(start_date) : null;
        const endDateFormatted = end_date && end_date.trim() ? new Date(end_date) : null;

        const [result] = await db.execute(`
            INSERT INTO banners (
                title, subtitle, badge, image, link, button_text,
                secondary_link, secondary_button_text, position,
                start_date, end_date, status, display_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            title.trim(),
            subtitle ? subtitle.trim() : null,
            badge ? badge.trim() : null,
            finalImage,
            link ? link.trim() : null,
            button_text ? button_text.trim() : "EXPLORE COLLECTION",
            secondary_link ? secondary_link.trim() : null,
            secondary_button_text ? secondary_button_text.trim() : null,
            position || "hero",
            startDateFormatted,
            endDateFormatted,
            status === "inactive" ? "inactive" : "active",
            parseInt(display_order, 10) || 0
        ]);

        return res.status(201).json({
            success: true,
            message: "Banner created successfully! 🎉",
            bannerId: result.insertId
        });
    } catch (error) {
        console.error("createBanner error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create banner",
            error: error.message
        });
    }
};

// ==========================================
// 5. UPDATE EXISTING BANNER
// PUT /api/banners/:id
// ==========================================
exports.updateBanner = async (req, res) => {
    try {
        await initBannerTable();
        const { id } = req.params;

        const [existing] = await db.execute("SELECT * FROM banners WHERE id = ?", [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Banner not found"
            });
        }

        const current = existing[0];

        const {
            title,
            subtitle,
            badge,
            link,
            button_text,
            secondary_link,
            secondary_button_text,
            position,
            start_date,
            end_date,
            status,
            display_order,
            imageUrl
        } = req.body;

        // Determine image
        let finalImage = current.image;
        if (req.file) {
            finalImage = `/images/${req.file.filename}`;
        } else if (imageUrl && imageUrl.trim()) {
            finalImage = imageUrl.trim();
        }

        const startDateFormatted = (start_date !== undefined)
            ? (start_date && start_date.trim() ? new Date(start_date) : null)
            : current.start_date;

        const endDateFormatted = (end_date !== undefined)
            ? (end_date && end_date.trim() ? new Date(end_date) : null)
            : current.end_date;

        await db.execute(`
            UPDATE banners SET
                title = ?,
                subtitle = ?,
                badge = ?,
                image = ?,
                link = ?,
                button_text = ?,
                secondary_link = ?,
                secondary_button_text = ?,
                position = ?,
                start_date = ?,
                end_date = ?,
                status = ?,
                display_order = ?
            WHERE id = ?
        `, [
            title !== undefined ? title.trim() : current.title,
            subtitle !== undefined ? (subtitle ? subtitle.trim() : null) : current.subtitle,
            badge !== undefined ? (badge ? badge.trim() : null) : current.badge,
            finalImage,
            link !== undefined ? (link ? link.trim() : null) : current.link,
            button_text !== undefined ? (button_text ? button_text.trim() : "EXPLORE COLLECTION") : current.button_text,
            secondary_link !== undefined ? (secondary_link ? secondary_link.trim() : null) : current.secondary_link,
            secondary_button_text !== undefined ? (secondary_button_text ? secondary_button_text.trim() : null) : current.secondary_button_text,
            position !== undefined ? position : current.position,
            startDateFormatted,
            endDateFormatted,
            status !== undefined ? (status === "inactive" ? "inactive" : "active") : current.status,
            display_order !== undefined ? (parseInt(display_order, 10) || 0) : current.display_order,
            id
        ]);

        return res.json({
            success: true,
            message: "Banner updated successfully! 🚀"
        });
    } catch (error) {
        console.error("updateBanner error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update banner",
            error: error.message
        });
    }
};

// ==========================================
// 6. TOGGLE BANNER STATUS (SHOW / HIDE)
// PATCH /api/banners/:id/status
// ==========================================
exports.toggleBannerStatus = async (req, res) => {
    try {
        await initBannerTable();
        const { id } = req.params;

        const [rows] = await db.execute("SELECT id, status FROM banners WHERE id = ?", [id]);
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Banner not found"
            });
        }

        const newStatus = rows[0].status === "active" ? "inactive" : "active";

        await db.execute("UPDATE banners SET status = ? WHERE id = ?", [newStatus, id]);

        return res.json({
            success: true,
            message: `Banner is now ${newStatus === "active" ? "visible (Shown)" : "hidden"}!`,
            newStatus
        });
    } catch (error) {
        console.error("toggleBannerStatus error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to toggle banner status",
            error: error.message
        });
    }
};

// ==========================================
// 7. DELETE BANNER
// DELETE /api/banners/:id
// ==========================================
exports.deleteBanner = async (req, res) => {
    try {
        await initBannerTable();
        const { id } = req.params;

        const [rows] = await db.execute("SELECT * FROM banners WHERE id = ?", [id]);
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Banner not found"
            });
        }

        const banner = rows[0];

        // Delete from database
        await db.execute("DELETE FROM banners WHERE id = ?", [id]);

        // If banner was an uploaded file (e.g. /images/1790848...jpg), attempt safe cleanup
        if (banner.image && banner.image.startsWith("/images/") && !banner.image.includes("jacket1") && !banner.image.includes("shirt2") && !banner.image.includes("tshirt1")) {
            const fileName = banner.image.replace("/images/", "");
            const filePath = path.join(__dirname, "../public/images", fileName);
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (e) {
                    // Ignore file delete errors
                }
            }
        }

        return res.json({
            success: true,
            message: "Banner deleted successfully! 🗑️"
        });
    } catch (error) {
        console.error("deleteBanner error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete banner",
            error: error.message
        });
    }
};
