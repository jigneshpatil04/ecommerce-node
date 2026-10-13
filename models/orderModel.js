const db =
    require("../config/db");


// ==========================================
// CREATE ORDER
// ==========================================

function createOrder(
    order,
    callback
) {

    const sql = `

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
            total_amount
        )

        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)

    `;


    db.query(

        sql,

        [
            order.user_id,
            order.customer_name,
            order.email,
            order.phone,
            order.address,
            order.city,
            order.state,
            order.pincode,
            order.total_amount
        ],

        callback

    );

}


// ==========================================
// CREATE ORDER ITEM
// ==========================================

function createOrderItem(
    item,
    callback
) {

    const sql = `

        INSERT INTO order_items

        (
            order_id,
            product_id,
            product_name,
            price,
            quantity,
            subtotal
        )

        VALUES (?, ?, ?, ?, ?, ?)

    `;


    db.query(

        sql,

        [
            item.order_id,
            item.product_id,
            item.product_name,
            item.price,
            item.quantity,
            item.subtotal
        ],

        callback

    );

}


module.exports = {

    createOrder,

    createOrderItem

};