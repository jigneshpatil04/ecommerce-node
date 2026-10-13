
// ==========================================
// LOGIN PAGE JAVASCRIPT
// USER LOGIN + ADMIN LOGIN
// ==========================================

console.log("=================================");
console.log("LOGIN JAVASCRIPT LOADED");
console.log("=================================");


// ==========================================
// GET LOGIN ELEMENTS
// ==========================================

const userTab =
    document.getElementById("userTab");

const adminTab =
    document.getElementById("adminTab");

const userLoginSection =
    document.getElementById("userLoginSection");

const adminLoginSection =
    document.getElementById("adminLoginSection");

const backToUser =
    document.getElementById("backToUser");

const userLoginForm =
    document.getElementById("userLoginForm");

const adminLoginForm =
    document.getElementById("adminLoginForm");


// ==========================================
// CHECK LOGIN PAGE ELEMENTS
// ==========================================

console.log("User Tab:", !!userTab);
console.log("Admin Tab:", !!adminTab);
console.log("User Login Section:", !!userLoginSection);
console.log("Admin Login Section:", !!adminLoginSection);
console.log("Back To User:", !!backToUser);
console.log("User Login Form:", !!userLoginForm);
console.log("Admin Login Form:", !!adminLoginForm);


// ==========================================
// SHOW USER LOGIN
// ==========================================

function showUserLogin() {

    console.log("Showing User Login.");

    if (userTab) {

        userTab.classList.add("active");

    }

    if (adminTab) {

        adminTab.classList.remove("active");

    }

    if (userLoginSection) {

        userLoginSection.classList.add("active");

    }

    if (adminLoginSection) {

        adminLoginSection.classList.remove("active");

    }

}


// ==========================================
// SHOW ADMIN LOGIN
// ==========================================

function showAdminLogin() {

    console.log("Showing Admin Login.");

    if (adminTab) {

        adminTab.classList.add("active");

    }

    if (userTab) {

        userTab.classList.remove("active");

    }

    if (adminLoginSection) {

        adminLoginSection.classList.add("active");

    }

    if (userLoginSection) {

        userLoginSection.classList.remove("active");

    }

}


// ==========================================
// USER LOGIN TAB
// ==========================================

if (userTab) {

    userTab.addEventListener(
        "click",
        function () {

            console.log("User Login Tab clicked.");

            showUserLogin();

        }
    );

}


// ==========================================
// ADMIN LOGIN TAB
// ==========================================

if (adminTab) {

    adminTab.addEventListener(
        "click",
        function () {

            console.log("Admin Login Tab clicked.");

            showAdminLogin();

        }
    );

}


// ==========================================
// BACK TO USER LOGIN
// ==========================================

if (backToUser) {

    backToUser.addEventListener(
        "click",
        function () {

            console.log("Back to User Login clicked.");

            showUserLogin();

        }
    );

}


// ==========================================
// USER LOGIN
// ==========================================

if (userLoginForm) {

    userLoginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            console.log("");
            console.log("=================================");
            console.log("USER LOGIN SUBMITTED");
            console.log("=================================");


            // ==================================
            // GET USER ELEMENTS
            // ==================================

            const emailElement =
                document.getElementById(
                    "userEmail"
                );

            const passwordElement =
                document.getElementById(
                    "userPassword"
                );

            const message =
                document.getElementById(
                    "userLoginMessage"
                );


            // ==================================
            // CHECK EMAIL ELEMENT
            // ==================================

            if (!emailElement) {

                console.error(
                    "User email input not found."
                );

                if (message) {

                    message.textContent =
                        "Email input not found.";

                    message.style.color =
                        "red";

                }

                return;

            }


            // ==================================
            // CHECK PASSWORD ELEMENT
            // ==================================

            if (!passwordElement) {

                console.error(
                    "User password input not found."
                );

                if (message) {

                    message.textContent =
                        "Password input not found.";

                    message.style.color =
                        "red";

                }

                return;

            }


            // ==================================
            // GET VALUES
            // ==================================

            const email =
                emailElement.value.trim();

            const password =
                passwordElement.value;


            console.log(
                "User Email:",
                email
            );

            console.log(
                "Password entered:",
                password.length > 0
            );


            // ==================================
            // VALIDATION
            // ==================================

            if (!email || !password) {

                if (message) {

                    message.textContent =
                        "Email and password are required.";

                    message.style.color =
                        "red";

                }

                return;

            }


            // ==================================
            // SHOW LOGIN MESSAGE
            // ==================================

            if (message) {

                message.textContent =
                    "Logging in...";

                message.style.color =
                    "";

            }


            // ==================================
            // SEND USER LOGIN REQUEST
            // ==================================

            try {

                console.log(
                    "Sending user login request..."
                );


                const response =
                    await fetch(
                        "/api/users/login",
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    email:
                                        email,

                                    password:
                                        password

                                })

                        }
                    );


                // ==================================
                // HTTP STATUS
                // ==================================

                console.log(
                    "User Login HTTP Status:",
                    response.status
                );


                // ==================================
                // READ RESPONSE TEXT
                // ==================================

                const responseText =
                    await response.text();


                console.log(
                    "User server response:",
                    responseText
                );


                // ==================================
                // EMPTY RESPONSE
                // ==================================

                if (!responseText) {

                    if (message) {

                        message.textContent =
                            "Server returned an empty response.";

                        message.style.color =
                            "red";

                    }

                    return;

                }


                // ==================================
                // PARSE JSON
                // ==================================

                let data;

                try {

                    data =
                        JSON.parse(
                            responseText
                        );

                }
                catch (jsonError) {

                    console.error(
                        "Invalid user JSON response:",
                        responseText
                    );

                    if (message) {

                        message.textContent =
                            "Invalid server response.";

                        message.style.color =
                            "red";

                    }

                    return;

                }


                console.log(
                    "User Login Response:",
                    data
                );


                // ==================================
                // LOGIN FAILED
                // ==================================

                if (
                    !response.ok ||
                    !data.success
                ) {

                    console.log(
                        "User login failed."
                    );


                    if (message) {

                        message.textContent =
                            data.message ||
                            "Invalid email or password.";

                        message.style.color =
                            "red";

                    }

                    return;

                }


                // ==================================
                // USER LOGIN SUCCESS
                // ==================================

                console.log(
                    "User login successful!"
                );


                // ==================================
                // SAVE USER TOKEN
                // ==================================

                localStorage.setItem(
                    "token",
                    data.token ||
                    "logged-in"
                );


                // ==================================
                // SAVE USER INFORMATION
                // ==================================

                if (data.user) {

                    localStorage.setItem(
                        "user",
                        JSON.stringify(
                            data.user
                        )
                    );

                }


                // ==================================
                // SUCCESS MESSAGE
                // ==================================

                if (message) {

                    message.textContent =
                        data.message ||
                        "Login successful!";

                    message.style.color =
                        "green";

                }


                // ==================================
                // REDIRECT USER
                // ==================================

                console.log(
                    "Redirecting to Home Page..."
                );


                setTimeout(
                    function () {

                        window.location.href =
                            "/";

                    },
                    500
                );

            }
            catch (error) {

                console.error(
                    "User Login Error:",
                    error
                );


                if (message) {

                    message.textContent =
                        "Unable to connect to server. Please try again.";

                    message.style.color =
                        "red";

                }

            }

        }
    );

}


// ==========================================
// ADMIN LOGIN
// ==========================================

if (adminLoginForm) {

    adminLoginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            console.log("");
            console.log("=================================");
            console.log("ADMIN LOGIN SUBMITTED");
            console.log("=================================");


            // ==================================
            // GET ADMIN ELEMENTS
            // ==================================

            const emailElement =
                document.getElementById(
                    "adminEmail"
                );

            const passwordElement =
                document.getElementById(
                    "adminPassword"
                );

            const message =
                document.getElementById(
                    "adminLoginMessage"
                );


            // ==================================
            // CHECK EMAIL ELEMENT
            // ==================================

            if (!emailElement) {

                console.error(
                    "Admin email input not found."
                );

                if (message) {

                    message.textContent =
                        "Admin email input not found.";

                    message.style.color =
                        "red";

                }

                return;

            }


            // ==================================
            // CHECK PASSWORD ELEMENT
            // ==================================

            if (!passwordElement) {

                console.error(
                    "Admin password input not found."
                );

                if (message) {

                    message.textContent =
                        "Admin password input not found.";

                    message.style.color =
                        "red";

                }

                return;

            }


            // ==================================
            // GET VALUES
            // ==================================

            const email =
                emailElement.value.trim();

            const password =
                passwordElement.value.trim();


            console.log(
                "Admin Email:",
                email
            );

            console.log(
                "Admin Password entered:",
                password.length > 0
            );


            // ==================================
            // VALIDATION
            // ==================================

            if (!email || !password) {

                if (message) {

                    message.textContent =
                        "Please enter email and password.";

                    message.style.color =
                        "red";

                }

                return;

            }


            // ==================================
            // SHOW MESSAGE
            // ==================================

            if (message) {

                message.textContent =
                    "Checking admin credentials...";

                message.style.color =
                    "";

            }


            // ==================================
            // SEND ADMIN LOGIN REQUEST
            // ==================================

            try {

                console.log(
                    "Sending admin login request..."
                );


                const response =
                    await fetch(
                        "/api/admin/login",
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    email:
                                        email,

                                    password:
                                        password

                                })

                        }
                    );


                // ==================================
                // HTTP STATUS
                // ==================================

                console.log(
                    "Admin Login HTTP Status:",
                    response.status
                );


                // ==================================
                // GET RESPONSE TEXT FIRST
                // ==================================

                const responseText =
                    await response.text();


                console.log(
                    "Admin server response:",
                    responseText
                );


                // ==================================
                // CHECK EMPTY RESPONSE
                // ==================================

                if (!responseText) {

                    if (message) {

                        message.textContent =
                            "Server returned an empty response.";

                        message.style.color =
                            "red";

                    }

                    return;

                }


                // ==================================
                // CONVERT RESPONSE TO JSON
                // ==================================

                let data;

                try {

                    data =
                        JSON.parse(
                            responseText
                        );

                }
                catch (jsonError) {

                    console.error(
                        "Invalid admin JSON response:",
                        responseText
                    );

                    if (message) {

                        message.textContent =
                            "Invalid server response.";

                        message.style.color =
                            "red";

                    }

                    return;

                }


                // ==================================
                // SHOW ADMIN RESPONSE
                // ==================================

                console.log(
                    "Admin Login Response:",
                    data
                );


                // ==================================
                // CHECK HTTP RESPONSE
                // ==================================

                if (!response.ok) {

                    if (message) {

                        message.textContent =
                            data.message ||
                            "Admin login failed.";

                        message.style.color =
                            "red";

                    }

                    return;

                }


                // ==================================
                // CHECK LOGIN SUCCESS
                // ==================================

                if (data.success) {

                    console.log(
                        "Admin login successful!"
                    );


                    // ==================================
                    // SAVE ADMIN TOKEN
                    // ==================================

                    localStorage.setItem(
                        "adminToken",
                        data.token ||
                        "admin-logged-in"
                    );


                    // ==================================
                    // SAVE ADMIN INFORMATION
                    // ==================================

                    if (data.admin) {

                        localStorage.setItem(
                            "admin",
                            JSON.stringify(
                                data.admin
                            )
                        );

                    }


                    // ==================================
                    // SUCCESS MESSAGE
                    // ==================================

                    if (message) {

                        message.textContent =
                            data.message ||
                            "Admin login successful!";

                        message.style.color =
                            "green";

                    }


                    // ==================================
                    // OPEN ADMIN DASHBOARD
                    // ==================================

                    console.log(
                        "Redirecting to Admin Dashboard..."
                    );


                    setTimeout(
                        function () {

                            window.location.href =
                                "/admin/dashboard";

                        },
                        500
                    );


                }
                else {

                    // ==================================
                    // ADMIN LOGIN FAILED
                    // ==================================

                    console.log(
                        "Admin login failed."
                    );


                    if (message) {

                        message.textContent =
                            data.message ||
                            "Invalid admin email or password.";

                        message.style.color =
                            "red";

                    }

                }

            }
            catch (error) {

                // ==================================
                // ADMIN LOGIN ERROR
                // ==================================

                console.error(
                    "Admin Login Error:",
                    error
                );


                if (message) {

                    message.textContent =
                        "Unable to connect to server.";

                    message.style.color =
                        "red";

                }

            }

        }
    );

}


// ==========================================
// DEFAULT LOGIN TAB
// ==========================================

if (
    userLoginSection &&
    adminLoginSection
) {

    showUserLogin();

}


// ==========================================
// LOGIN JAVASCRIPT READY
// ==========================================

console.log("=================================");
console.log("LOGIN JAVASCRIPT READY");
console.log("=================================");

