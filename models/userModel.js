const db = require("../config/db");


// ==========================================
// CREATE USER
// ==========================================

function createUser(
    name,
    email,
    password,
    callback
) {

    const sql = `
        INSERT INTO users
        (name, email, password)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [name, email, password],
        callback
    );
}


// ==========================================
// FIND USER BY EMAIL
// ==========================================

function findUserByEmail(
    email,
    callback
) {

    const sql = `
        SELECT *
        FROM users
        WHERE email = ?
    `;

    db.query(
        sql,
        [email],
        callback
    );
}


module.exports = {
    createUser,
    findUserByEmail
};