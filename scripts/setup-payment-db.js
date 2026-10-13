const db = require("../config/db");

async function setupPaymentTables() {
    try {
        console.log("Setting up payments & refunds tables...");

        await db.query(`
            CREATE TABLE IF NOT EXISTS payments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                payment_id VARCHAR(50) UNIQUE NOT NULL,
                order_id INT NOT NULL,
                customer_name VARCHAR(255),
                customer_email VARCHAR(255),
                customer_phone VARCHAR(50),
                amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                payment_method ENUM('Online', 'COD', 'Card', 'UPI', 'NetBanking') DEFAULT 'Online',
                status ENUM('Successful', 'Pending', 'Failed', 'Refunded') DEFAULT 'Pending',
                transaction_id VARCHAR(100) NULL,
                failure_reason VARCHAR(255) NULL,
                payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX (order_id),
                INDEX (payment_id),
                INDEX (status),
                INDEX (payment_method)
            )
        `);
        console.log("✓ payments table OK");

        await db.query(`
            CREATE TABLE IF NOT EXISTS refunds (
                id INT AUTO_INCREMENT PRIMARY KEY,
                refund_id VARCHAR(50) UNIQUE NOT NULL,
                payment_id VARCHAR(50) NULL,
                order_id INT NOT NULL,
                customer_name VARCHAR(255),
                amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                reason TEXT NULL,
                status ENUM('Pending', 'Processing', 'Completed', 'Rejected') DEFAULT 'Pending',
                approved_at TIMESTAMP NULL,
                completed_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX (order_id),
                INDEX (refund_id),
                INDEX (status)
            )
        `);
        console.log("✓ refunds table OK");

        // Seed payments for existing orders if none exist
        const [existingPayments] = await db.query("SELECT COUNT(*) as cnt FROM payments");
        if (existingPayments[0].cnt === 0) {
            const [orders] = await db.query("SELECT * FROM orders ORDER BY id ASC");
            console.log(`Seeding payments from ${orders.length} existing orders...`);
            for (const order of orders) {
                const payCode = `PAY${1000 + order.id}`;
                const method = (order.payment_method && order.payment_method.toUpperCase() === 'COD') ? 'COD' : 'Online';
                let status = 'Successful';
                let txn = `TXN_${Date.now()}_${order.id}`;
                let failReason = null;

                if (order.status && order.status.toLowerCase() === 'cancelled') {
                    // Make some failed or pending
                    if (order.id % 2 === 0) {
                        status = 'Failed';
                        txn = null;
                        failReason = 'Customer bank server timeout / Payment aborted';
                    } else {
                        status = 'Refunded';
                    }
                } else if (method === 'COD') {
                    if (order.status && order.status.toLowerCase() === 'delivered') {
                        status = 'Successful';
                    } else {
                        status = 'Pending';
                    }
                }

                await db.query(`
                    INSERT IGNORE INTO payments 
                    (payment_id, order_id, customer_name, customer_email, customer_phone, amount, payment_method, status, transaction_id, failure_reason, payment_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    payCode,
                    order.id,
                    order.customer_name || 'Customer',
                    order.email || 'customer@example.com',
                    order.phone || '9876543210',
                    parseFloat(order.total || order.total_amount || 0),
                    method,
                    status,
                    txn,
                    failReason,
                    order.created_at || new Date()
                ]);

                // If refunded or cancelled, create a refund entry
                if (status === 'Refunded' || (order.status && order.status.toLowerCase() === 'cancelled' && method === 'Online' && status !== 'Failed')) {
                    const refCode = `REF${2000 + order.id}`;
                    await db.query(`
                        INSERT IGNORE INTO refunds
                        (refund_id, payment_id, order_id, customer_name, amount, reason, status, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        refCode,
                        payCode,
                        order.id,
                        order.customer_name || 'Customer',
                        parseFloat(order.total || 0),
                        'Order cancelled / product return requested',
                        status === 'Refunded' ? 'Completed' : 'Pending',
                        order.created_at || new Date()
                    ]);
                }
            }
            console.log("✓ Seeded payments and sample refunds successfully.");
        }

        console.log("✅ ALL PAYMENT TABLES AND DATA READY");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error setting up payments DB:", err);
        process.exit(1);
    }
}

setupPaymentTables();
