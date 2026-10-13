const db = require("../config/db");

async function setupShippingTables() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS shipments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                customer_name VARCHAR(255),
                address TEXT,
                phone VARCHAR(20),
                courier_name VARCHAR(100),
                tracking_number VARCHAR(100),
                shipping_date DATE,
                expected_delivery DATE,
                delivery_date DATE,
                shipping_status ENUM('Pending','Processing','Shipped','In_Transit','Delivered') DEFAULT 'Pending',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log("✓ shipments table OK");

        await db.query(`
            CREATE TABLE IF NOT EXISTS shipping_settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                standard_price DECIMAL(10,2) DEFAULT 50.00,
                free_above DECIMAL(10,2) DEFAULT 999.00,
                delivery_time_min INT DEFAULT 3,
                delivery_time_max INT DEFAULT 7,
                enabled TINYINT(1) DEFAULT 1,
                cod_available TINYINT(1) DEFAULT 1,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log("✓ shipping_settings table OK");

        await db.query(`INSERT IGNORE INTO shipping_settings (id) VALUES (1)`);
        console.log("✓ shipping_settings default row OK");

        await db.query(`
            CREATE TABLE IF NOT EXISTS shipping_zones (
                id INT AUTO_INCREMENT PRIMARY KEY,
                region_name VARCHAR(100) NOT NULL,
                price DECIMAL(10,2) DEFAULT 50.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✓ shipping_zones table OK");

        await db.query(`
            INSERT IGNORE INTO shipping_zones (id, region_name, price) VALUES
            (1,'Maharashtra',50.00),
            (2,'Gujarat',50.00),
            (3,'Delhi',70.00),
            (4,'Other States',100.00)
        `);
        console.log("✓ shipping_zones defaults OK");

        await db.query(`
            CREATE TABLE IF NOT EXISTS shipping_notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                order_id INT,
                message TEXT,
                is_read TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✓ shipping_notifications table OK");

        console.log("\n✅ ALL SHIPPING TABLES CREATED SUCCESSFULLY");
        process.exit(0);
    } catch (err) {
        console.error("❌ DB ERROR:", err.message);
        process.exit(1);
    }
}

setupShippingTables();
