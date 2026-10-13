const db = require("../config/db");

// ==========================================
// GET ALL PRODUCTS
// ==========================================

const getAllProducts = async () => {

    const [rows] = await db.query(
        "SELECT * FROM products"
    );

    return rows;
};


// ==========================================
// GET PRODUCT BY ID
// ==========================================

const getProductById = async (id) => {

    const [rows] = await db.query(
        "SELECT * FROM products WHERE id = ?",
        [id]
    );

    return rows[0];
};


// ==========================================
// CREATE PRODUCT
// ==========================================

const createProduct = async (product) => {

    const sql = `
        INSERT INTO products
        (
            name,
            description,
            price,
            category,
            image,
            stock
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
        product.name,
        product.description,
        product.price,
        product.category,
        product.image,
        product.stock
    ];

    const [result] = await db.query(
        sql,
        values
    );

    return result;
};


// ==========================================
// UPDATE PRODUCT
// ==========================================

const updateProduct = async (id, product) => {

    const sql = `
        UPDATE products
        SET
            name = ?,
            description = ?,
            price = ?,
            category = ?,
            image = ?,
            stock = ?
        WHERE id = ?
    `;

    const values = [
        product.name,
        product.description,
        product.price,
        product.category,
        product.image,
        product.stock,
        id
    ];

    const [result] = await db.query(
        sql,
        values
    );

    return result;
};


// ==========================================
// DELETE PRODUCT
// ==========================================

const deleteProduct = async (id) => {

    const sql =
        "DELETE FROM products WHERE id = ?";

    const [result] = await db.query(
        sql,
        [id]
    );

    return result;
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};