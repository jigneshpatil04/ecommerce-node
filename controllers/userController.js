const bcrypt =
    require("bcryptjs");

const jwt =
    require("jsonwebtoken");

const userModel =
    require("../models/userModel");


// ==========================================
// REGISTER
// ==========================================

exports.register = (
    req,
    res
) => {

    const {
        name,
        email,
        password
    } = req.body;


    if (
        !name ||
        !email ||
        !password
    ) {

        return res.status(400).json({

            success: false,

            message:
                "All fields are required"

        });

    }


    userModel.findUserByEmail(
        email,
        async (error, users) => {

            if (error) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Database error"

                });

            }


            if (users.length > 0) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email already registered"

                });

            }


            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );


            userModel.createUser(
                name,
                email,
                hashedPassword,
                (error, result) => {

                    if (error) {

                        return res.status(500).json({

                            success: false,

                            message:
                                "Unable to create user"

                        });

                    }


                    res.status(201).json({

                        success: true,

                        message:
                            "Registration successful",

                        userId:
                            result.insertId

                    });

                }
            );

        }
    );

};


// ==========================================
// LOGIN
// ==========================================

exports.login = (
    req,
    res
) => {

    const {
        email,
        password
    } = req.body;


    if (
        !email ||
        !password
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Email and password are required"

        });

    }


    userModel.findUserByEmail(
        email,
        async (error, users) => {

            if (error) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Database error"

                });

            }


            if (users.length === 0) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid email or password"

                });

            }


            const user =
                users[0];


            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.password
                );


            if (!passwordMatch) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid email or password"

                });

            }


            const token =
                jwt.sign(

                    {
                        id: user.id,
                        email: user.email
                    },

                    process.env.JWT_SECRET,

                    {
                        expiresIn: "1d"
                    }

                );


            res.json({

                success: true,

                message:
                    "Login successful",

                token: token,

                user: {

                    id: user.id,

                    name: user.name,

                    email: user.email

                }

            });

        }
    );

};

// ==========================================
// USER PROFILE
// ==========================================

exports.profile = (req, res) => {

    res.json({

        success: true,

        message:
            "You can access this protected API.",

        user: req.user

    });

};