// ==========================================
// ORDER DETAILS JAVASCRIPT
// ==========================================

console.log(
    "Order Details JS Loaded"
);


// ==========================================
// GET ORDER ID
// ==========================================

const params =
    new URLSearchParams(
        window.location.search
    );


const orderId =
    params.get("id");


// ==========================================
// ELEMENTS
// ==========================================

const orderLoading =
    document.getElementById(
        "orderLoading"
    );

const orderDetailsContainer =
    document.getElementById(
        "orderDetailsContainer"
    );

const orderTitle =
    document.getElementById(
        "orderTitle"
    );

const orderSummary =
    document.getElementById(
        "orderSummary"
    );

const trackingContainer =
    document.getElementById(
        "trackingContainer"
    );

const orderItems =
    document.getElementById(
        "orderItems"
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

            console.error(error);

        }

    }


    return null;

}


// ==========================================
// LOAD ORDER
// ==========================================

async function loadOrder() {

    const userId =
        getUserId();


    if (!orderId) {

        orderLoading.textContent =
            "Order ID is missing.";

        return;

    }


    if (!userId) {

        orderLoading.innerHTML = `

            <h2>
                Please login first.
            </h2>

            <a
                href="/login.html"
                class="shop-button"
            >
                Login
            </a>

        `;

        return;

    }


    try {

        const response =
            await fetch(
                `/api/orders/${orderId}?user_id=${userId}`
            );


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message ||
                "Order not found."
            );

        }


        const order =
            data.order;


        const items =
            data.items ||
            order.items ||
            [];


        orderLoading.style.display =
            "none";


        orderDetailsContainer.style.display =
            "block";


        displayOrder(
            order,
            items
        );


    } catch (error) {

        console.error(
            "Order Details Error:",
            error
        );


        orderLoading.textContent =
            error.message;

    }

}


// ==========================================
// DISPLAY ORDER
// ==========================================

function displayOrder(
    order,
    items
) {

    const status =
        normalizeStatus(
            order.status ||
            "Pending"
        );


    const subtotal =
        Number(
            order.subtotal ??
            0
        );


    const shipping =
        Number(
            order.shipping ??
            0
        );


    const finalTotal =
        subtotal +
        shipping;


    orderTitle.textContent =
        `Order #${order.id}`;


    orderSummary.innerHTML = `

        <div class="order-top">

            <div>

                <div class="order-number">

                    Order #${order.id}

                </div>

                <div class="order-date">

                    ${order.created_at
                        ? new Date(
                            order.created_at
                        ).toLocaleString(
                            "en-IN"
                        )
                        : "N/A"}

                </div>

            </div>


            <span
                class="order-status status-${status.className}"
            >

                ${status.label}

            </span>

        </div>


        <div class="order-info">


            <div class="order-info-box">

                <span class="order-info-label">
                    Subtotal
                </span>

                <span class="order-info-value">
                    ₹${subtotal.toFixed(2)}
                </span>

            </div>


            <div class="order-info-box">

                <span class="order-info-label">
                    Shipping
                </span>

                <span class="order-info-value">
                    ₹${shipping.toFixed(2)}
                </span>

            </div>


            <div class="order-info-box">

                <span class="order-info-label">
                    Total
                </span>

                <span class="order-info-value">
                    ₹${finalTotal.toFixed(2)}
                </span>

            </div>


        </div>


        <p>
            <strong>
                Payment Method:
            </strong>

            ${escapeHtml(
                order.payment_method ||
                "N/A"
            )}
        </p>


        <p>
            <strong>
                Customer:
            </strong>

            ${escapeHtml(
                order.customer_name ||
                order.customerName ||
                "Customer"
            )}
        </p>


        <p>
            <strong>
                Phone:
            </strong>

            ${escapeHtml(
                order.phone ||
                "N/A"
            )}
        </p>


        <p>
            <strong>
                Email:
            </strong>

            ${escapeHtml(
                order.email ||
                "N/A"
            )}
        </p>

    `;


    displayTracking(
        status.className,
        order
    );


    displayItems(
        items,
        order,
        status
    );

}


// ==========================================
// TRACKING
// ==========================================

function displayTracking(
    currentStatus,
    order
) {

    const steps = [

        {
            key: "pending",
            label: "Order Placed",
            icon: "📝"
        },

        {
            key: "processing",
            label: "Processing",
            icon: "⚙️"
        },

        {
            key: "shipped",
            label: "Shipped",
            icon: "📦"
        },

        {
            key: "out-for-delivery",
            label: "Out for Delivery",
            icon: "🚚"
        },

        {
            key: "delivered",
            label: "Delivered",
            icon: "✅"
        }

    ];


    const statusIndex =
        steps.findIndex(
            step =>
                step.key ===
                currentStatus
        );


    trackingContainer.innerHTML =
        "";


    steps.forEach(
        function (step, index) {

            let className =
                "";


            if (
                currentStatus ===
                "cancelled"
            ) {

                className =
                    index === 0
                        ? "completed"
                        : "";

            } else if (
                index < statusIndex
            ) {

                className =
                    "completed";

            } else if (
                index === statusIndex
            ) {

                className =
                    "active";

            }


            const div =
                document.createElement(
                    "div"
                );


            div.className =
                `tracking-step ${className}`;


            div.innerHTML = `

                <div class="tracking-circle">

                    ${step.icon}

                </div>


                <div>

                    <div class="tracking-label">

                        ${step.label}

                    </div>

                </div>

            `;


            trackingContainer.appendChild(
                div
            );

        }
    );


    if (
        currentStatus ===
        "cancelled"
    ) {

        trackingContainer.innerHTML += `

            <div
                class="tracking-step active"
            >

                <div class="tracking-circle">
                    ❌
                </div>

                <div>

                    <div class="tracking-label">
                        Order Cancelled
                    </div>

                </div>

            </div>

        `;

    }

}


// ==========================================
// DISPLAY ITEMS
// ==========================================

function displayItems(items, order, status) {

    orderItems.innerHTML =
        "";


    if (
        !items ||
        items.length === 0
    ) {

        orderItems.innerHTML = `

            <p>
                Product details are unavailable.
            </p>

        `;

        return;

    }

    const isDelivered = (status && status.className === "delivered") || (order && String(order.status).toLowerCase() === "delivered");

    items.forEach(
        function (item) {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "order-item";


            let image =
                item.image ||
                "placeholder.jpg";

            if (typeof image === "string" && image.startsWith("[") && image.endsWith("]")) {
                try {
                    const parsed = JSON.parse(image);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        image = String(parsed[0] || "placeholder.jpg").trim();
                    }
                } catch (e) {}
            }

            if (
                !image.startsWith("/") &&
                !image.startsWith("http://") &&
                !image.startsWith("https://") &&
                !image.startsWith("data:")
            ) {

                image =
                    "/images/" + image;

            }


            const quantity =
                Number(
                    item.quantity ||
                    1
                );


            const price =
                Number(
                    item.price ||
                    0
                );

            const productName = item.product_name || item.name || "Product";
            const productId = item.product_id || item.id;
            const rateBtnHtml = (isDelivered && productId) ? `
                <div style="margin-top:6px;">
                    <button type="button" class="btn-rate-order-item" onclick="openProductReviewModal(${Number(productId)}, ${JSON.stringify(productName)}, ${JSON.stringify(image)})">
                        <i class="fa-solid fa-star" style="color:#f59e0b;"></i> Rate &amp; Review
                    </button>
                </div>
            ` : '';

            div.innerHTML = `

                <img
                    class="order-item-image"
                    src="${image}"
                    alt="${escapeHtml(
                        productName
                    )}"
                    onerror="this.src='/images/placeholder.jpg'"
                >


                <div class="order-item-info">

                    <div class="order-item-name">

                        ${escapeHtml(
                            productName
                        )}

                    </div>


                    <div class="order-item-price">

                        ₹${price.toFixed(2)}
                        ×
                        ${quantity}

                    </div>

                </div>


                <div class="order-item-total" style="display:flex;flex-direction:column;align-items:flex-end;">

                    <div>₹${(
                        price *
                        quantity
                    ).toFixed(2)}</div>
                    ${rateBtnHtml}

                </div>

            `;


            orderItems.appendChild(
                div
            );

        }
    );

}


// ==========================================
// STATUS
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
            label: "Out for Delivery",
            className: "out-for-delivery"
        };

    }


    if (value === "processing") {

        return {
            label: "Processing",
            className: "processing"
        };

    }


    if (value === "shipped") {

        return {
            label: "Shipped",
            className: "shipped"
        };

    }


    if (value === "delivered") {

        return {
            label: "Delivered",
            className: "delivered"
        };

    }


    if (value === "cancelled") {

        return {
            label: "Cancelled",
            className: "cancelled"
        };

    }


    return {
        label: "Pending",
        className: "pending"
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

loadOrder();

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