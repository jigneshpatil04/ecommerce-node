// ==========================================
// CART SYSTEM
// ==========================================


// ==========================================
// GET PRODUCT IMAGE
// ==========================================

function getProductImage(product) {

    const defaultImage =
        "/images/tshirt1.jpg";


    if (
        !product ||
        !product.image ||
        String(product.image).trim() === ""
    ) {

        return defaultImage;

    }


    let image =
        String(product.image).trim();

    if (image.startsWith("[") && image.endsWith("]")) {
        try {
            const parsed = JSON.parse(image);
            if (Array.isArray(parsed) && parsed.length > 0) {
                image = String(parsed[0] || "").trim();
            }
        } catch (e) {}
    }

    const imageName =
        image.toLowerCase();


    if (
        imageName === "tshirt.jpg" ||
        imageName === "/images/tshirt.jpg"
    ) {

        return "/images/tshirt1.jpg";

    }


    if (
        imageName === "shirt.jpg" ||
        imageName === "/images/shirt.jpg"
    ) {

        return "/images/shirt2.jpg";

    }


    if (
        imageName === "jeans.jpg" ||
        imageName === "/images/jeans.jpg"
    ) {

        return "/images/jeans3.jpg";

    }


    if (
        image.startsWith("http://") ||
        image.startsWith("https://") ||
        image.startsWith("/")
    ) {

        return image;

    }


    return `/images/${image}`;

}


// ==========================================
// LOAD CART
// ==========================================

async function loadCart() {

    const container =
        document.getElementById(
            "cart-container"
        );

    // If not on the cart page (e.g. index.html or pages that include cart.js for header count)
    if (!container) {
        updateCartCount();
        return;
    }


    const cart =
        JSON.parse(
            localStorage.getItem("cart")
        ) || [];


    // Empty cart

    if (cart.length === 0) {

        container.innerHTML = `

            <div class="empty-cart">

                <h2>
                    Your cart is empty
                </h2>

                <p>
                    Add some products to your cart.
                </p>

                <a href="/categories.html">
                    Continue Shopping
                </a>

            </div>

        `;


        updateSummary([]);

        updateCartCount();

        return;

    }


    try {

        // Get products from API

        const response =
            await fetch(
                "/api/products"
            );


        const data =
            await response.json();


        if (!data.success) {

            container.innerHTML =
                "<p>Unable to load products.</p>";

            return;

        }


        const products =
            data.products;


        // Combine cart with products

        const cartProducts =
            cart.map(cartItem => {

                const product =
                    products.find(
                        p =>
                            Number(p.id) ===
                            Number(cartItem.id)
                    );


                if (!product) {

                    return null;

                }


                return {

                    ...product,

                    quantity:
                        cartItem.quantity,

                    size:
                        cartItem.size ||
                        product.size ||
                        null,

                    color:
                        cartItem.color ||
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

            }).filter(Boolean);


        displayCart(cartProducts);


        updateSummary(cartProducts);


        updateCartCount();


    } catch (error) {

        console.error(
            "Cart Error:",
            error
        );


        container.innerHTML = `

            <p>
                Unable to load cart.
            </p>

        `;

    }

}


// ==========================================
// DISPLAY CART
// ==========================================

function displayCart(cartProducts) {

    const container =
        document.getElementById(
            "cart-container"
        );

    if (!container) return;

    container.innerHTML = "";


    cartProducts.forEach(product => {


        const item =
            document.createElement("div");


        item.className =
            "cart-item";


        const imagePath =
            getProductImage(product);


        item.innerHTML = `
            <!-- Product Image -->
            <img
                src="${imagePath}"
                alt="${product.name}"
                class="cart-product-image"
                onerror="this.onerror=null; this.src='/images/tshirt1.jpg';"
            >

            <!-- Product Information -->
            <div class="cart-product-info">
                <h3>${product.name}</h3>

                ${product.description ? `<p class="cart-product-desc">${product.description}</p>` : ""}

                ${product.size ? `<p class="cart-size">Size: <span>${product.size}</span></p>` : ""}

                ${product.color ? `<p class="cart-color" style="font-size:13px; color:#666; margin:3px 0;">Color: <strong style="color:#832729;">${product.color}</strong></p>` : ""}

                <div class="cart-price">
                    ₹${Number(product.price).toFixed(2)}
                </div>

                <!-- Actions Row (Quantity & Remove) -->
                <div class="cart-actions-row">
                    <div class="quantity-control">
                        <button
                            onclick="decreaseQuantity(${product.id}, '${product.size || ''}', '${product.color || ''}')"
                            aria-label="Decrease quantity"
                        >
                            <i class="fa-solid fa-minus"></i>
                        </button>

                        <span>
                            ${product.quantity}
                        </span>

                        <button
                            onclick="increaseQuantity(${product.id}, ${product.stock}, '${product.size || ''}', '${product.color || ''}')"
                            aria-label="Increase quantity"
                        >
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>

                    <button
                        class="remove-btn"
                        onclick="removeFromCart(${product.id}, '${product.size || ''}', '${product.color || ''}')"
                        title="Remove Item"
                    >
                        <i class="fa-regular fa-trash-can"></i> Remove
                    </button>
                </div>
            </div>
        `;


        container.appendChild(item);

    });

}


// ==========================================
// INCREASE QUANTITY
// ==========================================

function increaseQuantity(
    productId,
    stock,
    size = "",
    color = ""
) {

    let cart =
        JSON.parse(
            localStorage.getItem("cart")
        ) || [];


    const item =
        cart.find(
            product =>
                Number(product.id) ===
                Number(productId) &&
                (
                    !size ||
                    String(product.size || "") ===
                    String(size)
                ) &&
                (
                    !color ||
                    String(product.color || "") ===
                    String(color)
                )
        );


    if (!item) {

        return;

    }


    if (item.quantity < stock) {

        item.quantity++;

    } else {

        alert(
            "Maximum stock reached."
        );

    }


    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    loadCart();

}


// ==========================================
// DECREASE QUANTITY
// ==========================================

function decreaseQuantity(
    productId,
    size = "",
    color = ""
) {

    let cart =
        JSON.parse(
            localStorage.getItem("cart")
        ) || [];


    const item =
        cart.find(
            product =>
                Number(product.id) ===
                Number(productId) &&
                (
                    !size ||
                    String(product.size || "") ===
                    String(size)
                ) &&
                (
                    !color ||
                    String(product.color || "") ===
                    String(color)
                )
        );


    if (!item) {

        return;

    }


    if (item.quantity > 1) {

        item.quantity--;

    } else {

        // Remove when quantity becomes 0

        cart =
            cart.filter(
                product =>
                    !(
                        Number(product.id) ===
                        Number(productId) &&
                        (
                            !size ||
                            String(product.size || "") ===
                            String(size)
                        ) &&
                        (
                            !color ||
                            String(product.color || "") ===
                            String(color)
                        )
                    )
            );

    }


    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    loadCart();

}


// ==========================================
// REMOVE PRODUCT
// ==========================================

function removeFromCart(
    productId,
    size = "",
    color = ""
) {

    let cart =
        JSON.parse(
            localStorage.getItem("cart")
        ) || [];


    cart =
        cart.filter(
            item =>
                !(
                    Number(item.id) ===
                    Number(productId) &&
                    (
                        !size ||
                        String(item.size || "") ===
                        String(size)
                    ) &&
                    (
                        !color ||
                        String(item.color || "") ===
                        String(color)
                    )
                )
        );


    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    loadCart();

}


// ==========================================
// UPDATE SUMMARY
// ==========================================

function updateSummary(cartProducts) {

    let subtotal = 0;


    cartProducts.forEach(product => {

        subtotal +=
            Number(product.price) *
            Number(product.quantity);

    });


    // Shipping

    const shipping =
        subtotal > 0
            ? 50
            : 0;


    const total =
        subtotal + shipping;


    const subtotalElement =
        document.getElementById(
            "cart-subtotal"
        );


    const shippingElement =
        document.getElementById(
            "shipping"
        );


    const totalElement =
        document.getElementById(
            "cart-total"
        );


    if (subtotalElement) {

        subtotalElement.textContent =
            `₹${subtotal.toFixed(2)}`;

    }


    if (shippingElement) {

        shippingElement.textContent =
            `₹${shipping.toFixed(2)}`;

    }


    if (totalElement) {

        totalElement.textContent =
            `₹${total.toFixed(2)}`;

    }

}


// ==========================================
// CART COUNT
// ==========================================

function updateCartCount() {

    const cart =
        JSON.parse(
            localStorage.getItem("cart")
        ) || [];


    const count =
        cart.reduce(
            (total, item) =>
                total +
                Number(item.quantity),
            0
        );


    const cartCount =
        document.getElementById(
            "cart-count"
        );


    if (cartCount) {

        cartCount.textContent =
            count;

    }

}


// ==========================================
// CHECKOUT
// ==========================================

function checkout() {

    const cart =
        JSON.parse(
            localStorage.getItem("cart")
        ) || [];


    if (cart.length === 0) {

        alert(
            "Your cart is empty!"
        );

        return;

    }


    window.location.href =
        "/checkout.html";

}


// ==========================================
// START
// ==========================================

loadCart();

updateCartCount();