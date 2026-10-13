// ==========================================
// MY ORDERS JAVASCRIPT
// ==========================================

console.log("Orders JS Loaded");


// ==========================================
// ELEMENTS
// ==========================================

const ordersContainer =
    document.getElementById(
        "ordersContainer"
    );

const ordersLoading =
    document.getElementById(
        "ordersLoading"
    );

const emptyOrders =
    document.getElementById(
        "emptyOrders"
    );


// ==========================================
// GET USER ID
// ==========================================

function getUserId() {

    let userId =
        localStorage.getItem("userId");


    if (userId) {

        return Number(userId);

    }


    const user =
        localStorage.getItem("user");


    if (user) {

        try {

            const userData =
                JSON.parse(user);

            return Number(
                userData.id ||
                userData.user_id
            );

        } catch (error) {

            console.error(
                "User data error:",
                error
            );

        }

    }


    return null;

}


function getUserEmail() {

    const user =
        localStorage.getItem("user");


    if (!user) {

        return "";

    }


    try {

        const userData =
            JSON.parse(user);

        return userData.email || "";

    } catch (error) {

        return "";

    }

}


// ==========================================
// LOAD ORDERS
// ==========================================

async function loadOrders() {

    const userId =
        getUserId();


    if (!userId) {

        ordersLoading.style.display =
            "none";

        ordersContainer.innerHTML = `

            <div class="empty-orders">

                <div class="empty-order-icon">
                    🔐
                </div>

                <h2>
                    Please Login
                </h2>

                <p>
                    Login to view your orders.
                </p>

                <a
                    href="/login.html"
                    class="shop-button"
                >
                    Login
                </a>

            </div>

        `;

        return;

    }


    try {

        const email =
            getUserEmail();

        const response =
            await fetch(
                `/api/orders?user_id=${encodeURIComponent(
                    userId
                )}&email=${encodeURIComponent(email)}`
            );


        const data =
            await response.json();


        ordersLoading.style.display =
            "none";


        if (!data.success) {

            throw new Error(
                data.message ||
                "Failed to load orders."
            );

        }


        const orders =
            data.orders || [];

        const headerActions = document.getElementById("ordersHeaderActions");

        if (orders.length === 0) {

            if (headerActions) headerActions.style.display = "none";
            emptyOrders.style.display =
                "block";

            return;

        }


        if (headerActions) headerActions.style.display = "block";
        emptyOrders.style.display =
            "none";


        displayOrders(
            orders
        );


    } catch (error) {

        console.error(
            "Orders Error:",
            error
        );

        const headerActions = document.getElementById("ordersHeaderActions");
        if (headerActions) headerActions.style.display = "none";

        ordersLoading.style.display =
            "none";


        ordersContainer.innerHTML = `

            <div class="empty-orders">

                <h2>
                    Unable to load orders
                </h2>

                <p>
                    ${escapeHtml(error.message)}
                </p>

            </div>

        `;

    }

}


// ==========================================
// DISPLAY ORDERS
// ==========================================

function displayOrders(orders) {

    ordersContainer.innerHTML =
        "";


    orders.forEach(
        function (order) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "order-card";


            const orderId =
                order.id ||
                order.order_id;


            const total =
                Number(
                    order.total ??
                    order.total_amount ??
                    (Number(order.subtotal || 0) +
                        Number(order.shipping || 0))
                );


            const date =
                order.created_at
                    ? new Date(
                        order.created_at
                    ).toLocaleDateString(
                        "en-IN"
                    )
                    : "N/A";


            const status =
                normalizeStatus(
                    order.status ||
                    "Pending"
                );


            const canCancel =
                status.className === "pending" ||
                status.className === "processing";

            const items = order.items || [];

            let productsHtml = "";

            if (items && items.length > 0) {

                productsHtml = `
                    <div class="order-items-preview">
                        ${items.map(function (item) {
                            const productName =
                                item.product_name ||
                                item.product_name_from_products ||
                                item.name ||
                                "Product";

                            const img =
                                formatImageUrl(item.image);

                            const qty =
                                Number(item.quantity || 1);

                            const price =
                                Number(item.price || 0);

                            const itemTotal =
                                price * qty;

                            const isDelivered = status.className === "delivered" || (order.status && String(order.status).toLowerCase() === "delivered");
                            const productId = item.product_id || item.id;
                            const prodLink = productId ? `product-details.html?id=${encodeURIComponent(productId)}` : 'javascript:void(0);';
                            const rateBtnHtml = (isDelivered && productId) ? `
                                <div class="order-item-rate-wrap" style="margin-top:6px;">
                                    <button type="button" class="btn-rate-order-item" onclick="openProductReviewModal(${Number(productId)}, ${JSON.stringify(productName)}, ${JSON.stringify(img)})">
                                        <i class="fa-solid fa-star" style="color:#f59e0b;"></i> Rate &amp; Review
                                    </button>
                                </div>
                            ` : '';

                            return `
                                <div class="order-item-row">
                                    <a href="${prodLink}" class="order-item-img-link" title="${escapeHtml(productName)}">
                                        <img
                                            src="${img}"
                                            alt="${escapeHtml(productName)}"
                                            class="order-item-thumb"
                                            onerror="this.src='/images/placeholder.jpg'"
                                        >
                                    </a>
                                    <div class="order-item-details">
                                        <a href="${prodLink}" class="order-item-title" title="${escapeHtml(productName)}">
                                            ${escapeHtml(productName)}
                                        </a>
                                        <div class="order-item-submeta">
                                            <span class="order-item-qty">Qty: <strong>${qty}</strong></span>
                                            <span class="order-item-sep">•</span>
                                            <span class="order-item-unitprice">₹${price.toFixed(2)} each</span>
                                        </div>
                                    </div>
                                    <div class="order-item-total-col" style="display:flex;flex-direction:column;align-items:flex-end;">
                                        <div>₹${itemTotal.toFixed(2)}</div>
                                        ${rateBtnHtml}
                                    </div>
                                </div>
                            `;
                        }).join("")}
                    </div>
                `;

            }


            card.innerHTML = `

                <div class="order-top">

                    <div>

                        <div class="order-number">

                            Order #${orderId}

                        </div>

                        <div class="order-date">

                            ${date}

                        </div>

                    </div>


                    <span
                        class="order-status status-${status.className}"
                    >

                        ${status.label}

                    </span>

                </div>

                ${productsHtml}

                <div class="order-info">


                    <div class="order-info-box">

                        <span class="order-info-label">

                            Total Amount

                        </span>

                        <span class="order-info-value">

                            ₹${total.toFixed(2)}

                        </span>

                    </div>


                    <div class="order-info-box">

                        <span class="order-info-label">

                            Payment Method

                        </span>

                        <span class="order-info-value">

                            ${escapeHtml(
                                order.payment_method ||
                                "N/A"
                            )}

                        </span>

                    </div>


                    <div class="order-info-box">

                        <span class="order-info-label">

                            Order Status

                        </span>

                        <span class="order-info-value">

                            ${status.label}

                        </span>

                    </div>


                </div>


                <div class="order-actions">

                    <button
                        class="view-order-button"
                        onclick="viewOrder(${orderId})"
                    >
                        <i class="fa-solid fa-eye"></i> View Details
                    </button>


                    <button
                        class="cancel-order-button"
                        onclick="cancelOrder(${orderId})"
                        ${canCancel ? "" : "disabled"}
                    >
                        <i class="fa-solid fa-ban"></i> Cancel Order
                    </button>

                    <button
                        class="delete-order-button"
                        onclick="deleteOrder(${orderId})"
                    >
                        <i class="fa-solid fa-trash-can"></i> Delete
                    </button>

                </div>

            `;


            ordersContainer.appendChild(
                card
            );

        }
    );

}


// ==========================================
// VIEW ORDER
// ==========================================

function viewOrder(orderId) {

    window.location.href =
        `/order-details.html?id=${orderId}`;

}


// ==========================================
// CANCEL ORDER
// ==========================================

async function cancelOrder(orderId) {

    const userId =
        getUserId();


    if (!userId) {

        alert(
            "Please login first."
        );

        return;

    }


    const confirmed =
        confirm(
            `Are you sure you want to cancel Order #${orderId}?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/orders/${orderId}/cancel`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            user_id:
                                userId

                        })

                }
            );


        const data =
            await response.json();


        if (!data.success) {

            alert(
                data.message ||
                "Unable to cancel order."
            );

            return;

        }


        alert(
            "Order cancelled successfully."
        );


        loadOrders();


    } catch (error) {

        console.error(
            "Cancel Order Error:",
            error
        );


        alert(
            "Server error while cancelling order."
        );

    }

}


// ==========================================
// DELETE SINGLE ORDER
// ==========================================

async function deleteOrder(orderId) {

    const confirmed =
        confirm(
            `Are you sure you want to delete Order #${orderId}?`
        );

    if (!confirmed) {

        return;

    }

    try {

        const response =
            await fetch(
                `/api/orders/${orderId}`,
                {
                    method: "DELETE"
                }
            );

        const data =
            await response.json();

        if (!data.success) {

            alert(
                data.message ||
                "Unable to delete order."
            );

            return;

        }

        alert(
            "Order deleted successfully."
        );

        loadOrders();

    } catch (error) {

        console.error(
            "Delete Order Error:",
            error
        );

        alert(
            "Server error while deleting order."
        );

    }

}


// ==========================================
// CLEAR ALL ORDERS
// ==========================================

async function clearAllOrders() {

    const confirmed =
        confirm(
            "Are you sure you want to remove all orders? This will permanently clear your orders."
        );

    if (!confirmed) {

        return;

    }

    const userId =
        getUserId();

    try {

        const response =
            await fetch(
                `/api/orders/clear-all?user_id=${encodeURIComponent(userId || "")}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        user_id: userId
                    })
                }
            );

        const data =
            await response.json();

        if (!data.success) {

            alert(
                data.message ||
                "Unable to clear orders."
            );

            return;

        }

        alert(
            "All orders removed successfully."
        );

        loadOrders();

    } catch (error) {

        console.error(
            "Clear Orders Error:",
            error
        );

        alert(
            "Server error while clearing orders."
        );

    }

}


// ==========================================
// FORMAT IMAGE URL
// ==========================================

function formatImageUrl(image) {

    if (!image) {

        return "/images/placeholder.jpg";

    }

    let img =
        String(image).trim();

    if (img.startsWith("[") && img.endsWith("]")) {
        try {
            const parsed = JSON.parse(img);
            if (Array.isArray(parsed) && parsed.length > 0) {
                img = String(parsed[0] || "").trim();
            }
        } catch (e) {}
    }

    if (!img) {

        return "/images/placeholder.jpg";

    }

    if (
        img.startsWith("http://") ||
        img.startsWith("https://") ||
        img.startsWith("data:")
    ) {

        return img;

    }

    img =
        img.replace(/\\/g, "/");

    if (img.startsWith("./")) {

        img = img.substring(2);

    }

    if (img.startsWith("/")) {

        return img;

    }

    if (img.startsWith("images/")) {

        return "/" + img;

    }

    if (img.startsWith("uploads/")) {

        return "/" + img;

    }

    return "/images/" + img;

}


// ==========================================
// NORMALIZE STATUS
// ==========================================

function normalizeStatus(status) {

    const value =
        String(status)
            .toLowerCase()
            .trim();


    if (
        value === "out_for_delivery" ||
        value === "out-for-delivery"
    ) {

        return {

            label:
                "Out for Delivery",

            className:
                "out-for-delivery"

        };

    }


    if (value === "processing") {

        return {

            label:
                "Processing",

            className:
                "processing"

        };

    }


    if (value === "shipped") {

        return {

            label:
                "Shipped",

            className:
                "shipped"

        };

    }


    if (value === "delivered") {

        return {

            label:
                "Delivered",

            className:
                "delivered"

        };

    }


    if (value === "cancelled") {

        return {

            label:
                "Cancelled",

            className:
                "cancelled"

        };

    }


    return {

        label:
            "Pending",

        className:
            "pending"

    };

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================
// START
// ==========================================

loadOrders();

// ==========================================
// RATE & REVIEW MODAL
// ==========================================
let currentReviewProductId = null;
let currentReviewRating = 5;

function openProductReviewModal(productId, productName, productImg) {
    currentReviewProductId = productId;
    currentReviewRating = 5;

    let modalBackdrop = document.getElementById("orderReviewModalBackdrop");
    if (!modalBackdrop) {
        modalBackdrop = document.createElement("div");
        modalBackdrop.id = "orderReviewModalBackdrop";
        modalBackdrop.className = "order-review-modal-backdrop";
        modalBackdrop.innerHTML = `
            <div class="order-review-modal">
                <button type="button" class="order-review-modal-close" onclick="closeProductReviewModal()">✕</button>
                <div class="order-review-modal-product">
                    <img id="reviewModalThumb" src="" alt="Product" class="order-review-modal-thumb" onerror="this.src='/images/placeholder.jpg'">
                    <div>
                        <div style="font-size:12px;font-weight:700;color:#832729;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;">Verified Purchase</div>
                        <div id="reviewModalTitle" class="order-review-modal-title">Product Name</div>
                    </div>
                </div>

                <div style="font-size:14px;font-weight:700;color:#1e293b;text-align:center;">How would you rate this item?</div>
                <div class="order-review-modal-stars" id="reviewModalStarGroup">
                    <button type="button" data-val="1" onclick="setModalRating(1)">★</button>
                    <button type="button" data-val="2" onclick="setModalRating(2)">★</button>
                    <button type="button" data-val="3" onclick="setModalRating(3)">★</button>
                    <button type="button" data-val="4" onclick="setModalRating(4)">★</button>
                    <button type="button" data-val="5" onclick="setModalRating(5)">★</button>
                </div>
                <div class="order-review-modal-feedback" id="reviewModalFeedback">Excellent (5/5)</div>

                <label style="display:block;font-size:13px;font-weight:700;color:#475569;margin-bottom:6px;">Your Review (Optional)</label>
                <textarea id="reviewModalComment" class="order-review-modal-textarea" rows="3" placeholder="Tell other shoppers what you liked or disliked about this product..."></textarea>

                <div id="reviewModalMsg" style="display:none;margin-bottom:12px;font-size:13.5px;text-align:center;font-weight:600;"></div>

                <button type="button" id="reviewModalSubmitBtn" class="order-review-modal-submit" onclick="submitProductReviewModal()">
                    Submit Review
                </button>
            </div>
        `;
        document.body.appendChild(modalBackdrop);

        modalBackdrop.addEventListener("click", function(e) {
            if (e.target === modalBackdrop) {
                closeProductReviewModal();
            }
        });
    }

    document.getElementById("reviewModalThumb").src = productImg || "/images/placeholder.jpg";
    document.getElementById("reviewModalTitle").textContent = productName || "Product";
    document.getElementById("reviewModalComment").value = "";
    const msgEl = document.getElementById("reviewModalMsg");
    if (msgEl) {
        msgEl.style.display = "none";
        msgEl.textContent = "";
    }
    const submitBtn = document.getElementById("reviewModalSubmitBtn");
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Review";
    }

    setModalRating(5);
    setTimeout(() => {
        modalBackdrop.classList.add("active");
    }, 10);
}

function closeProductReviewModal() {
    const modalBackdrop = document.getElementById("orderReviewModalBackdrop");
    if (modalBackdrop) {
        modalBackdrop.classList.remove("active");
    }
}

function setModalRating(val) {
    currentReviewRating = Number(val);
    const starGroup = document.getElementById("reviewModalStarGroup");
    if (starGroup) {
        const buttons = starGroup.querySelectorAll("button");
        buttons.forEach((btn, idx) => {
            if (idx < currentReviewRating) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });
    }
    const feedback = document.getElementById("reviewModalFeedback");
    if (feedback) {
        const labels = ["Terrible (1/5)", "Poor (2/5)", "Average (3/5)", "Good (4/5)", "Excellent (5/5)"];
        feedback.textContent = labels[currentReviewRating - 1] || `${currentReviewRating}/5`;
    }
}

async function submitProductReviewModal() {
    const userId = getUserId();
    if (!userId) {
        alert("Please log in to submit a review.");
        window.location.href = "./login.html";
        return;
    }
    if (!currentReviewProductId) {
        alert("Product information is missing.");
        return;
    }

    const comment = document.getElementById("reviewModalComment") ? document.getElementById("reviewModalComment").value.trim() : "";
    const submitBtn = document.getElementById("reviewModalSubmitBtn");
    const msgEl = document.getElementById("reviewModalMsg");

    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
        }

        const res = await fetch("/api/reviews", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: userId,
                product_id: currentReviewProductId,
                rating: currentReviewRating,
                review: comment,
                review_text: comment
            })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to submit review");
        }

        if (msgEl) {
            msgEl.style.color = "#16a34a";
            msgEl.style.display = "block";
            msgEl.textContent = "✓ Thank you! Your review has been submitted.";
        }

        setTimeout(() => {
            closeProductReviewModal();
        }, 1200);
    } catch (err) {
        console.error("Submit Review Modal Error:", err);
        if (msgEl) {
            msgEl.style.color = "#dc2626";
            msgEl.style.display = "block";
            msgEl.textContent = "✕ " + (err.message || "Could not submit review");
        }
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit Review";
        }
    }
}