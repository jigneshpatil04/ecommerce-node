
// =====================================================
// CHECKOUT JAVASCRIPT
// Combined + Clean + Image Support
// Checkout + Order Confirmation + Rating System
// =====================================================

console.log("Checkout JS Loaded");


// =====================================================
// GLOBAL VARIABLES
// =====================================================

let cart = [];
let cartProducts = [];

const SHIPPING_CHARGE = 50;


// =====================================================
// CHECKOUT DOM ELEMENTS
// =====================================================

let checkoutForm = null;
let checkoutItems = null;

let subtotalElement = null;
let shippingElement = null;
let totalElement = null;

let placeOrderBtn = null;
let buttonText = null;

let orderSuccessOverlay = null;
let successOrderId = null;
let continueShoppingBtn = null;


// =====================================================
// RATING DOM ELEMENTS
// =====================================================

let ratingButton = null;
let ratingOverlay = null;
let ratingBottomSheet = null;
let closeRating = null;
let ratingStars = [];
let ratingText = null;
let ratingReview = null;
let submitRating = null;


// =====================================================
// ORDER CONFIRMED ELEMENTS
// =====================================================

let orderConfirmed = null;
let confirmedOrderId = null;


// =====================================================
// RATING VARIABLES
// =====================================================

let selectedRating = 0;
let ratingSubmitted = false;


// =====================================================
// INITIALIZE ALL DOM ELEMENTS
// =====================================================

function initializeElements() {

    // -----------------------------------------
    // CHECKOUT
    // -----------------------------------------

    checkoutForm =
        document.getElementById(
            "checkoutForm"
        );


    checkoutItems =
        document.getElementById(
            "checkoutItems"
        ) ||
        document.getElementById(
            "checkout-items"
        );


    subtotalElement =
        document.getElementById(
            "subtotal"
        ) ||
        document.getElementById(
            "checkout-subtotal"
        );


    shippingElement =
        document.getElementById(
            "shipping"
        ) ||
        document.getElementById(
            "checkout-shipping"
        );


    totalElement =
        document.getElementById(
            "total"
        ) ||
        document.getElementById(
            "checkout-total"
        );


    placeOrderBtn =
        document.getElementById(
            "placeOrderBtn"
        );


    buttonText =
        document.getElementById(
            "buttonText"
        );


    orderSuccessOverlay =
        document.getElementById(
            "orderSuccessOverlay"
        );


    successOrderId =
        document.getElementById(
            "successOrderId"
        );


    continueShoppingBtn =
        document.getElementById(
            "continueShoppingBtn"
        );


    // -----------------------------------------
    // RATING
    // -----------------------------------------

    ratingButton =
        document.getElementById(
            "ratingButton"
        );


    ratingOverlay =
        document.getElementById(
            "ratingOverlay"
        );


    ratingBottomSheet =
        document.getElementById(
            "ratingBottomSheet"
        );


    closeRating =
        document.getElementById(
            "closeRating"
        );


    ratingStars =
        document.querySelectorAll(
            ".rating-stars .star"
        );


    ratingText =
        document.getElementById(
            "ratingText"
        );


    ratingReview =
        document.getElementById(
            "ratingReview"
        );


    submitRating =
        document.getElementById(
            "submitRating"
        );


    // -----------------------------------------
    // ORDER CONFIRMED
    // -----------------------------------------

    orderConfirmed =
        document.getElementById(
            "orderConfirmed"
        );


    confirmedOrderId =
        document.getElementById(
            "confirmedOrderId"
        );


    console.log(
        "All checkout elements initialized."
    );

}


// =====================================================
// LOAD CART FROM LOCAL STORAGE
// =====================================================

function loadCart() {

    const savedCart =
        localStorage.getItem(
            "cart"
        );


    if (!savedCart) {

        cart = [];

        console.log(
            "Cart is empty."
        );

        return;

    }


    try {

        const parsedCart =
            JSON.parse(
                savedCart
            );


        if (
            Array.isArray(
                parsedCart
            )
        ) {

            cart =
                parsedCart;

        } else {

            cart = [];

        }

    } catch (error) {

        console.error(
            "Invalid cart data:",
            error
        );

        cart = [];

    }


    console.log(
        "Cart loaded:",
        cart
    );

}


// =====================================================
// IMAGE PATH HANDLER
// =====================================================

function getProductImage(product) {

    const image =
        product.image ||
        product.image_url ||
        product.imageUrl ||
        product.product_image ||
        "";


    if (!image) {

        return "/images/product-placeholder.jpg";

    }


    let imagePath = "";
    if (typeof image === "string") {
        const trimmed = image.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    imagePath = String(parsed[0] || "").trim();
                }
            } catch (e) {}
        }
        if (!imagePath) {
            imagePath = trimmed;
        }
    } else if (Array.isArray(image) && image.length > 0) {
        imagePath = String(image[0] || "").trim();
    }


    if (!imagePath) {

        return "/images/product-placeholder.jpg";

    }


    // -----------------------------------------
    // FULL URL
    // -----------------------------------------

    if (
        imagePath.startsWith(
            "http://"
        ) ||
        imagePath.startsWith(
            "https://"
        ) ||
        imagePath.startsWith(
            "data:image/"
        )
    ) {

        return imagePath;

    }


    // -----------------------------------------
    // WINDOWS PATH
    // -----------------------------------------

    imagePath =
        imagePath.replace(
            /\\/g,
            "/"
        );


    // -----------------------------------------
    // REMOVE ./
    // -----------------------------------------

    if (
        imagePath.startsWith(
            "./"
        )
    ) {

        imagePath =
            imagePath.substring(
                2
            );

    }


    // -----------------------------------------
    // ROOT PATH
    // -----------------------------------------

    if (
        imagePath.startsWith(
            "/"
        )
    ) {

        return imagePath;

    }


    // -----------------------------------------
    // images/
    // -----------------------------------------

    if (
        imagePath.startsWith(
            "images/"
        )
    ) {

        return "/" +
            imagePath;

    }


    // -----------------------------------------
    // uploads/
    // -----------------------------------------

    if (
        imagePath.startsWith(
            "uploads/"
        )
    ) {

        return "/" +
            imagePath;

    }


    // -----------------------------------------
    // FILENAME
    // -----------------------------------------

    return "/images/" +
        imagePath;

}


// =====================================================
// GET CART PRODUCT ID
// =====================================================

function getProductId(item) {

    return (
        item.id ||
        item.productId ||
        item.product_id
    );

}


// =====================================================
// LOAD PRODUCTS FROM DATABASE
// =====================================================

async function loadCheckoutProducts() {

    if (
        !Array.isArray(cart) ||
        cart.length === 0
    ) {

        cartProducts = [];

        return;

    }


    const response =
        await fetch(
            "/api/products",
            {
                method: "GET",

                headers: {
                    "Accept":
                        "application/json"
                }
            }
        );


    if (!response.ok) {

        throw new Error(
            "Unable to load products from server."
        );

    }


    const data =
        await response.json();


    console.log(
        "Products API:",
        data
    );


    let products = [];


    // -----------------------------------------
    // API RESPONSE
    // -----------------------------------------

    if (
        data &&
        Array.isArray(
            data.products
        )
    ) {

        products =
            data.products;

    } else if (
        Array.isArray(
            data
        )
    ) {

        products =
            data;

    }


    if (
        products.length === 0
    ) {

        throw new Error(
            "No products were returned from the server."
        );

    }


    // -----------------------------------------
    // MATCH CART PRODUCTS
    // -----------------------------------------

    cartProducts =
        cart
            .map(
                function (cartItem) {

                    const cartProductId =
                        getProductId(
                            cartItem
                        );


                    if (
                        cartProductId ===
                        undefined ||
                        cartProductId ===
                        null
                    ) {

                        console.warn(
                            "Cart product ID missing:",
                            cartItem
                        );

                        return null;

                    }


                    const product =
                        products.find(
                            function (
                                databaseProduct
                            ) {

                                return (
                                    Number(
                                        databaseProduct.id
                                    ) ===
                                    Number(
                                        cartProductId
                                    )
                                );

                            }
                        );


                    if (!product) {

                        console.warn(
                            "Product not found:",
                            cartItem
                        );

                        return null;

                    }


                    return {

                        ...product,

                        quantity:
                            Number(
                                cartItem.quantity
                            ) || 1,

                        size:
                            cartItem.size ||
                            product.size ||
                            null,

                        color:
                            cartItem.color ||
                            product.color ||
                            null,

                        price:
                            Number(
                                cartItem.price
                            ) ||
                            Number(
                                product.display_price ??
                                product.price ?? 0
                            ) || 0

                    };

                }
            )
            .filter(
                Boolean
            );


    console.log(
        "Checkout Products:",
        cartProducts
    );

}


// =====================================================
// DISPLAY EMPTY CHECKOUT
// =====================================================

function displayEmptyCheckout() {

    if (!checkoutItems) {

        console.error(
            "Checkout items container not found."
        );

        return;

    }


    checkoutItems.innerHTML = `

        <div class="empty-checkout">

            <h3>
                Your cart is empty
            </h3>

            <p>
                Please add products before checkout.
            </p>

            <a href="/products.html">
                Continue Shopping
            </a>

        </div>

    `;


    updateCheckoutSummary(
        0,
        0,
        0
    );

}


// =====================================================
// DISPLAY CHECKOUT ITEMS
// =====================================================

function displayCheckoutItems() {

    if (!checkoutItems) {

        console.error(
            "Checkout items container not found."
        );

        return;

    }


    checkoutItems.innerHTML = "";


    if (
        !Array.isArray(
            cartProducts
        ) ||
        cartProducts.length === 0
    ) {

        displayEmptyCheckout();

        return;

    }


    cartProducts.forEach(
        function (product) {

            const price =
                Number(
                    product.price
                ) || 0;


            const quantity =
                Number(
                    product.quantity
                ) || 1;


            const itemTotal =
                price *
                quantity;


            const image =
                getProductImage(
                    product
                );


            const productName =
                product.name ||
                product.title ||
                "Product";


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "checkout-item";


            // -----------------------------------------
            // IMAGE
            // -----------------------------------------

            const imageElement =
                document.createElement(
                    "img"
                );


            imageElement.className =
                "checkout-item-image";


            imageElement.src =
                image;


            imageElement.alt =
                productName;


            imageElement.onerror =
                function () {

                    this.onerror =
                        null;

                    this.src =
                        "/images/product-placeholder.jpg";

                };


            // -----------------------------------------
            // INFO
            // -----------------------------------------

            const info =
                document.createElement(
                    "div"
                );


            info.className =
                "checkout-item-info";


            const details =
                document.createElement(
                    "div"
                );


            const nameElement =
                document.createElement(
                    "strong"
                );


            nameElement.className =
                "checkout-item-name";


            nameElement.textContent =
                productName;


            const quantityElement =
                document.createElement(
                    "p"
                );


            quantityElement.className =
                "checkout-item-quantity";


            quantityElement.textContent =
                `₹${price.toFixed(2)} × ${quantity}`;


            details.appendChild(
                nameElement
            );


            details.appendChild(
                quantityElement
            );


            info.appendChild(
                imageElement
            );


            info.appendChild(
                details
            );


            // -----------------------------------------
            // ITEM TOTAL
            // -----------------------------------------

            const totalElementForItem =
                document.createElement(
                    "strong"
                );


            totalElementForItem.className =
                "checkout-item-total";


            totalElementForItem.textContent =
                `₹${itemTotal.toFixed(2)}`;


            // -----------------------------------------
            // ADD ITEM
            // -----------------------------------------

            item.appendChild(
                info
            );


            item.appendChild(
                totalElementForItem
            );


            checkoutItems.appendChild(
                item
            );

        }
    );

}


// =====================================================
// CALCULATE CHECKOUT TOTAL
// =====================================================

function calculateCheckoutTotal() {

    let subtotal = 0;


    if (
        Array.isArray(
            cartProducts
        )
    ) {

        cartProducts.forEach(
            function (product) {

                const price =
                    Number(
                        product.price
                    ) || 0;


                const quantity =
                    Number(
                        product.quantity
                    ) || 1;


                subtotal +=
                    price *
                    quantity;

            }
        );

    }


    const shipping =
        subtotal > 0
            ? SHIPPING_CHARGE
            : 0;


    const total =
        subtotal +
        shipping;


    updateCheckoutSummary(
        subtotal,
        shipping,
        total
    );


    return {

        subtotal:
            subtotal,

        shipping:
            shipping,

        total:
            total

    };

}


// =====================================================
// UPDATE CHECKOUT SUMMARY
// =====================================================

function updateCheckoutSummary(
    subtotal,
    shipping,
    total
) {

    if (subtotalElement) {

        subtotalElement.textContent =
            `₹${Number(
                subtotal || 0
            ).toFixed(2)}`;

    }


    if (shippingElement) {

        shippingElement.textContent =
            `₹${Number(
                shipping || 0
            ).toFixed(2)}`;

    }


    if (totalElement) {

        totalElement.textContent =
            `₹${Number(
                total || 0
            ).toFixed(2)}`;

    }

}


// =====================================================
// PREPARE ORDER PRODUCTS
// =====================================================

function prepareOrderProducts() {

    if (
        !Array.isArray(
            cartProducts
        ) ||
        cartProducts.length === 0
    ) {

        throw new Error(
            "No products found for this order."
        );

    }


    return cartProducts.map(
        function (product) {

            const productId =
                getProductId(
                    product
                );


            const numericProductId =
                Number(
                    productId
                );


            if (
                !Number.isInteger(
                    numericProductId
                ) ||
                numericProductId <= 0
            ) {

                throw new Error(
                    "Invalid product ID for: " +
                    (
                        product.name ||
                        "Unknown Product"
                    )
                );

            }


            const productName =
                product.name ||
                product.title ||
                "Product";


            const productPrice =
                Number(
                    product.price
                ) || 0;


            const productQuantity =
                Number(
                    product.quantity
                ) || 1;


            return {

                productId:
                    numericProductId,

                id:
                    numericProductId,

                product_id:
                    numericProductId,

                name:
                    productName,

                price:
                    productPrice,

                quantity:
                    productQuantity,

                color:
                    product.color ||
                    null,

                size:
                    product.size ||
                    null

            };

        }
    );

}


// =====================================================
// GET USER ID
// =====================================================

function getUserId() {

    const storedUserId =
        localStorage.getItem(
            "userId"
        );


    if (storedUserId) {

        const numericUserId =
            Number(
                storedUserId
            );


        if (
            Number.isInteger(
                numericUserId
            ) &&
            numericUserId > 0
        ) {

            return numericUserId;

        }

    }


    try {

        const savedUser =
            JSON.parse(
                localStorage.getItem(
                    "user"
                ) || "{}"
            );


        const userId =
            savedUser.id ||
            savedUser.user_id;


        const numericUserId =
            Number(
                userId
            );


        if (
            Number.isInteger(
                numericUserId
            ) &&
            numericUserId > 0
        ) {

            return numericUserId;

        }

    } catch (error) {

        console.warn(
            "Could not read user data:",
            error
        );

    }


    return null;

}


// =====================================================
// GET FORM VALUE
// =====================================================

function getFieldValue(selectors) {

    const element =
        document.querySelector(
            selectors
        );


    if (!element) {

        return "";

    }


    return String(
        element.value || ""
    ).trim();

}


// =====================================================
// VALIDATE CHECKOUT FORM
// =====================================================

function validateCheckoutForm() {

    const name =
        getFieldValue(
            'input[name="name"], input[name="customerName"], #name, #customerName'
        );


    const email =
        getFieldValue(
            'input[name="email"], #email'
        );


    const phone =
        getFieldValue(
            'input[name="phone"], #phone'
        );


    const address =
        getFieldValue(
            'textarea[name="address"], input[name="address"], #address'
        );


    const city =
        getFieldValue(
            'input[name="city"], #city'
        );


    const pincode =
        getFieldValue(
            'input[name="pincode"], input[name="pin"], #pincode, #pin'
        );


    if (!name) {

        alert(
            "Please enter your name."
        );

        return false;

    }


    if (!email) {

        alert(
            "Please enter your email."
        );

        return false;

    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
        !emailPattern.test(
            email
        )
    ) {

        alert(
            "Please enter a valid email address."
        );

        return false;

    }


    if (!phone) {

        alert(
            "Please enter your phone number."
        );

        return false;

    }


    const phoneDigits =
        phone.replace(
            /\D/g,
            ""
        );


    if (
        phoneDigits.length !== 10
    ) {

        alert(
            "Please enter a valid 10-digit phone number."
        );

        return false;

    }


    if (!address) {

        alert(
            "Please enter your address."
        );

        return false;

    }


    if (!city) {

        alert(
            "Please enter your city."
        );

        return false;

    }


    if (!pincode) {

        alert(
            "Please enter your pincode."
        );

        return false;

    }


    const pincodeDigits =
        pincode.replace(
            /\D/g,
            ""
        );


    if (
        pincodeDigits.length !== 6
    ) {

        alert(
            "Please enter a valid 6-digit pincode."
        );

        return false;

    }


    return true;

}


// =====================================================
// GET PAYMENT METHOD
// =====================================================

function getPaymentMethod() {

    const paymentElement =
        document.querySelector(
            'select[name="paymentMethod"], input[name="paymentMethod"], #paymentMethod'
        );


    if (!paymentElement) {

        return "Cash on Delivery";

    }


    const paymentMethod =
        String(
            paymentElement.value || ""
        ).trim();


    return (
        paymentMethod ||
        "Cash on Delivery"
    );

}


// =====================================================
// SHOW BUTTON LOADING
// =====================================================

function showLoading() {

    if (!placeOrderBtn) {

        return;

    }


    placeOrderBtn.disabled =
        true;


    placeOrderBtn.classList.add(
        "loading"
    );


    if (buttonText) {

        buttonText.textContent =
            "Placing Order...";

    } else {

        placeOrderBtn.textContent =
            "Placing Order...";

    }

}


// =====================================================
// RESET BUTTON
// =====================================================

function resetButton() {

    if (!placeOrderBtn) {

        return;

    }


    placeOrderBtn.disabled =
        false;


    placeOrderBtn.classList.remove(
        "loading"
    );


    if (buttonText) {

        buttonText.textContent =
            "Place Order";

    } else {

        placeOrderBtn.textContent =
            "Place Order";

    }

}


// =====================================================
// SHOW ORDER SUCCESS
// =====================================================

function showOrderSuccess(orderId) {

    if (
        orderSuccessOverlay
    ) {

        if (
            successOrderId
        ) {

            successOrderId.textContent =
                `#${orderId}`;

        }


        if (
            confirmedOrderId
        ) {

            confirmedOrderId.textContent =
                `#${orderId}`;

        }


        // Save latest order ID
        localStorage.setItem(
            "lastOrderId",
            String(orderId)
        );


        orderSuccessOverlay.classList.add(
            "show"
        );


        document.body.style.overflow =
            "hidden";


        return;

    }


    alert(
        "Order placed successfully!\n\n" +
        "Order ID: #" +
        orderId
    );


    window.location.href = `./order-details.html?id=${encodeURIComponent(
            orderId
        )}`;

}


// =====================================================
// CONTINUE SHOPPING
// =====================================================

function setupContinueShopping() {

    if (!continueShoppingBtn) {

        return;

    }


    continueShoppingBtn.addEventListener(
        "click",
        function () {

            window.location.href = "./products.html";

        }
    );

}


// =====================================================
// PLACE ORDER
// =====================================================

async function placeOrder(event) {

    event.preventDefault();


    console.log(
        "================================="
    );

    console.log(
        "PLACE ORDER"
    );

    console.log(
        "================================="
    );


    // -----------------------------------------
    // CHECK CART
    // -----------------------------------------

    if (
        !Array.isArray(
            cartProducts
        ) ||
        cartProducts.length === 0
    ) {

        alert(
            "Your cart is empty."
        );

        return;

    }


    // -----------------------------------------
    // VALIDATE
    // -----------------------------------------

    if (
        !validateCheckoutForm()
    ) {

        return;

    }


    // -----------------------------------------
    // CUSTOMER INFORMATION
    // -----------------------------------------

    const name =
        getFieldValue(
            'input[name="name"], input[name="customerName"], #name, #customerName'
        );


    const email =
        getFieldValue(
            'input[name="email"], #email'
        ).toLowerCase();


    const phone =
        getFieldValue(
            'input[name="phone"], #phone'
        );


    const address =
        getFieldValue(
            'textarea[name="address"], input[name="address"], #address'
        );


    const city =
        getFieldValue(
            'input[name="city"], #city'
        );


    const state =
        getFieldValue(
            'input[name="state"], select[name="state"], #state'
        );


    const pincode =
        getFieldValue(
            'input[name="pincode"], input[name="pin"], #pincode, #pin'
        );


    const paymentMethod =
        getPaymentMethod();


    // -----------------------------------------
    // TOTALS
    // -----------------------------------------

    const totals =
        calculateCheckoutTotal();


    // -----------------------------------------
    // PRODUCTS
    // -----------------------------------------

    let orderProducts;


    try {

        orderProducts =
            prepareOrderProducts();

    } catch (error) {

        console.error(
            "Product preparation error:",
            error
        );


        alert(
            error.message
        );


        return;

    }


    // -----------------------------------------
    // USER ID
    // -----------------------------------------

    const userId =
        getUserId();


    // -----------------------------------------
    // ORDER DATA
    // -----------------------------------------

    const orderData = {
        user_id: userId || localStorage.getItem("user_id") || null,

        customerName: name,
        email: email,
        phone: phone,
        address: address,
        city: city,
        state: state,
        pincode: pincode,
        products: orderProducts,
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        total: totals.total,
        paymentMethod: paymentMethod
    };

    console.log(
        "FINAL ORDER DATA:",
        JSON.stringify(
            orderData,
            null,
            2
        )
    );


    // -----------------------------------------
    // LOADING
    // -----------------------------------------

    showLoading();


    try {

        // =====================================
        // SEND ORDER
        // =====================================

        const response =
            await fetch(
                "/api/orders",
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            orderData
                        )

                }
            );


        console.log(
            "Order API Status:",
            response.status
        );


        // =====================================
        // SERVER RESPONSE
        // =====================================

        const responseText =
            await response.text();


        console.log(
            "Order API Response:",
            responseText
        );


        let data = null;


        try {

            data =
                responseText
                    ? JSON.parse(
                        responseText
                    )
                    : null;

        } catch (parseError) {

            console.error(
                "JSON parse error:",
                parseError
            );


            throw new Error(
                "Server returned an invalid response."
            );

        }


        // =====================================
        // CHECK RESPONSE
        // =====================================

        if (
            !response.ok
        ) {

            throw new Error(
                data &&
                data.message
                    ? data.message
                    : "Server error while placing order."
            );

        }


        if (
            !data ||
            data.success !== true
        ) {

            throw new Error(
                data &&
                data.message
                    ? data.message
                    : "Failed to save order."
            );

        }


        // =====================================
        // GET ORDER ID
        // =====================================

        const orderId =
            data.orderId ||
            data.order_id ||
            data.id ||
            (
                data.order &&
                (
                    data.order.id ||
                    data.order.order_id
                )
            );


        console.log(
            "Order ID:",
            orderId
        );


        // =====================================
        // SAVE ORDER ID
        // =====================================

        if (orderId) {

            localStorage.setItem(
                "lastOrderId",
                String(orderId)
            );

        }


        // =====================================
        // CLEAR CART
        // =====================================

        localStorage.removeItem(
            "cart"
        );


        cart = [];

        cartProducts = [];


        // =====================================
        // RESET BUTTON
        // =====================================

        resetButton();


        // =====================================
        // ONLINE PAYMENT REDIRECT (STRIPE)
        // =====================================

        if (paymentMethod === "Online") {
            try {
                const stripeRes = await fetch("/api/stripe/create-checkout-session", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        customerName: name,
                        email: email,
                        products: orderProducts,
                        total: totals.total,
                        orderId: orderId
                    })
                });

                const stripeData = await stripeRes.json();

                if (stripeData.success && stripeData.url) {
                    window.location.href = stripeData.url;
                    return;
                }
            } catch (stripeErr) {
                console.warn("Stripe checkout error, showing order success instead:", stripeErr);
            }
        }


        // =====================================
        // SHOW ORDER CONFIRMED
        // =====================================

        if (orderId) {

            showOrderSuccess(
                orderId
            );

        } else {

            alert(
                "Order placed successfully!"
            );


            window.location.href = "./products.html";

        }


    } catch (error) {

        console.error(
            "Place Order Error:",
            error
        );


        alert(
            "Order could not be placed.\n\n" +
            error.message
        );


        resetButton();

    }

}


// =====================================================
// LOAD CHECKOUT
// =====================================================

async function loadCheckout() {

    console.log(
        "Loading checkout..."
    );


    loadCart();


    if (
        cart.length === 0
    ) {

        cartProducts = [];

        displayEmptyCheckout();

        return;

    }


    try {

        await loadCheckoutProducts();


        if (
            cartProducts.length === 0
        ) {

            displayEmptyCheckout();


            alert(
                "The products in your cart are no longer available."
            );


            return;

        }


        displayCheckoutItems();


        calculateCheckoutTotal();


    } catch (error) {

        console.error(
            "Checkout loading error:",
            error
        );


        if (checkoutItems) {

            checkoutItems.innerHTML = `

                <div class="empty-checkout">

                    <h3>
                        Unable to load checkout.
                    </h3>

                    <p>
                        ${escapeHTML(
                            error.message ||
                            "Please refresh the page."
                        )}
                    </p>

                    <button
                        type="button"
                        onclick="location.reload()"
                    >
                        Refresh Page
                    </button>

                </div>

            `;

        }

    }

}


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHTML(value) {

    return String(
        value || ""
    )

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


// =====================================================
// =====================================================
// RATING SYSTEM
// =====================================================
// =====================================================


// =====================================================
// OPEN RATING POPUP
// =====================================================

function openRatingPopup() {

    if (ratingSubmitted) {

        return;

    }


    if (
        !ratingBottomSheet ||
        !ratingOverlay
    ) {

        console.error(
            "Rating popup elements not found."
        );

        return;

    }


    ratingOverlay.classList.add(
        "active"
    );


    ratingBottomSheet.classList.add(
        "active"
    );


    document.body.classList.add(
        "rating-open"
    );

}


// =====================================================
// CLOSE RATING POPUP
// =====================================================

function closeRatingPopup() {

    if (ratingBottomSheet) {

        ratingBottomSheet.classList.remove(
            "active"
        );

    }


    if (ratingOverlay) {

        ratingOverlay.classList.remove(
            "active"
        );

    }


    document.body.classList.remove(
        "rating-open"
    );

}


// =====================================================
// HIDE ORDER CONFIRMED
// =====================================================

function hideOrderConfirmed() {

    console.log(
        "Hiding Order Confirmed..."
    );


    // -----------------------------------------
    // MAIN SUCCESS OVERLAY
    // -----------------------------------------

    if (
        orderSuccessOverlay
    ) {

        orderSuccessOverlay.classList.remove(
            "show"
        );

        orderSuccessOverlay.classList.remove(
            "active"
        );

        orderSuccessOverlay.style.display =
            "none";

    }


    // -----------------------------------------
    // ORDER CONFIRMED
    // -----------------------------------------

    if (
        orderConfirmed
    ) {

        orderConfirmed.classList.remove(
            "show"
        );

        orderConfirmed.classList.remove(
            "active"
        );

        orderConfirmed.style.display =
            "none";

    }


    // -----------------------------------------
    // COMMON SUCCESS CLASSES
    // -----------------------------------------

    const confirmedElements =
        document.querySelectorAll(
            ".order-confirmed, .order-success, .success-message"
        );


    confirmedElements.forEach(
        function (element) {

            element.style.display =
                "none";

        }
    );


    // -----------------------------------------
    // RESTORE PAGE SCROLL
    // -----------------------------------------

    document.body.style.overflow =
        "";


    document.body.classList.remove(
        "rating-open"
    );


    console.log(
        "Order Confirmed hidden."
    );

}


// =====================================================
// UPDATE STARS
// =====================================================

function updateStars() {

    ratingStars.forEach(
        function (star) {

            const starRating =
                Number(
                    star.dataset.rating
                );


            if (
                starRating <=
                selectedRating
            ) {

                star.classList.add(
                    "active"
                );

            } else {

                star.classList.remove(
                    "active"
                );

            }

        }
    );

}


// =====================================================
// UPDATE RATING TEXT
// =====================================================

function updateRatingText() {

    const messages = {

        1:
            "Very Poor 😞",

        2:
            "Poor 😕",

        3:
            "Good 🙂",

        4:
            "Very Good 😊",

        5:
            "Excellent! 🤩"

    };


    if (
        ratingText
    ) {

        if (
            messages[
                selectedRating
            ]
        ) {

            ratingText.textContent =
                messages[
                    selectedRating
                ];

        } else {

            ratingText.textContent =
                "Select a rating";

        }

    }

}


// =====================================================
// GET CONFIRMED ORDER ID
// =====================================================

function getConfirmedOrderId() {

    let orderId = "";


    // -----------------------------------------
    // CHECK confirmedOrderId
    // -----------------------------------------

    if (
        confirmedOrderId
    ) {

        orderId =
            confirmedOrderId.textContent
                .trim();

    }


    // -----------------------------------------
    // REMOVE #
    // -----------------------------------------

    orderId =
        orderId
            .replace(
                "#",
                ""
            )
            .trim();


    // -----------------------------------------
    // BACKUP: successOrderId
    // -----------------------------------------

    if (!orderId) {

        if (
            successOrderId
        ) {

            orderId =
                successOrderId.textContent
                    .replace(
                        "#",
                        ""
                    )
                    .trim();

        }

    }


    // -----------------------------------------
    // BACKUP: LOCAL STORAGE
    // -----------------------------------------

    if (!orderId) {

        orderId =
            localStorage.getItem(
                "lastOrderId"
            ) || "";

    }


    return orderId;

}


// =====================================================
// SUBMIT RATING
// =====================================================

function submitRatingHandler() {

    console.log(
        "Submit Rating clicked."
    );


    // -----------------------------------------
    // VALIDATE RATING
    // -----------------------------------------

    if (
        selectedRating === 0
    ) {

        alert(
            "Please select a rating."
        );

        return;

    }


    // -----------------------------------------
    // GET REVIEW
    // -----------------------------------------

    const review =
        ratingReview
            ? ratingReview.value.trim()
            : "";


    // -----------------------------------------
    // GET ORDER ID
    // -----------------------------------------

    const orderId =
        getConfirmedOrderId();


    console.log(
        "Rating Order ID:",
        orderId
    );


    // -----------------------------------------
    // RATING DATA
    // -----------------------------------------

    const ratingData = {

        order_id:
            orderId,

        rating:
            selectedRating,

        review:
            review,

        submitted_at:
            new Date().toISOString()

    };


    console.log(
        "Rating Submitted:",
        ratingData
    );


    // -----------------------------------------
    // GET EXISTING RATINGS
    // -----------------------------------------

    let ratings = [];


    try {

        ratings =
            JSON.parse(
                localStorage.getItem(
                    "orderRatings"
                )
            ) || [];


        if (
            !Array.isArray(
                ratings
            )
        ) {

            ratings = [];

        }

    } catch (error) {

        console.error(
            "Rating storage error:",
            error
        );

        ratings = [];

    }


    // -----------------------------------------
    // SAVE RATING
    // -----------------------------------------

    ratings.push(
        ratingData
    );


    localStorage.setItem(
        "orderRatings",
        JSON.stringify(
            ratings
        )
    );


    // -----------------------------------------
    // MARK AS SUBMITTED
    // -----------------------------------------

    ratingSubmitted =
        true;


    // -----------------------------------------
    // CLOSE RATING POPUP
    // -----------------------------------------

    closeRatingPopup();


    // -----------------------------------------
    // HIDE ORDER CONFIRMED
    // -----------------------------------------

    hideOrderConfirmed();


    // -----------------------------------------
    // RESET RATING
    // -----------------------------------------

    selectedRating =
        0;


    updateStars();

    updateRatingText();


    if (
        ratingReview
    ) {

        ratingReview.value =
            "";

    }


    // -----------------------------------------
    // DISABLE RATING BUTTON
    // -----------------------------------------

    if (
        ratingButton
    ) {

        ratingButton.disabled =
            true;


        ratingButton.classList.add(
            "rating-submitted"
        );


        ratingButton.textContent =
            "Rating Submitted ✓";

    }


    // -----------------------------------------
    // SUCCESS MESSAGE
    // -----------------------------------------

    alert(
        "Thank you! Your rating has been submitted."
    );


    console.log(
        "Rating submitted successfully."
    );


    // -----------------------------------------
    // REDIRECT
    // -----------------------------------------

    setTimeout(
        function () {

            window.location.href = "./categories.html";

        },
        500
    );

}


// =====================================================
// INITIALIZE RATING EVENTS
// =====================================================

function initializeRatingSystem() {

    console.log(
        "Initializing Rating System..."
    );


    // -----------------------------------------
    // RATING BUTTON
    // -----------------------------------------

    if (
        ratingButton
    ) {

        ratingButton.addEventListener(
            "click",
            openRatingPopup
        );

    }


    // -----------------------------------------
    // CLOSE BUTTON
    // -----------------------------------------

    if (
        closeRating
    ) {

        closeRating.addEventListener(
            "click",
            closeRatingPopup
        );

    }


    // -----------------------------------------
    // OVERLAY CLICK
    // -----------------------------------------

    if (
        ratingOverlay
    ) {

        ratingOverlay.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    ratingOverlay
                ) {

                    closeRatingPopup();

                }

            }
        );

    }


    // -----------------------------------------
    // ESCAPE KEY
    // -----------------------------------------

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Escape"
            ) {

                closeRatingPopup();

            }

        }
    );


    // -----------------------------------------
    // STARS
    // -----------------------------------------

    ratingStars.forEach(
        function (star) {

            star.addEventListener(
                "click",
                function () {

                    selectedRating =
                        Number(
                            this.dataset.rating
                        );


                    updateStars();

                    updateRatingText();

                }
            );

        }
    );


    // -----------------------------------------
    // SUBMIT RATING
    // -----------------------------------------

    if (
        submitRating
    ) {

        submitRating.addEventListener(
            "click",
            submitRatingHandler
        );

    }


    console.log(
        "Rating System Ready."
    );

}


// =====================================================
// INITIALIZE CHECKOUT
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Initializing checkout..."
        );


        // -----------------------------------------
        // INITIALIZE ELEMENTS
        // -----------------------------------------

        initializeElements();


        // -----------------------------------------
        // CHECKOUT FORM
        // -----------------------------------------

        if (
            !checkoutForm
        ) {

            console.error(
                "ERROR: checkoutForm not found."
            );

        } else {

            checkoutForm.addEventListener(
                "submit",
                placeOrder
            );

        }


        // -----------------------------------------
        // CONTINUE SHOPPING
        // -----------------------------------------

        setupContinueShopping();


        // -----------------------------------------
        // RATING SYSTEM
        // -----------------------------------------

        initializeRatingSystem();


        // -----------------------------------------
        // LOAD CHECKOUT
        // -----------------------------------------

        loadCheckout();

    }
);

