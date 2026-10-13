// ==========================================
// REGISTER FORM
// ==========================================

const registerForm =
    document.getElementById("registerForm");


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            // ==========================================
            // GET FORM VALUES
            // ==========================================

            const name =
                document
                    .getElementById("name")
                    .value
                    .trim();

            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("password")
                    .value;


            const message =
                document.getElementById(
                    "registerMessage"
                );


            // ==========================================
            // VALIDATION
            // ==========================================

            if (!name || !email || !password) {

                message.textContent =
                    "Please fill all fields.";

                message.style.color = "red";

                return;
            }


            try {

                // ==========================================
                // REGISTER API
                // ==========================================

                const response =
                    await fetch(
                        "/api/users/register",
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    name: name,

                                    email: email,

                                    password: password

                                })

                        }
                    );


                // ==========================================
                // GET RESPONSE
                // ==========================================

                const data =
                    await response.json();


                console.log(
                    "Register response:",
                    data
                );


                // ==========================================
                // SUCCESS
                // ==========================================

                if (data.success) {

                    message.textContent =
                        "Registration successful!";

                    message.style.color =
                        "green";


                    // Redirect to login

                    setTimeout(() => {

                        window.location.href =
                            "/login.html";

                    }, 1000);


                } else {

                    message.textContent =
                        data.message ||
                        "Registration failed.";

                    message.style.color =
                        "red";

                }


            } catch (error) {

                console.error(
                    "Register Error:",
                    error
                );


                message.textContent =
                    "Server error. Please try again.";

                message.style.color =
                    "red";

            }

        }
    );

}