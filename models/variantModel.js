const db = require("../config/db");


// CREATE

exports.createVariant = async (data) => {

    const sql = `
        INSERT INTO product_variants
        (
            product_id,
            size,
            color,
            extra_price,
            stock,
            image
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] =
        await db.execute(
            sql,
            [
                data.product_id,
                data.size,
                data.color,
                data.extra_price || 0,
                data.stock || 0,
                data.image || null
            ]
        );

    return result;
};


// GET PRODUCT VARIANTS

exports.getByProductId = async (
    productId
) => {

    const sql = `
        SELECT
            id,
            product_id,
            size,
            color,
            extra_price,
            stock,
            image,
            created_at
        FROM product_variants
        WHERE product_id = ?
        ORDER BY
            FIELD(
                size,
                'S',
                'M',
                'L',
                'XL',
                'XXL'
            ),
            color
    `;

    const [rows] =
        await db.execute(
            sql,
            [productId]
        );

    return rows;
};


// GET SINGLE

exports.getById = async (
    id
) => {

    const sql = `
        SELECT
            v.*,
            p.name AS product_name,
            p.price AS base_price
        FROM product_variants v
        JOIN products p
            ON p.id = v.product_id
        WHERE v.id = ?
    `;

    const [rows] =
        await db.execute(
            sql,
            [id]
        );

    return rows[0];
};


// UPDATE

exports.update = async (
    id,
    data
) => {

    const sql = `
        UPDATE product_variants
        SET
            size = ?,
            color = ?,
            extra_price = ?,
            stock = ?,
            image = ?
        WHERE id = ?
    `;

    const [result] =
        await db.execute(
            sql,
            [
                data.size,
                data.color,
                data.extra_price || 0,
                data.stock || 0,
                data.image || null,
                id
            ]
        );

    return result;
};


// DELETE

exports.delete = async (
    id
) => {

    const [result] =
        await db.execute(
            `
                DELETE FROM product_variants
                WHERE id = ?
            `,
            [id]
        );

    return result;
};