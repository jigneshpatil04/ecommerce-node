// ==========================================
// LOGIN PAGE JAVASCRIPT
// ==========================================

document.addEventListener("DOMContentLoaded", function () {
    initLoginTabs();
});

// Also initialize immediately in case DOM is already parsed
if (document.readyState === "interactive" || document.readyState === "complete") {
    initLoginTabs();
}

function initLoginTabs() {
    const userTab = document.getElementById("userTab");
    const adminTab = document.getElementById("adminTab");
    const userLoginSection = document.getElementById("userLoginSection");
    const adminLoginSection = document.getElementById("adminLoginSection");
    const backToUser = document.getElementById("backToUser");

    function showUserLogin() {
        if (userTab) userTab.classList.add("active");
        if (adminTab) adminTab.classList.remove("active");
        if (userLoginSection) {
            userLoginSection.classList.add("active");
            userLoginSection.style.display = "block";
        }
        if (adminLoginSection) {
            adminLoginSection.classList.remove("active");
            adminLoginSection.style.display = "none";
        }
    }
    window.showUserLogin = showUserLogin;

    function showAdminLogin() {
        if (adminTab) adminTab.classList.add("active");
        if (userTab) userTab.classList.remove("active");
        if (adminLoginSection) {
            adminLoginSection.classList.add("active");
            adminLoginSection.style.display = "block";
        }
        if (userLoginSection) {
            userLoginSection.classList.remove("active");
            userLoginSection.style.display = "none";
        }
    }
    window.showAdminLogin = showAdminLogin;

    if (userTab) {
        userTab.onclick = showUserLogin;
    }
    if (adminTab) {
        adminTab.onclick = showAdminLogin;
    }
    if (backToUser) {
        backToUser.onclick = showUserLogin;
    }

    // Default to user login view
    showUserLogin();
}

// Global expose so inline onclick in HTML always works
window.showUserLogin = function () {
    const userTab = document.getElementById("userTab");
    const adminTab = document.getElementById("adminTab");
    const userLoginSection = document.getElementById("userLoginSection");
    const adminLoginSection = document.getElementById("adminLoginSection");
    if (userTab) userTab.classList.add("active");
    if (adminTab) adminTab.classList.remove("active");
    if (userLoginSection) {
        userLoginSection.classList.add("active");
        userLoginSection.style.display = "block";
    }
    if (adminLoginSection) {
        adminLoginSection.classList.remove("active");
        adminLoginSection.style.display = "none";
    }
};

window.showAdminLogin = function () {
    const userTab = document.getElementById("userTab");
    const adminTab = document.getElementById("adminTab");
    const userLoginSection = document.getElementById("userLoginSection");
    const adminLoginSection = document.getElementById("adminLoginSection");
    if (adminTab) adminTab.classList.add("active");
    if (userTab) userTab.classList.remove("active");
    if (adminLoginSection) {
        adminLoginSection.classList.add("active");
        adminLoginSection.style.display = "block";
    }
    if (userLoginSection) {
        userLoginSection.classList.remove("active");
        userLoginSection.style.display = "none";
    }
};

// ==========================================
// USER LOGIN (WITH GITHUB PAGES DEMO FALLBACK)
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
    const userLoginForm = document.getElementById("userLoginForm");
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
                    const isGitHub = window.location.hostname.endsWith("github.io") || window.location.protocol === "file:";
                    window.location.href = isGitHub ? "./index.html" : "/";
                }, 600);
            }
        });
    }

    // ==========================================
    // ADMIN LOGIN (WITH GITHUB PAGES DEMO FALLBACK)
    // ==========================================
    const adminLoginForm = document.getElementById("adminLoginForm");
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
                        message.textContent = "Unable to connect to database server. Please ensure MySQL is running.";
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
});

console.log("=================================");
console.log("LOGIN JAVASCRIPT READY");
console.log("=================================");
