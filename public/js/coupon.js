
/* =====================================================
   SQUAD FASHION - COUPON JAVASCRIPT
===================================================== */

console.log("Coupon JavaScript Loaded");


// =====================================================
// COUPON DATA
// =====================================================

const coupons = {

    SQUAD10: {
        type: "percentage",
        value: 10,
        minimumOrder: 500,
        description: "10% discount"
    },

    SAVE100: {
        type: "fixed",
        value: 100,
        minimumOrder: 1000,
        description: "₹100 discount"
    },

    WELCOME15: {
        type: "percentage",
        value: 15,
        minimumOrder: 1500,
        description: "15% discount"
    }

};


// =====================================================
// DEFAULT ORDER DATA
// =====================================================

// Change this value to your actual checkout subtotal.

let subtotal = 2000;


// Shipping charge.

let shipping = 50;


// Currently applied coupon.

let appliedCoupon = null;


// =====================================================
// DOM ELEMENTS
// =====================================================

const couponInput =
    document.getElementById(
        "couponInput"
    );


const applyCouponButton =
    document.getElementById(
        "applyCouponButton"
    );


const removeCouponButton =
    document.getElementById(
        "removeCouponButton"
    );


const couponMessage =
    document.getElementById(
        "couponMessage"
    );


const appliedCouponBox =
    document.getElementById(
        "appliedCoupon"
    );


const appliedCouponCode =
    document.getElementById(
        "appliedCouponCode"
    );


const appliedCouponText =
    document.getElementById(
        "appliedCouponText"
    );


const discountRow =
    document.getElementById(
        "discountRow"
    );


const discountAmount =
    document.getElementById(
        "discountAmount"
    );


const subtotalAmount =
    document.getElementById(
        "subtotalAmount"
    );


const shippingAmount =
    document.getElementById(
        "shippingAmount"
    );


const totalAmount =
    document.getElementById(
        "totalAmount"
    );


const checkoutButton =
    document.getElementById(
        "checkoutButton"
    );


// =====================================================
// FORMAT CURRENCY
// =====================================================

function formatCurrency(amount) {

    return "₹" +
        Number(amount).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


// =====================================================
// CALCULATE DISCOUNT
// =====================================================

function calculateDiscount(coupon) {

    if (!coupon) {

        return 0;

    }


    let discount = 0;


    if (coupon.type === "percentage") {

        discount =
            subtotal *
            coupon.value /
            100;

    }


    else if (coupon.type === "fixed") {

        discount =
            coupon.value;

    }


    // Discount cannot exceed subtotal.

    if (discount > subtotal) {

        discount = subtotal;

    }


    return discount;

}


// =====================================================
// UPDATE ORDER SUMMARY
// =====================================================

function updateSummary() {

    const discount =
        calculateDiscount(
            appliedCoupon
        );


    const total =
        subtotal +
        shipping -
        discount;


    subtotalAmount.textContent =
        formatCurrency(subtotal);


    shippingAmount.textContent =
        formatCurrency(shipping);


    discountAmount.textContent =
        "-" +
        formatCurrency(discount);


    totalAmount.textContent =
        formatCurrency(total);


    // Show / hide discount row.

    if (discount > 0) {

        discountRow.classList.remove(
            "hidden"
        );

    } else {

        discountRow.classList.add(
            "hidden"
        );

    }


    console.log(
        "Subtotal:",
        subtotal
    );

    console.log(
        "Discount:",
        discount
    );

    console.log(
        "Shipping:",
        shipping
    );

    console.log(
        "Final Total:",
        total
    );

}


// =====================================================
// SHOW MESSAGE
// =====================================================

function showMessage(
    text,
    success = false
) {

    couponMessage.textContent =
        text;


    if (success) {

        couponMessage.style.color =
            "#16833b";

    } else {

        couponMessage.style.color =
            "#d33";

    }

}


// =====================================================
// APPLY COUPON
// =====================================================

function applyCoupon(code) {

    code =
        code
            .trim()
            .toUpperCase();


    // Empty code.

    if (!code) {

        showMessage(
            "Please enter a coupon code."
        );

        return;

    }


    // Check coupon.

    const coupon =
        coupons[code];


    if (!coupon) {

        showMessage(
            "Invalid coupon code."
        );

        return;

    }


    // Check minimum order.

    if (
        subtotal <
        coupon.minimumOrder
    ) {

        showMessage(

            `Minimum order value for ${code} is ${formatCurrency(coupon.minimumOrder)}.`

        );

        return;

    }


    // Apply coupon.

    appliedCoupon = {

        code: code,

        ...coupon

    };


    // Save coupon locally.

    localStorage.setItem(

        "appliedCoupon",

        JSON.stringify(
            appliedCoupon
        )

    );


    // Update UI.

    appliedCouponCode.textContent =
        code;


    appliedCouponText.textContent =
        coupon.description +
        " applied successfully";


    appliedCouponBox.classList.remove(
        "hidden"
    );


    couponInput.value =
        code;


    showMessage(
        "Coupon applied successfully!",
        true
    );


    updateSummary();


    console.log(
        "Applied Coupon:",
        appliedCoupon
    );

}


// =====================================================
// REMOVE COUPON
// =====================================================

function removeCoupon() {

    appliedCoupon = null;


    localStorage.removeItem(
        "appliedCoupon"
    );


    appliedCouponBox.classList.add(
        "hidden"
    );


    couponInput.value = "";


    showMessage(
        "Coupon removed."
    );


    updateSummary();


    console.log(
        "Coupon Removed"
    );

}


// =====================================================
// APPLY BUTTON
// =====================================================

applyCouponButton.addEventListener(
    "click",
    function () {

        applyCoupon(
            couponInput.value
        );

    }
);


// =====================================================
// REMOVE BUTTON
// =====================================================

removeCouponButton.addEventListener(
    "click",
    function () {

        removeCoupon();

    }
);


// =====================================================
// ENTER KEY
// =====================================================

couponInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            applyCoupon(
                couponInput.value
            );

        }

    }
);


// =====================================================
// OFFER CARD BUTTONS
// =====================================================

const offerButtons =
    document.querySelectorAll(
        ".use-offer-btn"
    );


offerButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                const code =
                    button.dataset.code;


                couponInput.value =
                    code;


                applyCoupon(code);

            }
        );

    }
);


// =====================================================
// LOAD SAVED COUPON
// =====================================================

function loadSavedCoupon() {

    const savedCoupon =
        localStorage.getItem(
            "appliedCoupon"
        );


    if (!savedCoupon) {

        updateSummary();

        return;

    }


    try {

        const coupon =
            JSON.parse(
                savedCoupon
            );


        if (
            coupon &&
            coupons[coupon.code]
        ) {

            // Check minimum order
            // again.

            if (
                subtotal >=
                coupon.minimumOrder
            ) {

                appliedCoupon =
                    coupon;


                appliedCouponCode.textContent =
                    coupon.code;


                appliedCouponText.textContent =
                    coupon.description +
                    " applied successfully";


                appliedCouponBox.classList.remove(
                    "hidden"
                );


                couponInput.value =
                    coupon.code;

            } else {

                localStorage.removeItem(
                    "appliedCoupon"
                );

            }

        }

    } catch (error) {

        console.error(
            "Coupon Load Error:",
            error
        );


        localStorage.removeItem(
            "appliedCoupon"
        );

    }


    updateSummary();

}


// =====================================================
// CHECKOUT BUTTON
// =====================================================

checkoutButton.addEventListener(
    "click",
    function () {

        const discount =
            calculateDiscount(
                appliedCoupon
            );


        const finalTotal =
            subtotal +
            shipping -
            discount;


        // Save checkout
        // pricing information.

        const checkoutData = {

            subtotal: subtotal,

            shipping: shipping,

            discount: discount,

            total: finalTotal,

            coupon:
                appliedCoupon
                    ? appliedCoupon.code
                    : null

        };


        localStorage.setItem(

            "checkoutPricing",

            JSON.stringify(
                checkoutData
            )

        );


        console.log(
            "Checkout Pricing:",
            checkoutData
        );


        // Go to checkout.

        window.location.href =
            "/checkout.html";

    }
);


// =====================================================
// INITIALIZE
// =====================================================

loadSavedCoupon();

