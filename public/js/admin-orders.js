/* =========================================================
   SQUAD FASHION - ADMIN ORDERS JAVASCRIPT
   =========================================================

   API USED:

   GET    /api/orders
   PUT    /api/orders/:id
   DELETE /api/orders/:id

   IMPORTANT:

   This page reads orders ONLY from the ADMIN API.

   It does NOT use:

   - cart localStorage
   - checkout localStorage
   - user-side orders
   - demo orders

   ========================================================= */


console.log("Admin Orders JavaScript Loaded");


/* =========================================================
   GLOBAL VARIABLES
   ========================================================= */

let orders = [];
let filteredOrders = [];
let currentPage = 1;
const ordersPerPage = 10;


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");

const paymentFilter =
    document.getElementById("paymentFilter");

const dateFilter =
    document.getElementById("dateFilter");

const refreshButton =
    document.getElementById("refreshButton");

const menuToggle =
    document.getElementById("menuToggle");

const sidebar =
    document.getElementById("sidebar");

const logoutButton =
    document.getElementById("logoutButton");

const closeModal =
    document.getElementById("closeModal");

const closeStatusModal =
    document.getElementById("closeStatusModal");

const saveStatusButton =
    document.getElementById("saveStatusButton");

const ordersTableBody =
    document.getElementById("ordersTableBody");

const emptyState =
    document.getElementById("emptyState");

const totalOrders =
    document.getElementById("totalOrders");

const pendingOrders =
    document.getElementById("pendingOrders");

const completedOrders =
    document.getElementById("completedOrders");

const cancelledOrders =
    document.getElementById("cancelledOrders");

const showingStart =
    document.getElementById("showingStart");

const showingEnd =
    document.getElementById("showingEnd");

const showingTotal =
    document.getElementById("showingTotal");

const pagination =
    document.getElementById("pagination");

const orderModal =
    document.getElementById("orderModal");

const modalOrderId =
    document.getElementById("modalOrderId");

const modalBody =
    document.getElementById("modalBody");

const statusModal =
    document.getElementById("statusModal");

const newStatus =
    document.getElementById("newStatus");


/* =========================================================
   LOAD ORDERS
   ========================================================= */

async function loadOrders() {
    try {
        console.log("Loading orders from admin API...");

        const response = await fetch("/api/admin/orders", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        console.log("Orders API Status:", response.status);

        if (!response.ok) {
            throw new Error(
                "Failed to load orders. HTTP Status: " + response.status
            );
        }

        const data = await response.json();

        console.log("Orders API Response:", data);

        if (!data.success) {
            throw new Error(
                data.message || "Failed to load orders"
            );
        }

        // Normalize the API response to the fields used by this page
        orders = Array.isArray(data.orders)
            ? data.orders.map(function(order) {
                return normalizeOrder(order || {});
            })
            : [];

        console.log("Total Orders Loaded:", orders.length);

        // Update statistics
        updateStatistics();

        // Apply filters
        applyFilters();

    } catch (error) {
        console.error("Load Orders Error:", error);

        orders = [];
        filteredOrders = [];

        updateStatistics();

        const tableBody =
            document.getElementById("ordersTableBody");

        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center; padding:30px;">
                        <strong>Unable to load orders</strong>
                        <br>
                        <span style="color:#777;">
                            ${error.message}
                        </span>
                    </td>
                </tr>
            `;
        }
    }
}


/* =========================================================
   NORMALIZE ORDER
   ========================================================= */

function normalizeOrder(order) {

    /*
     * USER ID FIX
     *
     * Backend may return:
     *
     * user_id
     *
     * or
     *
     * userId
     *
     * or
     *
     * userID
     */

    const userId =
        order.user_id ??
        order.userId ??
        order.userID ??
        null;


    return {

        id:
            order.id ??
            order.order_id ??
            order.orderId ??
            "",


        /*
         * USER ID
         */

        user_id:
            userId,


        customer:
            order.customer_name ??
            order.customerName ??
            order.name ??
            "Unknown Customer",


        email:
            order.email ??
            order.customer_email ??
            "",


        phone:
            order.phone ??
            order.customer_phone ??
            "",


        address:
            order.address ??
            order.customer_address ??
            "",

        city:
            order.city ??
            order.customer_city ??
            "",

        state:
            order.state ??
            order.customer_state ??
            "",

        pincode:
            order.pincode ??
            order.zip ??
            order.zipcode ??
            "",


        payment:
            order.payment_method ??
            order.paymentMethod ??
            order.payment ??
            "COD",


        subtotal:
            Number(
                order.subtotal ??
                0
            ),


        shipping:
            Number(
                order.shipping ??
                order.shipping_charge ??
                0
            ),


        total:
            Number(
                order.total_amount ??
                order.total ??
                order.grand_total ??
                0
            ),


        status:
            String(
                order.status ??
                "pending"
            ).toLowerCase(),


        date:
            order.created_at ??
            order.createdAt ??
            order.date ??
            "",


        products:
            order.products ??
            order.items ??
            []

    };

}


/* =========================================================
   APPLY FILTERS
   ========================================================= */

function applyFilters() {

    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const status =
        statusFilter
            ? statusFilter.value.toLowerCase()
            : "all";


    const payment =
        paymentFilter
            ? paymentFilter.value.toLowerCase()
            : "all";


    const date =
        dateFilter
            ? dateFilter.value
            : "all";


    filteredOrders =
        orders.filter(function(order) {


            /* =========================
               SEARCH
            ========================== */

            const searchText = [

                order.id,

                order.user_id,

                order.customer,

                order.email,

                order.phone,

                order.payment,

                order.status

            ]
            .map(function(value) {

                return String(
                    value ?? ""
                ).toLowerCase();

            })
            .join(" ");


            if (
                search &&
                !searchText.includes(search)
            ) {

                return false;

            }


            /* =========================
               STATUS FILTER
            ========================== */

            if (
                status !== "all" &&
                order.status !== status
            ) {

                return false;

            }


            /* =========================
               PAYMENT FILTER
            ========================== */

            if (
                payment !== "all"
            ) {

                const orderPayment =
                    String(
                        order.payment ?? ""
                    ).toLowerCase();


                if (
                    !orderPayment.includes(payment)
                ) {

                    return false;

                }

            }


            /* =========================
               DATE FILTER
            ========================== */

            if (
                date !== "all" &&
                !checkDateFilter(
                    order.date,
                    date
                )
            ) {

                return false;

            }


            return true;

        });


    currentPage = 1;


    renderOrders();

}


/* =========================================================
   DATE FILTER
   ========================================================= */

function checkDateFilter(
    orderDate,
    filter
) {

    if (!orderDate) {

        return false;

    }


    const date =
        new Date(orderDate);


    if (isNaN(date.getTime())) {

        return false;

    }


    const now =
        new Date();


    if (filter === "today") {

        return (
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
        );

    }


    if (filter === "week") {

        const weekAgo =
            new Date();

        weekAgo.setDate(
            now.getDate() - 7
        );


        return date >= weekAgo;

    }


    if (filter === "month") {

        return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
        );

    }


    return true;

}


/* =========================================================
   RENDER ORDERS
   ========================================================= */

function renderOrders() {

    if (!ordersTableBody) {

        return;

    }


    ordersTableBody.innerHTML = "";


    const total =
        filteredOrders.length;


    if (total === 0) {

        if (emptyState) {

            emptyState.style.display =
                "block";

        }


        updatePaginationInfo(
            0,
            0,
            0
        );


        if (pagination) {

            pagination.innerHTML = "";

        }


        return;

    }


    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    const startIndex =
        (currentPage - 1) *
        ordersPerPage;


    const endIndex =
        Math.min(
            startIndex + ordersPerPage,
            total
        );


    const pageOrders =
        filteredOrders.slice(
            startIndex,
            endIndex
        );


    pageOrders.forEach(function(order) {

        const row =
            createOrderRow(order);

        ordersTableBody.appendChild(row);

    });


    updatePaginationInfo(
        startIndex + 1,
        endIndex,
        total
    );


    renderPagination(
        total
    );

}


/* =========================================================
   CREATE ORDER ROW
   ========================================================= */

function createOrderRow(order) {

    const row =
        document.createElement("tr");


    const orderId =
        escapeHTML(
            String(order.id ?? "")
        );


    const customer =
        escapeHTML(
            String(
                order.customer ??
                order.customer_name ??
                order.name ??
                "-"
            )
        );


    const date =
        formatDate(
            order.date ??
            order.created_at ??
            order.createdAt ??
            ""
        );


    const payment =
        escapeHTML(
            String(
                order.payment ??
                order.payment_method ??
                order.paymentMethod ??
                "-"
            )
        );


    const total =
        formatCurrency(
            Number(
                order.total ??
                order.total_amount ??
                order.grand_total ??
                0
            )
        );


    const status =
        getStatusHTML(
            order.status
        );


    row.innerHTML = `

        <td>

            <strong>
                #${orderId}
            </strong>

        </td>


        <td>

            <div class="customer-info">

                <strong>
                    ${customer}
                </strong>

            </div>

        </td>


        <td>

            ${date}

        </td>


        <td>

            <span class="payment-badge">

                ${payment}

            </span>

        </td>


        <td>

            <strong>

                ${total}

            </strong>

        </td>


        <td>

            ${status}

        </td>


        <td>

            <div class="action-buttons">


                <button
                    class="view-button"
                    onclick="viewOrder(${order.id})"
                    title="View Order"
                >

                    <i class="fa-solid fa-eye"></i>

                </button>


                <button
                    class="print-button"
                    onclick="printOrderInvoice(${order.id})"
                    title="Print Invoice"
                >

                    <i class="fa-solid fa-print"></i>

                </button>


                <button
                    class="status-button"
                    onclick="openStatusModal(${order.id})"
                    title="Update Status"
                >

                    <i class="fa-solid fa-pen-to-square"></i>

                </button>


                <button
                    class="delete-button"
                    onclick="deleteOrder(${order.id})"
                    title="Delete Order"
                >

                    <i class="fa-regular fa-trash-can"></i>

                </button>


            </div>

        </td>

    `;


    return row;

}


/* =========================================================
   STATUS HTML
   ========================================================= */

function getStatusHTML(status) {

    const safeStatus =
        String(
            status || "pending"
        ).toLowerCase();


    const label =
        safeStatus.charAt(0).toUpperCase() +
        safeStatus.slice(1);


    return `

        <span class="status-badge status-${escapeHTML(safeStatus)}">

            ${escapeHTML(label)}

        </span>

    `;

}


/* =========================================================
   GLOBAL STATE FOR ACTIVE ORDER
   ========================================================= */

let currentViewOrderId = null;

/* =========================================================
   VIEW ORDER
   ========================================================= */

function viewOrder(orderId) {

    const order =
        orders.find(function(item) {

            return String(item.id) ===
                String(orderId);

        });


    if (!order) {

        alert(
            "Order not found."
        );

        return;

    }

    currentViewOrderId = order.id;


    if (modalOrderId) {

        modalOrderId.textContent =
            "#" + order.id;

    }

    const modalOrderStatusBadge =
        document.getElementById("modalOrderStatusBadge");

    if (modalOrderStatusBadge) {

        const safeStatus =
            String(order.status || "pending").toLowerCase();

        modalOrderStatusBadge.className =
            `modal-status-badge status-${escapeHTML(safeStatus)}`;

        modalOrderStatusBadge.textContent =
            safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1);

    }

    const modalOrderDateText =
        document.getElementById("modalOrderDateText");

    if (modalOrderDateText) {

        modalOrderDateText.textContent =
            formatDate(order.date);

    }


    if (!modalBody) {

        return;

    }


    const userId =
        order.user_id !== null &&
        order.user_id !== undefined &&
        order.user_id !== ""
            ? escapeHTML(
                String(order.user_id)
              )
            : "Guest";

    const customerName =
        escapeHTML(String(order.customer || "Unknown"));

    const email =
        escapeHTML(String(order.email || "No email"));

    const phone =
        escapeHTML(String(order.phone || "No phone"));

    // Full address formatting
    const fullAddressParts =
        [order.address, order.city, order.state, order.pincode].filter(function(part) {
            return part && String(part).trim().length > 0 && String(part).trim() !== "null";
        });

    const formattedAddress =
        fullAddressParts.length > 0
            ? escapeHTML(fullAddressParts.join(", "))
            : escapeHTML(String(order.address || "No address provided"));

    const paymentMethod =
        escapeHTML(String(order.payment || "COD"));

    const paymentIcon =
        (paymentMethod.toLowerCase().includes("online") || paymentMethod.toLowerCase().includes("card") || paymentMethod.toLowerCase().includes("stripe"))
            ? "fa-solid fa-credit-card"
            : (paymentMethod.toLowerCase().includes("upi"))
            ? "fa-solid fa-mobile-screen-button"
            : "fa-solid fa-money-bill-wave";

    // Products table rows
    let itemsTableHTML = "";
    const products =
        Array.isArray(order.products) ? order.products : [];

    if (products.length > 0) {

        itemsTableHTML = products.map(function(product) {

            const productName =
                escapeHTML(String(product.name ?? product.product_name ?? "Product"));

            const quantity =
                Number(product.quantity ?? product.qty ?? 1);

            const unitPrice =
                Number(product.price ?? product.product_price ?? 0);

            const lineTotal =
                unitPrice * quantity;

            // Image handling
            let imageHTML = `<div class="item-thumbnail-placeholder"><i class="fa-solid fa-box"></i></div>`;
            let rawImg = product.image || product.variant_image || "";

            if (rawImg && typeof rawImg === "string" && rawImg.trim() !== "" && rawImg !== "null") {
                if (rawImg.startsWith("[")) {
                    try {
                        const parsed = JSON.parse(rawImg);
                        if (Array.isArray(parsed) && parsed.length > 0) rawImg = parsed[0];
                    } catch (e) {}
                }
                if (rawImg && !rawImg.startsWith("[")) {
                    imageHTML = `<img src="${rawImg}" alt="${productName}" class="item-thumbnail" onerror="this.outerHTML='<div class=\\'item-thumbnail-placeholder\\'><i class=\\'fa-solid fa-box\\'></i></div>'">`;
                }
            }

            // Attributes (size, color)
            let metaChips = [];
            if (product.size && String(product.size).trim() !== "") {
                metaChips.push(`<span class="item-meta-tag">Size: ${escapeHTML(String(product.size))}</span>`);
            }
            if (product.color && String(product.color).trim() !== "") {
                metaChips.push(`<span class="item-meta-tag">Color: ${escapeHTML(String(product.color))}</span>`);
            }
            const metaHTML = metaChips.length > 0 ? `<div class="item-meta-tags">${metaChips.join("")}</div>` : "";

            return `
                <tr>
                    <td>
                        <div class="item-product-info">
                            ${imageHTML}
                            <div class="item-title-meta">
                                <strong>${productName}</strong>
                                ${metaHTML}
                            </div>
                        </div>
                    </td>
                    <td class="text-center font-medium">${formatCurrency(unitPrice)}</td>
                    <td class="text-center"><span class="item-qty-badge">× ${quantity}</span></td>
                    <td class="text-right font-bold">${formatCurrency(lineTotal)}</td>
                </tr>
            `;

        }).join("");

    } else {

        itemsTableHTML = `
            <tr>
                <td colspan="4" style="text-align:center; padding: 24px; color: #94a3b8;">
                    <i class="fa-solid fa-box-open" style="font-size: 24px; display:block; margin-bottom: 8px;"></i>
                    No product details recorded for this order.
                </td>
            </tr>
        `;

    }

    const safeStatus =
        String(order.status || "pending").toLowerCase();

    const statusLabel =
        safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1);

    modalBody.innerHTML = `
        <!-- TOP TWO INFO CARDS -->
        <div class="modal-cards-grid">
            <!-- Customer Information Card -->
            <div class="modal-info-card">
                <div class="modal-card-header">
                    <i class="fa-solid fa-user-circle"></i>
                    <span>Customer Details</span>
                </div>
                <div class="modal-info-rows">
                    <div class="modal-info-row">
                        <span class="row-label">Customer Name</span>
                        <div class="row-value customer-name-badge">
                            <strong>${customerName}</strong>
                            <span class="user-id-chip">User #${userId}</span>
                        </div>
                    </div>
                    <div class="modal-info-row">
                        <span class="row-label">Email Address</span>
                        <span class="row-value" style="color: #2563eb;">${email}</span>
                    </div>
                    <div class="modal-info-row">
                        <span class="row-label">Phone Number</span>
                        <span class="row-value">${phone}</span>
                    </div>
                </div>
            </div>

            <!-- Shipping & Payment Card -->
            <div class="modal-info-card">
                <div class="modal-card-header">
                    <i class="fa-solid fa-truck-fast"></i>
                    <span>Delivery & Payment</span>
                </div>
                <div class="modal-info-rows">
                    <div class="modal-info-row">
                        <span class="row-label">Shipping Address</span>
                        <span class="row-value address-text">
                            <i class="fa-solid fa-location-dot" style="color: #ef4444; margin-right: 4px;"></i>
                            ${formattedAddress}
                        </span>
                    </div>
                    <div class="modal-info-row">
                        <span class="row-label">Payment Mode</span>
                        <span class="row-value">
                            <span class="payment-method-chip">
                                <i class="${paymentIcon}"></i> ${paymentMethod}
                            </span>
                        </span>
                    </div>
                    <div class="modal-info-row">
                        <span class="row-label">Current Status</span>
                        <span class="row-value">
                            <span class="status-badge status-${escapeHTML(safeStatus)}">${escapeHTML(statusLabel)}</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- ORDER ITEMS TABLE -->
        <div class="modal-items-card">
            <div class="modal-card-header">
                <i class="fa-solid fa-bag-shopping"></i>
                <span>Order Items (${products.length})</span>
            </div>
            <div class="order-items-table-container">
                <table class="order-items-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th class="text-center" style="width: 100px;">Price</th>
                            <th class="text-center" style="width: 80px;">Qty</th>
                            <th class="text-right" style="width: 110px;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsTableHTML}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- SUMMARY BREAKDOWN -->
        <div class="modal-summary-section">
            <div class="modal-summary-box">
                <div class="summary-row">
                    <span>Subtotal</span>
                    <strong>${formatCurrency(order.subtotal || 0)}</strong>
                </div>
                <div class="summary-row">
                    <span>Shipping Fee</span>
                    <strong>${(order.shipping && order.shipping > 0) ? formatCurrency(order.shipping) : '<span style="color:#10b981;">Free</span>'}</strong>
                </div>
                <div class="summary-divider"></div>
                <div class="summary-row total-row">
                    <span class="total-label">Total Amount</span>
                    <strong class="total-value">${formatCurrency(order.total || 0)}</strong>
                </div>
            </div>
        </div>
    `;

    if (orderModal) {

        orderModal.style.display =
            "flex";

    }

}


/* =========================================================
   PRINT ORDER INVOICE
   ========================================================= */

function printOrderInvoice(orderId) {

    const order =
        orders.find(function(item) {

            return String(item.id) ===
                String(orderId);

        });


    if (!order) {

        alert(
            "Order not found for printing."
        );

        return;

    }

    const printArea =
        document.getElementById("invoicePrintArea");

    if (!printArea) {

        window.print();

        return;

    }

    const userId =
        order.user_id !== null &&
        order.user_id !== undefined &&
        order.user_id !== ""
            ? escapeHTML(
                String(order.user_id)
              )
            : "Guest";

    const customerName =
        escapeHTML(String(order.customer || "Customer"));

    const email =
        escapeHTML(String(order.email || "-"));

    const phone =
        escapeHTML(String(order.phone || "-"));

    const fullAddressParts =
        [order.address, order.city, order.state, order.pincode].filter(function(part) {
            return part && String(part).trim().length > 0 && String(part).trim() !== "null";
        });

    const formattedAddress =
        fullAddressParts.length > 0
            ? escapeHTML(fullAddressParts.join(", "))
            : escapeHTML(String(order.address || "-"));

    const paymentMethod =
        escapeHTML(String(order.payment || "COD"));

    const orderDate =
        formatDate(order.date);

    const safeStatus =
        String(order.status || "pending").toUpperCase();

    const products =
        Array.isArray(order.products) ? order.products : [];

    let itemsPrintRows = "";

    if (products.length > 0) {

        itemsPrintRows = products.map(function(item, idx) {

            const name =
                escapeHTML(String(item.name ?? item.product_name ?? "Product"));

            const qty =
                Number(item.quantity ?? item.qty ?? 1);

            const unitPrice =
                Number(item.price ?? item.product_price ?? 0);

            const total =
                unitPrice * qty;

            let details = [];
            if (item.size) details.push(`Size: ${escapeHTML(String(item.size))}`);
            if (item.color) details.push(`Color: ${escapeHTML(String(item.color))}`);
            const detailsStr = details.length > 0 ? `<div style="font-size: 8.5pt; color: #666; margin-top: 2px;">${details.join(" | ")}</div>` : "";

            return `
                <tr>
                    <td class="text-center">${idx + 1}</td>
                    <td>
                        <strong>${name}</strong>
                        ${detailsStr}
                    </td>
                    <td class="text-center">${formatCurrency(unitPrice)}</td>
                    <td class="text-center" style="font-weight: 700;">${qty}</td>
                    <td class="text-right" style="font-weight: 700;">${formatCurrency(total)}</td>
                </tr>
            `;

        }).join("");

    } else {

        itemsPrintRows = `
            <tr>
                <td colspan="5" class="text-center" style="padding: 16px;">Standard Order Item</td>
            </tr>
        `;

    }

    printArea.innerHTML = `
        <div class="print-invoice-sheet">
            <div class="print-header">
                <div class="print-logo">
                    <h1>MY<span>STORE</span></h1>
                    <p>Official Order Invoice & Receipt</p>
                </div>
                <div class="print-invoice-meta">
                    <h2>INVOICE #${order.id}</h2>
                    <div class="print-meta-row"><strong>Date:</strong> ${orderDate}</div>
                    <div class="print-meta-row"><strong>Status:</strong> <span class="print-status-tag">${safeStatus}</span></div>
                    <div class="print-meta-row"><strong>Payment:</strong> ${paymentMethod}</div>
                </div>
            </div>

            <div class="print-addresses">
                <div class="print-address-col">
                    <h3>Billed To</h3>
                    <p><strong>${customerName}</strong> (ID: #${userId})</p>
                    <p>Email: ${email}</p>
                    <p>Phone: ${phone}</p>
                </div>
                <div class="print-address-col">
                    <h3>Shipping Address</h3>
                    <p><strong>${customerName}</strong></p>
                    <p>${formattedAddress}</p>
                    <p>Phone: ${phone}</p>
                </div>
            </div>

            <table class="print-table">
                <thead>
                    <tr>
                        <th style="width: 40px;" class="text-center">#</th>
                        <th>Item Description</th>
                        <th style="width: 100px;" class="text-center">Price</th>
                        <th style="width: 60px;" class="text-center">Qty</th>
                        <th style="width: 110px;" class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsPrintRows}
                </tbody>
            </table>

            <div class="print-summary-wrap">
                <table class="print-summary-table">
                    <tr>
                        <td>Subtotal:</td>
                        <td class="text-right"><strong>${formatCurrency(order.subtotal || 0)}</strong></td>
                    </tr>
                    <tr>
                        <td>Shipping:</td>
                        <td class="text-right"><strong>${formatCurrency(order.shipping || 0)}</strong></td>
                    </tr>
                    <tr class="print-total-row">
                        <td>Total Amount:</td>
                        <td class="text-right">${formatCurrency(order.total || 0)}</td>
                    </tr>
                </table>
            </div>

            <div class="print-footer-notes">
                <p>Thank you for shopping with MyStore!</p>
                <p>This is a computer-generated invoice and does not require a physical signature.</p>
                <p style="margin-top: 4px; font-size: 8pt; color: #999;">Generated on ${new Date().toLocaleString()}</p>
            </div>
        </div>
    `;

    setTimeout(function() {
        window.print();
    }, 150);

}


/* =========================================================
   OPEN STATUS MODAL
   ========================================================= */

function openStatusModal(orderId) {

    selectedOrderId =
        orderId;


    const order =
        orders.find(function(item) {

            return String(item.id) ===
                String(orderId);

        });


    if (!order) {

        return;

    }


    if (newStatus) {

        newStatus.value =
            order.status;

    }


    if (statusModal) {

        statusModal.style.display =
            "flex";

    }

}


/* =========================================================
   SAVE STATUS
   ========================================================= */

async function saveOrderStatus() {

    if (!selectedOrderId) {

        return;

    }


    const status =
        newStatus
            ? newStatus.value
            : "pending";


    try {

        saveStatusButton.disabled =
            true;


        saveStatusButton.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';


        const response =
            await fetch(
                "/api/orders/" +
                selectedOrderId,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        status: status
                    })
                }
            );


        const result =
            await response.json();


        console.log(
            "Update Status Response:",
            result
        );


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to update status"
            );

        }


        const order =
            orders.find(function(item) {

                return String(item.id) ===
                    String(selectedOrderId);

            });


        if (order) {

            order.status =
                status;

        }


        applyFilters();

        updateStatistics();


        if (statusModal) {

            statusModal.style.display =
                "none";

        }


        alert(
            "Order status updated successfully."
        );

    }

    catch (error) {

        console.error(
            "Status Update Error:",
            error
        );


        alert(
            "Failed to update order status."
        );

    }

    finally {

        saveStatusButton.disabled =
            false;

        saveStatusButton.innerHTML =
            '<i class="fa-solid fa-check"></i> Save Status';

    }

}


/* =========================================================
   DELETE ORDER
   ========================================================= */

async function deleteOrder(orderId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete Order #" +
            orderId +
            "?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                "/api/orders/" +
                orderId,
                {
                    method: "DELETE"
                }
            );


        const result =
            await response.json();


        console.log(
            "Delete Order Response:",
            result
        );


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to delete order"
            );

        }


        orders =
            orders.filter(function(order) {

                return String(order.id) !==
                    String(orderId);

            });


        updateStatistics();

        applyFilters();


        alert(
            "Order deleted successfully."
        );

    }

    catch (error) {

        console.error(
            "Delete Order Error:",
            error
        );


        alert(
            "Failed to delete order."
        );

    }

}


/* =========================================================
   UPDATE STATISTICS
   ========================================================= */

function updateStatistics() {

    const total =
        orders.length;


    let pending = 0;

    let completed = 0;

    let cancelled = 0;


    orders.forEach(function(order) {

        const status =
            String(
                order.status || ""
            ).toLowerCase();


        if (status === "pending") {

            pending++;

        }


        if (status === "completed") {

            completed++;

        }


        if (status === "cancelled") {

            cancelled++;

        }

    });


    if (totalOrders) {

        totalOrders.textContent =
            total;

    }


    if (pendingOrders) {

        pendingOrders.textContent =
            pending;

    }


    if (completedOrders) {

        completedOrders.textContent =
            completed;

    }


    if (cancelledOrders) {

        cancelledOrders.textContent =
            cancelled;

    }

}


/* =========================================================
   PAGINATION
   ========================================================= */

function renderPagination(total) {

    if (!pagination) {

        return;

    }


    pagination.innerHTML = "";


    const totalPages =
        Math.ceil(
            total / ordersPerPage
        );


    if (totalPages <= 1) {

        return;

    }


    /* Previous */

    const previousButton =
        document.createElement("button");


    previousButton.innerHTML =
        '<i class="fa-solid fa-chevron-left"></i> Prev';


    previousButton.disabled =
        currentPage === 1;


    previousButton.addEventListener(
        "click",
        function() {

            if (currentPage > 1) {

                currentPage--;

                renderOrders();

            }

        }
    );


    pagination.appendChild(
        previousButton
    );


    /* Page Numbers */

    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const pageButton =
            document.createElement("button");


        pageButton.textContent =
            page;


        if (page === currentPage) {

            pageButton.classList.add(
                "active"
            );

        }


        pageButton.addEventListener(
            "click",
            function() {

                currentPage =
                    page;

                renderOrders();

            }
        );


        pagination.appendChild(
            pageButton
        );

    }


    /* Next */

    const nextButton =
        document.createElement("button");


    nextButton.innerHTML =
        'Next <i class="fa-solid fa-chevron-right"></i>';


    nextButton.disabled =
        currentPage === totalPages;


    nextButton.addEventListener(
        "click",
        function() {

            if (
                currentPage <
                totalPages
            ) {

                currentPage++;

                renderOrders();

            }

        }
    );


    pagination.appendChild(
        nextButton
    );

}


/* =========================================================
   PAGINATION INFORMATION
   ========================================================= */

function updatePaginationInfo(
    start,
    end,
    total
) {

    if (showingStart) {

        showingStart.textContent =
            start;

    }


    if (showingEnd) {

        showingEnd.textContent =
            end;

    }


    if (showingTotal) {

        showingTotal.textContent =
            total;

    }

}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(dateValue) {

    if (!dateValue) {

        return "-";

    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {

        return "-";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   FORMAT CURRENCY
   ========================================================= */

function formatCurrency(amount) {

    const number =
        Number(amount) || 0;


    return "₹" +
        number.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   SHOW LOADING
   ========================================================= */

function showLoading() {

    if (!ordersTableBody) {

        return;

    }


    ordersTableBody.innerHTML = `

        <tr>

            <td
                colspan="8"
                style="text-align:center;padding:40px;"
            >

                Loading orders...

            </td>

        </tr>

    `;


    if (emptyState) {

        emptyState.style.display =
            "none";

    }

}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */


/* Search */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function() {

            applyFilters();

        }
    );

}


/* Status */

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        function() {

            applyFilters();

        }
    );

}


/* Payment */

if (paymentFilter) {

    paymentFilter.addEventListener(
        "change",
        function() {

            applyFilters();

        }
    );

}


/* Date */

if (dateFilter) {

    dateFilter.addEventListener(
        "change",
        function() {

            applyFilters();

        }
    );

}


/* Refresh */

if (refreshButton) {

    refreshButton.addEventListener(
        "click",
        function() {

            loadOrders();

        }
    );

}


/* Mobile Menu */

if (menuToggle) {

    menuToggle.addEventListener(
        "click",
        function() {

            if (sidebar) {

                sidebar.classList.toggle(
                    "open"
                );

            }

        }
    );

}


/* Close Order Modal */

if (closeModal) {

    closeModal.addEventListener(
        "click",
        function() {

            if (orderModal) {

                orderModal.style.display =
                    "none";

            }

        }
    );

}

const closeModalFooterBtn =
    document.getElementById("closeModalFooterBtn");

if (closeModalFooterBtn) {

    closeModalFooterBtn.addEventListener(
        "click",
        function() {

            if (orderModal) {

                orderModal.style.display =
                    "none";

            }

        }
    );

}

/* Print from Order Modal Header */
const printModalOrderBtn =
    document.getElementById("printModalOrderBtn");

if (printModalOrderBtn) {

    printModalOrderBtn.addEventListener(
        "click",
        function() {

            if (currentViewOrderId) {

                printOrderInvoice(currentViewOrderId);

            }

        }
    );

}

/* Print from Order Modal Footer */
const printModalFooterBtn =
    document.getElementById("printModalFooterBtn");

if (printModalFooterBtn) {

    printModalFooterBtn.addEventListener(
        "click",
        function() {

            if (currentViewOrderId) {

                printOrderInvoice(currentViewOrderId);

            }

        }
    );

}

/* Quick Status Change from Modal */
const modalStatusQuickBtn =
    document.getElementById("modalStatusQuickBtn");

if (modalStatusQuickBtn) {

    modalStatusQuickBtn.addEventListener(
        "click",
        function() {

            if (currentViewOrderId) {

                openStatusModal(currentViewOrderId);

            }

        }
    );

}


/* Close Status Modal */

if (closeStatusModal) {

    closeStatusModal.addEventListener(
        "click",
        function() {

            if (statusModal) {

                statusModal.style.display =
                    "none";

            }

        }
    );

}


/* Save Status */

if (saveStatusButton) {

    saveStatusButton.addEventListener(
        "click",
        function() {

            saveOrderStatus();

        }
    );

}


/* Close modal when clicking outside */

window.addEventListener(
    "click",
    function(event) {

        if (
            event.target === orderModal
        ) {

            orderModal.style.display =
                "none";

        }


        if (
            event.target === statusModal
        ) {

            statusModal.style.display =
                "none";

        }

    }
);


/* Logout */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function() {

            const confirmed =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmed) {

                return;

            }


            localStorage.removeItem(
                "adminToken"
            );


            localStorage.removeItem(
                "admin"
            );


            window.location.href =
                "/login.html";

        }
    );

}


/* =========================================================
   INITIAL LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadOrders();

    }
);


/* =========================================================
   MAKE FUNCTIONS AVAILABLE TO HTML
   ========================================================= */

window.viewOrder =
    viewOrder;

window.openStatusModal =
    openStatusModal;

window.deleteOrder =
    deleteOrder;

window.printOrderInvoice =
    printOrderInvoice;