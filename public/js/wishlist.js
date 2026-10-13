
// ==========================================
// WISHLIST JAVASCRIPT
// ==========================================

console.log("Wishlist JavaScript Loaded");


// ==========================================
// ELEMENTS
// ==========================================

const wishlistContainer =
    document.getElementById("wishlistContainer");

const wishlistLoading =
    document.getElementById("wishlistLoading");

const emptyWishlist =
    document.getElementById("emptyWishlist");

const wishlistMessage =
    document.getElementById("wishlistMessage");


// ==========================================
// GET USER ID
// ==========================================

function getUserId() {

    // Try direct userId
    const userId =
        localStorage.getItem("userId");

    if (userId) {

        return userId;

    }


    // Try user object
    const user =
        localStorage.getItem("user");

    if (user) {

        try {

            const userData =
                JSON.parse(user);

            return (
                userData.id ||
                userData.user_id ||
                null
            );

        } catch (error) {

            console.error(
                "User data parsing error:",
                error
            );

        }

    }

    return null;

}


// ==========================================
// LOAD WISHLIST
// ==========================================

async function loadWishlist() {

    const userId =
        getUserId();


    // ==========================================
    // CHECK LOGIN
    // ==========================================

    if (!userId) {

        if (wishlistLoading) {

            wishlistLoading.style.display =
                "none";

        }


        if (emptyWishlist) {

            emptyWishlist.style.display =
                "none";

        }


        if (wishlistContainer) {

            wishlistContainer.innerHTML = `

                <div class="empty-wishlist">

                    <div class="empty-icon">
                        🔐
                    </div>

                    <h2>
                        Please Login
                    </h2>

                    <p>
                        Login to view your wishlist.
                    </p>

                    <a
                        href="/login.html"
                        class="shop-button"
                    >
                        Login
                    </a>

                </div>

            `;

        }

        return;

    }


    try {

        // ==========================================
        // SHOW LOADING
        // ==========================================

        if (wishlistLoading) {

            wishlistLoading.style.display =
                "block";

        }


        if (emptyWishlist) {

            emptyWishlist.style.display =
                "none";

        }


        if (wishlistContainer) {

            wishlistContainer.innerHTML =
                "";

        }


        // ==========================================
        // GET WISHLIST
        // ==========================================

        const response =
            await fetch(
                `/api/wishlist?user_id=${encodeURIComponent(userId)}`
            );


        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "Wishlist Response:",
            data
        );


        // ==========================================
        // HIDE LOADING
        // ==========================================

        if (wishlistLoading) {

            wishlistLoading.style.display =
                "none";

        }


        // ==========================================
        // CHECK API RESPONSE
        // ==========================================

        if (!data.success) {

            throw new Error(
                data.message ||
                "Failed to load wishlist."
            );

        }


        // ==========================================
        // EMPTY WISHLIST
        // ==========================================

        if (
            !data.wishlist ||
            !Array.isArray(data.wishlist) ||
            data.wishlist.length === 0
        ) {

            if (emptyWishlist) {

                emptyWishlist.style.display =
                    "block";

            }


            if (wishlistContainer) {

                wishlistContainer.innerHTML =
                    "";

            }

            return;

        }


        // ==========================================
        // HIDE EMPTY MESSAGE
        // ==========================================

        if (emptyWishlist) {

            emptyWishlist.style.display =
                "none";

        }


        // ==========================================
        // DISPLAY PRODUCTS
        // ==========================================

        displayWishlist(
            data.wishlist
        );

    }


    catch (error) {

        console.error(
            "Wishlist loading error:",
            error
        );


        if (wishlistLoading) {

            wishlistLoading.style.display =
                "none";

        }


        if (emptyWishlist) {

            emptyWishlist.style.display =
                "none";

        }


        if (wishlistContainer) {

            wishlistContainer.innerHTML = `

                <div class="empty-wishlist">

                    <div class="empty-icon">
                        ⚠️
                    </div>

                    <h2>
                        Unable to Load Wishlist
                    </h2>

                    <p>
                        ${escapeHtml(error.message)}
                    </p>

                    <button
                        type="button"
                        class="shop-button"
                        onclick="loadWishlist()"
                    >
                        Try Again
                    </button>

                </div>

            `;

        }

    }

}


// ==========================================
// DISPLAY WISHLIST
// ==========================================

function displayWishlist(wishlist) {

    if (!wishlistContainer) {

        return;

    }


    wishlistContainer.innerHTML =
        "";


    wishlist.forEach(function (item) {

        // ==========================================
        // SUPPORT DIFFERENT API STRUCTURES
        // ==========================================

        const product =
            item.product || item;


        // ==========================================
        // PRODUCT ID
        // ==========================================

        const productId =
            product.product_id ||
            product.productId ||
            product.id;


        // ==========================================
        // PRODUCT NAME
        // ==========================================

        const name =
            product.name ||
            product.title ||
            "Product";


        // ==========================================
        // PRODUCT PRICE
        // ==========================================

        const price =
            Number(
                product.price || 0
            );


        // ==========================================
        // PRODUCT DESCRIPTION
        // ==========================================

        const description =
            product.description ||
            "No description available.";


        // ==========================================
        // PRODUCT CATEGORY
        // ==========================================

        const category =
            product.category ||
            "General";


        // ==========================================
        // PRODUCT IMAGE
        // ==========================================

        let imagePath =
            String(
                product.image ||
                "tshirt1.jpg"
            ).trim();

        if (imagePath.startsWith("[") && imagePath.endsWith("]")) {
            try {
                const parsed = JSON.parse(imagePath);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    imagePath = String(parsed[0] || "tshirt1.jpg").trim();
                }
            } catch (e) {}
        }

        const imageName =
            imagePath.toLowerCase();


        // ==========================================
        // FIX OLD IMAGE NAMES
        // ==========================================

        if (
            imageName === "tshirt.jpg" ||
            imageName === "/images/tshirt.jpg"
        ) {

            imagePath =
                "/images/tshirt1.jpg";

        }


        if (
            imageName === "shirt.jpg" ||
            imageName === "/images/shirt.jpg"
        ) {

            imagePath =
                "/images/shirt2.jpg";

        }


        if (
            imageName === "jeans.jpg" ||
            imageName === "/images/jeans.jpg"
        ) {

            imagePath =
                "/images/jeans3.jpg";

        }


        // ==========================================
        // ADD /images IF REQUIRED
        // ==========================================

        if (
            !imagePath.startsWith("/") &&
            !imagePath.startsWith("http://") &&
            !imagePath.startsWith("https://")
        ) {

            imagePath =
                "/images/" + imagePath;

        }


        // ==========================================
        // CREATE CARD
        // ==========================================

        const card =
            document.createElement("div");

        card.className =
            "wishlist-card";


        // ==========================================
        // CARD HTML
        // ==========================================

        card.innerHTML = `

            <img
                src="${escapeHtml(imagePath)}"
                alt="${escapeHtml(name)}"
                class="wishlist-image"
                onerror="
                    this.onerror=null;
                    this.src='/images/tshirt1.jpg';
                "
            >


            <div class="wishlist-content">


                <div class="wishlist-name">
                    ${escapeHtml(name)}
                </div>


                <div class="wishlist-description">
                    ${escapeHtml(description)}
                </div>


                <div class="wishlist-price">
                    ₹${price.toFixed(2)}
                </div>


                <div class="wishlist-category">

                    Category:
                    ${escapeHtml(category)}

                </div>


                <div class="wishlist-actions">


                    <!-- MOVE TO CART -->

                    <button
                        type="button"
                        class="move-cart-btn"
                        data-product-id="${productId}"
                    >
                        <i class="fa-solid fa-bag-shopping"></i> Move to Cart
                    </button>


                    <!-- REMOVE -->

                    <button
                        type="button"
                        class="remove-wishlist-btn"
                        data-product-id="${productId}"
                        title="Remove from Wishlist"
                    >
                        <i class="fa-regular fa-trash-can"></i> Remove
                    </button>


                </div>


            </div>

        `;


        // ==========================================
        // MOVE TO CART BUTTON
        // ==========================================

        const moveButton =
            card.querySelector(
                ".move-cart-btn"
            );


        if (moveButton) {

            moveButton.addEventListener(
                "click",
                function () {

                    moveToCart(
                        productId,
                        name,
                        price,
                        imagePath
                    );

                }
            );

        }


        // ==========================================
        // REMOVE BUTTON
        // ==========================================

        const removeButton =
            card.querySelector(
                ".remove-wishlist-btn"
            );


        if (removeButton) {

            removeButton.addEventListener(
                "click",
                function () {

                    removeFromWishlist(
                        productId
                    );

                }
            );

        }


        // ==========================================
        // ADD CARD
        // ==========================================

        wishlistContainer.appendChild(
            card
        );

    });

}


// ==========================================
// MOVE TO CART
// ==========================================

async function moveToCart(
    productId,
    productName,
    productPrice,
    productImage
) {

    try {

        // ==========================================
        // CHECK LOGIN
        // ==========================================

        const userId =
            getUserId();


        if (!userId) {

            alert(
                "Please login first."
            );

            window.location.href =
                "/login.html";

            return;

        }


        // ==========================================
        // GET CART
        // ==========================================

        let cart = [];


        try {

            cart =
                JSON.parse(
                    localStorage.getItem("cart")
                ) || [];


            if (!Array.isArray(cart)) {

                cart = [];

            }

        } catch (error) {

            console.error(
                "Cart parsing error:",
                error
            );

            cart = [];

        }


        // ==========================================
        // CHECK EXISTING PRODUCT
        // ==========================================

        const existingProduct =
            cart.find(
                function (item) {

                    return Number(
                        item.id ||
                        item.product_id
                    ) === Number(productId);

                }
            );


        // ==========================================
        // INCREASE QUANTITY
        // ==========================================

        if (existingProduct) {

            existingProduct.quantity =
                Number(
                    existingProduct.quantity || 1
                ) + 1;

        }


        // ==========================================
        // ADD NEW PRODUCT
        // ==========================================

        else {

            cart.push({

                id:
                    productId,

                product_id:
                    productId,

                name:
                    productName,

                price:
                    Number(productPrice),

                image:
                    productImage,

                quantity:
                    1

            });

        }


        // ==========================================
        // SAVE CART
        // ==========================================

        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );


        // ==========================================
        // UPDATE CART COUNT
        // ==========================================

        updateCartCount();


        console.log(
            "Product moved to cart:",
            productId
        );


        // ==========================================
        // REMOVE FROM WISHLIST
        // ==========================================

        const removeResponse =
            await fetch(
                `/api/wishlist/${productId}`,
                {

                    method: "DELETE",

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


        const removeData =
            await removeResponse.json();


        console.log(
            "Wishlist remove response:",
            removeData
        );


        // ==========================================
        // CHECK REMOVE RESULT
        // ==========================================

        if (!removeResponse.ok) {

            throw new Error(
                removeData.message ||
                "Product was added to cart, but could not be removed from wishlist."
            );

        }


        // ==========================================
        // SUCCESS MESSAGE
        // ==========================================

        showMessage(
            `${productName} moved to cart successfully!`
        );


        // ==========================================
        // RELOAD WISHLIST
        // ==========================================

        setTimeout(
            function () {

                loadWishlist();

            },
            700
        );

    }


    catch (error) {

        console.error(
            "Move to cart error:",
            error
        );


        alert(
            error.message ||
            "Unable to move product to cart."
        );

    }

}


// ==========================================
// REMOVE FROM WISHLIST
// ==========================================

async function removeFromWishlist(
    productId
) {

    try {

        // ==========================================
        // GET USER ID
        // ==========================================

        const userId =
            getUserId();


        if (!userId) {

            alert(
                "Please login first."
            );

            return;

        }


        // ==========================================
        // DELETE REQUEST
        // ==========================================

        const response =
            await fetch(
                `/api/wishlist/${productId}`,
                {

                    method: "DELETE",

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


        console.log(
            "Remove wishlist response:",
            data
        );


        // ==========================================
        // CHECK RESPONSE
        // ==========================================

        if (!response.ok || !data.success) {

            alert(
                data.message ||
                "Unable to remove product."
            );

            return;

        }


        // ==========================================
        // SUCCESS
        // ==========================================

        showMessage(
            "Product removed from wishlist."
        );


        // ==========================================
        // RELOAD
        // ==========================================

        loadWishlist();

    }


    catch (error) {

        console.error(
            "Remove wishlist error:",
            error
        );


        alert(
            "Something went wrong while removing the product."
        );

    }

}


// ==========================================
// UPDATE CART COUNT
// ==========================================

function updateCartCount() {

    const cartCount =
        document.getElementById(
            "cart-count"
        );


    if (!cartCount) {

        return;

    }


    let cart = [];


    try {

        cart =
            JSON.parse(
                localStorage.getItem("cart")
            ) || [];


        if (!Array.isArray(cart)) {

            cart = [];

        }

    }


    catch (error) {

        console.error(
            "Cart data error:",
            error
        );

        cart = [];

    }


    const totalQuantity =
        cart.reduce(
            function (
                total,
                item
            ) {

                return (
                    total +
                    Number(
                        item.quantity || 0
                    )
                );

            },
            0
        );


    cartCount.textContent =
        totalQuantity;

}


// ==========================================
// SUCCESS MESSAGE
// ==========================================

function showMessage(
    message
) {

    if (!wishlistMessage) {

        return;

    }


    wishlistMessage.textContent =
        message;


    wishlistMessage.style.display =
        "block";


    setTimeout(
        function () {

            wishlistMessage.style.display =
                "none";

        },
        2500
    );

}


// ==========================================
// HTML ESCAPE
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
// WISHLIST HISTORY CONTROLLER
// ==========================================

function recordWishlistHistory(item) {
    if (!item) return;
    try {
        let history = JSON.parse(localStorage.getItem("wishlistHistory")) || [];
        const id = item.id || item.product_id;
        if (!history.some(h => String(h.id) === String(id))) {
            history.unshift({
                id: id,
                name: item.name || "Product",
                price: item.price || 0,
                image: item.image || "",
                savedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            });
            localStorage.setItem("wishlistHistory", JSON.stringify(history.slice(0, 30)));
        }
    } catch (e) {
        console.error("Failed to record wishlist history:", e);
    }
}

function loadWishlistView(view) {
    const headerTitle = document.querySelector(".wishlist-header h1");
    const headerSub = document.querySelector(".wishlist-header p");

    if (view === "history") {
        if (headerTitle) headerTitle.textContent = "Wishlist History";
        if (headerSub) headerSub.textContent = "Products you previously saved or interacted with";
        showWishlistHistory();
    } else {
        if (headerTitle) headerTitle.textContent = "My Wishlist";
        if (headerSub) headerSub.textContent = "Products you saved for later";
        loadWishlist();
    }
}

function showWishlistHistory() {
    if (wishlistLoading) wishlistLoading.style.display = "none";
    if (!wishlistContainer) return;

    let history = [];
    try {
        history = JSON.parse(localStorage.getItem("wishlistHistory")) || [];
    } catch (e) {
        history = [];
    }

    if (!Array.isArray(history) || history.length === 0) {
        if (emptyWishlist) emptyWishlist.style.display = "none";
        wishlistContainer.innerHTML = `
            <div class="empty-wishlist" style="display:block;">
                <div class="empty-icon"><i class="fa-solid fa-clock-rotate-left"></i></div>
                <h2>No Wishlist History</h2>
                <p>Items you save, remove, or interact with will appear here.</p>
                <a href="/wishlist.html" class="shop-button" onclick="event.preventDefault(); window.loadWishlistView('active'); window.history.pushState({}, '', '/wishlist.html');">View Active Wishlist</a>
            </div>
        `;
        return;
    }

    if (emptyWishlist) emptyWishlist.style.display = "none";
    wishlistContainer.innerHTML = "";

    history.forEach(function (item) {
        const card = document.createElement("div");
        card.className = "wishlist-card";
        const imagePath = item.image ? (item.image.startsWith('/') ? item.image : '/images/' + item.image) : '/images/tshirt1.jpg';
        card.innerHTML = `
            <img src="${escapeHtml(imagePath)}" alt="${escapeHtml(item.name || 'Product')}" class="wishlist-image" onerror="this.onerror=null; this.src='/images/tshirt1.jpg';">
            <div class="wishlist-content">
                <div class="wishlist-name">${escapeHtml(item.name || 'Product')}</div>
                <div class="wishlist-price">₹${Number(item.price || 0).toFixed(2)}</div>
                <div class="wishlist-category" style="color: #888; font-size: 13px;">${item.savedAt ? 'Saved on ' + escapeHtml(item.savedAt) : 'Previously saved'}</div>
                <div class="wishlist-actions" style="margin-top: 12px;">
                    <a href="/products.html" class="move-cart-btn" style="text-decoration:none; text-align:center;">
                        <i class="fa-solid fa-cart-plus"></i> View in Shop
                    </a>
                </div>
            </div>
        `;
        wishlistContainer.appendChild(card);
    });
}

window.loadWishlistView = loadWishlistView;
window.loadWishlist = loadWishlist;
window.recordWishlistHistory = recordWishlistHistory;


// ==========================================
// START
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateCartCount();

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("view") === "history") {
            loadWishlistView("history");
        } else {
            loadWishlistView("active");
        }

    }
);

