const express = require("express");
const router = express.Router();

const db = require("../config/db");


// ==================================================
// GET ALL USERS
// ==================================================

router.get("/", async (req, res) => {

    try {

        const [users] =
            await db.query(`
                SELECT id, name, email
                FROM users
                ORDER BY id DESC
            `);

        return res.json({
            success: true,
            users
        });

    }
    catch (error) {

        console.error(
            "Get users error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to load users."
        });

    }

});


// ==================================================
// REGISTER USER
// ==================================================

router.post("/register", async (req, res) => {

    console.log("");
    console.log("=================================");
    console.log("REGISTER REQUEST");
    console.log("=================================");

    console.log("REQUEST BODY:");
    console.log(req.body);

    try {

        // ==========================================
        // CHECK REQUEST BODY
        // ==========================================

        if (
            !req.body ||
            typeof req.body !== "object"
        ) {

            return res.status(400).json({
                success: false,
                message: "Request body is missing."
            });

        }


        // ==========================================
        // GET REGISTER DATA
        // ==========================================

        const {
            name,
            email,
            password
        } = req.body;


        // ==========================================
        // CHECK DATA TYPE
        // ==========================================

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string"
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Name, email and password are required."
            });

        }


        // ==========================================
        // CLEAN DATA
        // ==========================================

        const cleanName = name.trim();

        const cleanEmail =
            email.trim().toLowerCase();

        const cleanPassword =
            password.trim();


        // ==========================================
        // CHECK EMPTY DATA
        // ==========================================

        if (
            cleanName.length === 0 ||
            cleanEmail.length === 0 ||
            cleanPassword.length === 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Name, email and password are required."
            });

        }


        // ==========================================
        // EMAIL VALIDATION
        // ==========================================

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!emailRegex.test(cleanEmail)) {

            return res.status(400).json({
                success: false,
                message:
                    "Please enter a valid email address."
            });

        }


        // ==========================================
        // PASSWORD VALIDATION
        // ==========================================

        if (cleanPassword.length < 6) {

            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 6 characters long."
            });

        }


        // ==========================================
        // CHECK EMAIL ALREADY EXISTS
        // ==========================================

        const checkEmailSql = `
            SELECT id
            FROM users
            WHERE email = ?
            LIMIT 1
        `;


        const [existingUsers] =
            await db.query(
                checkEmailSql,
                [cleanEmail]
            );


        console.log(
            "Existing users:",
            existingUsers.length
        );


        if (existingUsers.length > 0) {

            return res.status(409).json({
                success: false,
                message:
                    "Email already registered."
            });

        }


        // ==========================================
        // INSERT USER
        // ==========================================

        const insertSql = `
            INSERT INTO users
            (
                name,
                email,
                password
            )
            VALUES (?, ?, ?)
        `;


        const [result] =
            await db.query(
                insertSql,
                [
                    cleanName,
                    cleanEmail,
                    cleanPassword
                ]
            );


        // ==========================================
        // CHECK INSERT RESULT
        // ==========================================

        if (
            !result ||
            !result.insertId
        ) {

            return res.status(500).json({
                success: false,
                message:
                    "User registration failed."
            });

        }


        // ==========================================
        // SUCCESS LOG
        // ==========================================

        console.log("");
        console.log("=================================");
        console.log("USER REGISTERED SUCCESSFULLY");
        console.log("=================================");

        console.log(
            "User ID:",
            result.insertId
        );

        console.log(
            "Name:",
            cleanName
        );

        console.log(
            "Email:",
            cleanEmail
        );

        console.log("=================================");


        // ==========================================
        // SEND RESPONSE
        // ==========================================

        return res.status(201).json({

            success: true,

            message:
                "Registration successful!",

            user: {

                id:
                    result.insertId,

                name:
                    cleanName,

                email:
                    cleanEmail

            }

        });

    } catch (error) {

        // ==========================================
        // REGISTER ERROR
        // ==========================================

        console.error("");
        console.error("=================================");
        console.error("REGISTER ERROR");
        console.error("=================================");

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

        console.error("=================================");


        // ==========================================
        // DUPLICATE EMAIL
        // ==========================================

        if (
            error.code === "ER_DUP_ENTRY"
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "Email already registered."

            });

        }


        // ==========================================
        // SERVER ERROR
        // ==========================================

        return res.status(500).json({

            success: false,

            message:
                "Unable to register user.",

            error:
                error.message

        });

    }

});



// ==================================================
// LOGIN USER
// ==================================================

router.post("/login", async (req, res) => {

    console.log("");
    console.log("=================================");
    console.log("LOGIN REQUEST");
    console.log("=================================");

    console.log("REQUEST BODY:");
    console.log(req.body);


    try {

        // ==========================================
        // CHECK REQUEST BODY
        // ==========================================

        if (
            !req.body ||
            typeof req.body !== "object"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Request body is missing."

            });

        }


        // ==========================================
        // GET LOGIN DATA
        // ==========================================

        const {
            email,
            password
        } = req.body;


        // ==========================================
        // CHECK DATA TYPE
        // ==========================================

        if (
            typeof email !== "string" ||
            typeof password !== "string"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required."

            });

        }


        // ==========================================
        // CLEAN DATA
        // ==========================================

        const cleanEmail =
            email.trim().toLowerCase();

        const cleanPassword =
            password.trim();


        console.log(
            "Email:",
            cleanEmail
        );

        console.log(
            "Password received:",
            cleanPassword.length > 0
        );


        // ==========================================
        // VALIDATION
        // ==========================================

        if (
            cleanEmail.length === 0 ||
            cleanPassword.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required."

            });

        }


        // ==========================================
        // EMAIL VALIDATION
        // ==========================================

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!emailRegex.test(cleanEmail)) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter a valid email address."

            });

        }


        // ==========================================
        // FIND USER
        // ==========================================

        const sql = `
            SELECT
                id,
                name,
                email,
                password
            FROM users
            WHERE email = ?
            LIMIT 1
        `;


        const [results] =
            await db.query(
                sql,
                [cleanEmail]
            );


        console.log(
            "Users found:",
            results.length
        );


        // ==========================================
        // USER NOT FOUND
        // ==========================================

        if (
            results.length === 0
        ) {

            console.log(
                "Login failed: User not found"
            );


            return res.status(401).json({

                success: false,

                message:
                    "Email not registered."

            });

        }


        // ==========================================
        // GET USER
        // ==========================================

        const user =
            results[0];


        console.log(
            "User found:",
            user.email
        );


        // ==========================================
        // CHECK PASSWORD
        // ==========================================

        if (
            user.password !== cleanPassword
        ) {

            console.log(
                "Login failed: Incorrect password"
            );


            return res.status(401).json({

                success: false,

                message:
                    "Incorrect password."

            });

        }


        // ==========================================
        // LOGIN SUCCESS
        // ==========================================

        console.log("");
        console.log("=================================");
        console.log("LOGIN SUCCESSFUL");
        console.log("=================================");

        console.log(
            "User ID:",
            user.id
        );

        console.log(
            "Name:",
            user.name
        );

        console.log(
            "Email:",
            user.email
        );

        console.log("=================================");


        // ==========================================
        // SEND RESPONSE
        // ==========================================

        return res.status(200).json({

            success: true,

            message:
                "Login successful!",

            user: {

                id:
                    user.id,

                name:
                    user.name,

                email:
                    user.email

            }

        });

    } catch (error) {

        // ==========================================
        // LOGIN ERROR
        // ==========================================

        console.error("");
        console.error("=================================");
        console.error("LOGIN ERROR");
        console.error("=================================");

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

        console.error("=================================");


        // ==========================================
        // SERVER ERROR
        // ==========================================

        return res.status(500).json({

            success: false,

            message:
                "Server error. Please try again.",

            error:
                error.message

        });

    }

});



// ==================================================
// EXPORT ROUTER
// ==================================================

module.exports = router;