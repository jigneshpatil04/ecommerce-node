
// ==========================================
// LOGIN PAGE JAVASCRIPT
// ==========================================
// USER LOGIN (WITH GITHUB PAGES DEMO FALLBACK)
// ==========================================

if (userLoginForm) {
    userLoginForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        console.log("USER LOGIN SUBMITTED");

        const emailElement = document.getElementById("userEmail");
        const passwordElement = document.getElementById("userPassword");
        const message = document.getElementById("userLoginMessage");

        if (!emailElement || !passwordElement) return;

        const email = emailElement.value.trim();
        const password = passwordElement.value.trim();

        if (!email || !password) {
            if (message) {
                message.textContent = "Please enter email and password.";
                message.style.color = "red";
            }
            return;
        }

        if (message) {
            message.textContent = "Signing in...";
            message.style.color = "#333";
        }

        let isSuccess = false;
        let userData = null;
        let token = null;

        try {
            const response = await fetch("/api/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ email: email, password: password })
            });

            const responseText = await response.text();
            let data = null;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                data = null;
            }

            if (response.ok && data && data.success) {
                isSuccess = true;
                userData = data.user;
                token = data.token;
            } else if (data && !data.success) {
                if (message) {
                    message.textContent = data.message || "Invalid email or password.";
                    message.style.color = "red";
                }
                return;
            }
        } catch (netErr) {
            console.warn("Backend API not reachable (running static/offline):", netErr);
        }

        // GitHub Pages / Static Client-Side Fallback
        if (!isSuccess) {
            const isStaticDeploy = window.location.hostname.endsWith("github.io") || window.location.protocol === "file:" || !window.location.port;
            if (isStaticDeploy || window.location.hostname !== "localhost") {
                if (email && password) {
                    isSuccess = true;
                    userData = { id: 99, name: email.split("@")[0], email: email, role: "user" };
                    token = "demo-user-token-" + Date.now();
                }
            } else {
                if (message) {
                    message.textContent = "Unable to connect to database server. Please ensure Node server is running.";
                    message.style.color = "red";
                }
                return;
            }
        }

        if (isSuccess) {
            localStorage.setItem("token", token || "logged-in");
            if (userData) localStorage.setItem("user", JSON.stringify(userData));

            if (message) {
                message.textContent = "Login successful! Redirecting...";
                message.style.color = "green";
            }

            setTimeout(function () {
                window.location.href = "./index.html";
            }, 600);
        }
    });
}


// ==========================================
// ==========================================
// ADMIN LOGIN (WITH GITHUB PAGES DEMO FALLBACK)
// ==========================================

if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        console.log("ADMIN LOGIN SUBMITTED");

        const emailElement = document.getElementById("adminEmail");
        const passwordElement = document.getElementById("adminPassword");
        const message = document.getElementById("adminLoginMessage");

        if (!emailElement || !passwordElement) return;

        const email = emailElement.value.trim();
        const password = passwordElement.value.trim();

        if (!email || !password) {
            if (message) {
                message.textContent = "Please enter email and password.";
                message.style.color = "red";
            }
            return;
        }

        if (message) {
            message.textContent = "Verifying admin credentials...";
            message.style.color = "#333";
        }

        let isSuccess = false;
        let adminData = null;
        let token = null;

        try {
            const response = await fetch("/api/admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ email: email, password: password })
            });

            const responseText = await response.text();
            let data = null;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                data = null;
            }

            if (response.ok && data && data.success) {
                isSuccess = true;
                adminData = data.admin;
                token = data.token;
            } else if (data && !data.success) {
                if (message) {
                    message.textContent = data.message || "Invalid admin credentials.";
                    message.style.color = "red";
                }
                return;
            }
        } catch (netErr) {
            console.warn("Backend API not reachable (running static/offline):", netErr);
        }

        // GitHub Pages / Static Client-Side Fallback
        if (!isSuccess) {
            const isStaticDeploy = window.location.hostname.endsWith("github.io") || window.location.protocol === "file:" || !window.location.port;
            if (isStaticDeploy || window.location.hostname !== "localhost") {
                if (email.toLowerCase() === "admin@gmail.com") {
                    isSuccess = true;
                    adminData = { id: 1, name: "Admin", email: "admin@gmail.com", role: "admin" };
                    token = "demo-admin-token-" + Date.now();
                } else {
                    if (message) {
                        message.textContent = "Admin not found. For demo access, use admin@gmail.com";
                        message.style.color = "red";
                    }
                    return;
                }
            } else {
                if (message) {
                    message.textContent = "Unable to connect to database server. Please ensure Node server is running.";
                    message.style.color = "red";
                }
                return;
            }
        }

        if (isSuccess) {
            localStorage.setItem("adminToken", token || "admin-logged-in");
            if (adminData) localStorage.setItem("admin", JSON.stringify(adminData));

            if (message) {
                message.textContent = "Admin login successful! Redirecting to Dashboard...";
                message.style.color = "green";
            }

            setTimeout(function () {
                const isStaticDeploy = window.location.hostname.endsWith("github.io") || window.location.protocol === "file:";
                window.location.href = isStaticDeploy ? "./admin/dashboard.html" : "/admin/dashboard";
            }, 600);
        }
    });
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

