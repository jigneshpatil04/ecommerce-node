// ==========================================
// ADMIN DASHBOARD JAVASCRIPT
// ==========================================

console.log("=================================");
console.log("ADMIN DASHBOARD LOADED");
console.log("=================================");


// ==========================================
// GET ELEMENTS
// ==========================================

const sidebar =
    document.getElementById("sidebar");

const menuButton =
    document.getElementById("menuButton");

const logoutButton =
    document.getElementById("logoutButton");

const adminName =
    document.getElementById("adminName");

const totalProductsElement =
    document.getElementById("totalProducts");

const totalOrdersElement =
    document.getElementById("totalOrders");

const totalUsersElement =
    document.getElementById("totalUsers");

const totalRevenueElement =
    document.getElementById("totalRevenue");

const dashboardMessage =
    document.getElementById("dashboardMessage");

const recentOrdersContainer =
    document.getElementById("recentOrders");


// ==========================================
// CHECK ADMIN LOGIN
// ==========================================

const adminToken =
    localStorage.getItem("adminToken");


if (!adminToken) {

    console.log(
        "Admin not logged in."
    );

    window.location.href =
        "/login.html";

}


// ==========================================
// LOAD ADMIN INFORMATION
// ==========================================

const savedAdmin =
    localStorage.getItem("admin");


if (savedAdmin) {

    try {

        const admin =
            JSON.parse(savedAdmin);


        if (
            admin &&
            admin.name &&
            adminName
        ) {

            adminName.textContent =
                admin.name;

        }

    }
    catch (error) {

        console.error(
            "Unable to read admin data:",
            error
        );

    }

}


// ==========================================
// SIDEBAR MENU
// ==========================================

if (menuButton) {

    menuButton.addEventListener(
        "click",
        function () {

            if (sidebar) {

                sidebar.classList.toggle(
                    "open"
                );

            }

        }
    );

}


// ==========================================
// GET NAVIGATION ITEMS
// ==========================================

const navItems =
    document.querySelectorAll(
        ".nav-item"
    );


const contentSections =
    document.querySelectorAll(
        ".content-section"
    );


// ==========================================
// SHOW SECTION
// ==========================================

function showSection(sectionName) {

    console.log(
        "Opening section:",
        sectionName
    );


    // ======================================
    // REMOVE ACTIVE FROM NAVIGATION
    // ======================================

    navItems.forEach(
        function (item) {

            item.classList.remove(
                "active"
            );

        }
    );


    // ======================================
    // HIDE ALL SECTIONS
    // ======================================

    contentSections.forEach(
        function (section) {

            section.classList.remove(
                "active"
            );

        }
    );


    // ======================================
    // FIND SELECTED NAVIGATION
    // ======================================

    const selectedNav =
        document.querySelector(
            `[data-section="${sectionName}"]`
        );


    if (selectedNav) {

        selectedNav.classList.add(
            "active"
        );

    }


    // ======================================
    // FIND SELECTED SECTION
    // ======================================

    const selectedSection =
        document.getElementById(
            sectionName + "Section"
        );


    if (selectedSection) {

        selectedSection.classList.add(
            "active"
        );

    }


    // ======================================
    // CHANGE PAGE TITLE
    // ======================================

    const title =
        document.querySelector(
            ".topbar-title h1"
        );


    if (title) {

        title.textContent =
            sectionName
                .charAt(0)
                .toUpperCase()
            +
            sectionName.slice(1);

    }


    // ======================================
    // CLOSE MOBILE SIDEBAR
    // ======================================

    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }

}


// ==========================================
// NAVIGATION CLICK
// ==========================================

navItems.forEach(
    function (item) {

        item.addEventListener(
            "click",
            function (event) {

                const section =
                    item.dataset.section;

                const targetUrl =
                    item.getAttribute("href");


                if (
                    targetUrl &&
                    targetUrl !== "#"
                ) {

                    window.location.href =
                        targetUrl;

                    return;

                }


                event.preventDefault();


                if (section) {

                    showSection(
                        section
                    );

                }

            }
        );

    }
);


// ==========================================
// QUICK ACTIONS
// ==========================================

const quickActions =
    document.querySelectorAll(
        ".quick-action"
    );


quickActions.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                const section =
                    button.dataset.section;

                const targetUrl =
                    button.dataset.href;


                if (targetUrl) {

                    window.location.href =
                        targetUrl;

                    return;

                }


                if (section) {

                    showSection(
                        section
                    );

                }

            }
        );

    }
);


// ==========================================
// VIEW ALL ORDERS
// ==========================================

const viewAllButton =
    document.querySelector(
        ".view-all-button"
    );


if (viewAllButton) {

    viewAllButton.addEventListener(
        "click",
        function () {

            const targetUrl =
                viewAllButton.dataset.href;


            if (targetUrl) {

                window.location.href =
                    targetUrl;

                return;

            }


            showSection(
                "orders"
            );

        }
    );

}


// ==========================================
// LOGOUT
// ==========================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmLogout) {

                return;

            }


            // ==================================
            // REMOVE ADMIN LOGIN DATA
            // ==================================

            localStorage.removeItem(
                "adminToken"
            );

            localStorage.removeItem(
                "admin"
            );


            console.log(
                "Admin logged out."
            );


            // ==================================
            // REDIRECT
            // ==================================

            window.location.href =
                "/login.html";

        }
    );

}


// ==========================================
// LOAD DASHBOARD DATA
// ==========================================

async function loadDashboardData() {

    console.log(
        "Loading dashboard data..."
    );


    // ==========================================
    // ADMIN DASHBOARD API
    // ==========================================

    try {

        const response =
            await fetch(
                "/api/admin/dashboard",
                {
                    method: "GET",
                    headers: {

                        "Authorization":
                            "Bearer " +
                            adminToken

                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "Admin Dashboard Response:",
            data
        );


        const dashboardData =
            data.data || data;


        // ======================================
        // CHECK RESPONSE
        // ======================================

        if (
            response.ok &&
            data.success
        ) {

            // ==================================
            // TOTAL ORDERS
            // ==================================

            if (totalOrdersElement) {

                totalOrdersElement.textContent =
                    dashboardData.totalOrders || 0;

            }


            if (totalProductsElement) {

                totalProductsElement.textContent =
                    dashboardData.totalProducts || 0;

            }


            if (totalUsersElement) {

                totalUsersElement.textContent =
                    dashboardData.totalUsers || 0;

            }


            if (totalRevenueElement) {

                totalRevenueElement.textContent =
                    "₹" +
                    Number(
                        dashboardData.totalRevenue || 0
                    ).toFixed(2);

            }


            if (
                Array.isArray(
                    dashboardData.recentOrders
                )
            ) {

                displayRecentOrders(
                    dashboardData.recentOrders
                );

            }


            // ==================================
            // DASHBOARD MESSAGE
            // ==================================

            if (dashboardMessage) {

                dashboardMessage.textContent =
                    `There are currently ${
                        dashboardData.totalOrders || 0
                    } orders in the system.`;

            }

            // ==================================
            // LOAD INVENTORY STATS & ALERTS
            // ==================================
            try {
                const invRes = await fetch("/api/admin/inventory");
                const invData = await invRes.json();
                if (invData.success && invData.summary) {
                    const lowStockEl = document.getElementById("totalLowStock");
                    const invLabelEl = document.getElementById("inventoryAlertLabel");
                    const totalAlerts = (invData.summary.lowStockCount || 0) + (invData.summary.outOfStockCount || 0);
                    if (lowStockEl) {
                        lowStockEl.textContent = totalAlerts;
                        if (totalAlerts > 0) {
                            lowStockEl.style.color = "#ef4444";
                        } else {
                            lowStockEl.style.color = "#10b981";
                        }
                    }
                    if (invLabelEl) {
                        invLabelEl.textContent = `${invData.summary.outOfStockCount || 0} Out / ${invData.summary.lowStockCount || 0} Low`;
                    }
                }
            } catch (invErr) {
                console.warn("Failed to load inventory alerts for dashboard:", invErr);
            }

        }

    }
    catch (error) {

        console.error(
            "Admin dashboard API error:",
            error
        );

    }


    // ==========================================
    // LOAD PRODUCTS
    // ==========================================

    try {

        const productResponse =
            await fetch(
                "/api/products"
            );


        if (productResponse.ok) {

            const productData =
                await productResponse.json();


            let products = [];


            if (
                Array.isArray(
                    productData
                )
            ) {

                products =
                    productData;

            }
            else if (
                Array.isArray(
                    productData.products
                )
            ) {

                products =
                    productData.products;

            }


            if (totalProductsElement) {

                totalProductsElement.textContent =
                    products.length;

            }

        }

    }
    catch (error) {

        console.error(
            "Product API error:",
            error
        );


        if (totalProductsElement) {

            totalProductsElement.textContent =
                "0";

        }

    }


    // ==========================================
    // LOAD ORDERS
    // ==========================================

    try {

        const orderResponse =
            await fetch(
                "/api/admin/orders"
            );


        if (orderResponse.ok) {

            const orderData =
                await orderResponse.json();


            let orders = [];


            if (
                Array.isArray(
                    orderData
                )
            ) {

                orders =
                    orderData;

            }
            else if (
                Array.isArray(
                    orderData.orders
                )
            ) {

                orders =
                    orderData.orders;

            }


            // ==================================
            // TOTAL ORDERS
            // ==================================

            if (totalOrdersElement) {

                totalOrdersElement.textContent =
                    orders.length;

            }


            // ==================================
            // REVENUE
            // ==================================

            calculateRevenue(
                orders
            );


            // ==================================
            // RECENT ORDERS
            // ==================================

            displayRecentOrders(
                orders
            );


            // ==================================
            // DASHBOARD MESSAGE
            // ==================================

            if (dashboardMessage) {

                dashboardMessage.textContent =
                    `There are currently ${
                        orders.length
                    } orders in the system.`;

            }

        }

    }
    catch (error) {

        console.error(
            "Order API error:",
            error
        );


        if (totalOrdersElement) {

            totalOrdersElement.textContent =
                "0";

        }

        if (dashboardMessage) {

            dashboardMessage.textContent =
                "Unable to load order information.";

        }

    }


    // ==========================================
    // LOAD USERS
    // ==========================================

    try {

        const userResponse =
            await fetch(
                "/api/users"
            );


        if (userResponse.ok) {

            const userData =
                await userResponse.json();


            let users = [];


            if (
                Array.isArray(
                    userData
                )
            ) {

                users =
                    userData;

            }
            else if (
                Array.isArray(
                    userData.users
                )
            ) {

                users =
                    userData.users;

            }


            if (totalUsersElement) {

                totalUsersElement.textContent =
                    users.length;

            }

        }

    }
    catch (error) {

        console.error(
            "User API error:",
            error
        );


        if (totalUsersElement) {

            totalUsersElement.textContent =
                "0";

        }

    }

}


// ==========================================
// CALCULATE REVENUE
// ==========================================

function calculateRevenue(orders) {

    let revenue = 0;


    if (!Array.isArray(orders)) {

        orders = [];

    }


    orders.forEach(
        function (order) {

            const amount =
                Number(
                    order.total ||
                    order.grand_total ||
                    order.amount ||
                    0
                );


            revenue += amount;

        }
    );


    if (totalRevenueElement) {

        totalRevenueElement.textContent =
            "₹" +
            revenue.toFixed(2);

    }

}


// ==========================================
// DISPLAY RECENT ORDERS
// ==========================================

function displayRecentOrders(orders) {

    if (!recentOrdersContainer) {

        return;

    }


    // ======================================
    // NO ORDERS
    // ======================================

    if (
        !orders ||
        orders.length === 0
    ) {

        recentOrdersContainer.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    style="text-align: center;"
                >
                    No orders found.
                </td>

            </tr>

        `;

        return;

    }


    // ======================================
    // GET ONLY 5 RECENT ORDERS
    // ======================================

    const recentOrders =
        orders.slice(0, 5);


    // ======================================
    // DISPLAY ORDERS
    // ======================================

    recentOrdersContainer.innerHTML =
        recentOrders.map(
            function (order) {

                const orderId =
                    order.id || "-";


                const customer =
                    order.customer_name ||
                    order.name ||
                    "Customer";


                const amount =
                    Number(
                        order.total ||
                        order.grand_total ||
                        order.amount ||
                        0
                    );


                const status =
                    order.status ||
                    "Pending";


                const statusClass = "status-" + status.toLowerCase();

                return `
                    <tr>
                        <td><strong class="order-id">#${orderId}</strong></td>
                        <td>${customer}</td>
                        <td><strong>₹${amount.toFixed(2)}</strong></td>
                        <td><span class="status-badge ${statusClass}">${status}</span></td>
                    </tr>
                `;

            }
        ).join("");

}


// ==========================================
// ADD PRODUCT BUTTON
// ==========================================

const addProductButton =
    document.getElementById(
        "addProductButton"
    );


if (addProductButton) {

    addProductButton.addEventListener(
        "click",
        function () {

            showSection(
                "products"
            );

        }
    );

}


// ==========================================
// DEFAULT DASHBOARD SECTION
// ==========================================

const dashboardSection =
    document.getElementById(
        "dashboardSection"
    );


if (dashboardSection) {

    showSection(
        "dashboard"
    );

}


// ==========================================
// START DASHBOARD
// ==========================================

loadDashboardData();


// ==========================================
// DASHBOARD JAVASCRIPT READY
// ==========================================

console.log("=================================");
console.log("ADMIN DASHBOARD READY");
console.log("=================================");