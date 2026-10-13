const DEFAULT_FALLBACK_PRODUCTS = [];

// ==========================================
// PRODUCT API + CART COUNT + USER LOGIN
// ==========================================

const trendingContainer =
    document.getElementById("trendingContainer");

const newArrivalsContainer =
    document.getElementById("newArrivalsContainer");

const customerFavoritesContainer =
    document.getElementById("customerFavoritesContainer");

const productContainer =
    document.getElementById("product-container");


// ==========================================
// GET PRODUCTS FROM NODE.JS API
// ==========================================

async function getProducts() {

    try {

        const response =
            await fetch("/api/products");

        const data =
            await response.json();

        if (!data.success || !Array.isArray(data.products)) {
            return;
        }

        let products = data.products || [];
        try {
            const deletedIds = JSON.parse(localStorage.getItem("mystore_deleted_product_ids") || "[]");
            if (deletedIds && deletedIds.length > 0) {
                products = products.filter(p => !deletedIds.includes(Number(p.id)) && !deletedIds.includes(String(p.id)));
            }
        } catch (e) {}

        if (products.length === 0) {
            return;
        }

        // If index page sections exist, populate them dynamically
        if (trendingContainer || newArrivalsContainer || customerFavoritesContainer) {
            populateHomeSections(products);
        }

        if (productContainer) {
            displayProducts(products);
        }

    }

    catch (error) {
        console.warn("Product API offline / static mode, using fallback:", error);
        if (typeof DEFAULT_FALLBACK_PRODUCTS !== "undefined" && Array.isArray(DEFAULT_FALLBACK_PRODUCTS)) {
            if (trendingContainer || newArrivalsContainer || customerFavoritesContainer) {
                populateHomeSections(DEFAULT_FALLBACK_PRODUCTS);
            }
            if (productContainer) {
                displayProducts(DEFAULT_FALLBACK_PRODUCTS);
            }
        }
    }

}


// ==========================================
// POPULATE HOME SECTIONS
// ==========================================

function populateHomeSections(products) {

    if (!Array.isArray(products) || products.length === 0) {
        return;
    }

    // Trending: first 4 products
    if (trendingContainer && products.length >= 1) {
        const trendingItems = products.slice(0, 4);
        renderProductGrid(trendingContainer, trendingItems, "badge-trending", "Trending", 4.9);
    }

    // New Arrivals: next 4 (or reversed)
    if (newArrivalsContainer && products.length >= 1) {
        const newItems = products.length >= 8
            ? products.slice(4, 8)
            : [...products].reverse().slice(0, 4);
        renderProductGrid(newArrivalsContainer, newItems, "badge-new", "New", 4.8);
    }

    // Customer Favorites: remaining or top products
    if (customerFavoritesContainer && products.length >= 1) {
        const favItems = products.length >= 12
            ? products.slice(8, 12)
            : products.slice(0, 4);
        renderProductGrid(customerFavoritesContainer, favItems, "badge-favorite", "Bestseller", 5.0);
    }

}


// ==========================================
// COLOR MATCHING & PALETTES FOR HOME PRODUCTS
// ==========================================

function normalizeProductImagePath(image) {
    let value = String(image || "").trim();
    if (!value) value = "shirt2.jpg";
    if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) return value;

    // Handle stringified JSON array: '["/images/123.jpg"]'
    if (value.startsWith("[") && value.endsWith("]")) {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed) && parsed.length > 0) {
                value = String(parsed[0] || "").trim();
            }
        } catch (e) {}
    }

    const isStaticDeploy = (typeof window !== "undefined") && (
        window.location.hostname.endsWith("github.io") ||
        window.location.protocol === "file:" ||
        window.location.pathname.includes("/ecommerce-node/")
    );

    let cleanPath = value.replace(/^\/+/, "");
    if (cleanPath.startsWith("public/")) {
        cleanPath = cleanPath.slice(7);
    }

    if (isStaticDeploy) {
        const pathname = (typeof window !== "undefined" && window.location.pathname) ? window.location.pathname.replace(/\\/g, "/") : "";
        const inAdmin = pathname.includes("/admin/");
        const inViews = pathname.includes("/views/");
        const prefix = inAdmin ? (inViews ? "../../public/" : "../public/") : (inViews ? "../public/" : "./public/");
        
        if (cleanPath.startsWith("images/")) {
            return prefix + cleanPath;
        }
        return prefix + "images/" + cleanPath;
    }

    if (cleanPath.startsWith("images/")) return "/" + cleanPath;
    return "/images/" + cleanPath;
}

function getProductImages(product) {
    if (!product || !product.image) return [];
    const rawImage = String(product.image).trim();
    if (!rawImage) return [];
    try {
        const parsed = JSON.parse(rawImage);
        if (Array.isArray(parsed)) {
            return parsed.filter(Boolean).map(function (image) {
                return normalizeProductImagePath(image);
            });
        }
    } catch (e) {}
    return [normalizeProductImagePath(rawImage)];
}

function getColorHex(colorName) {
    if (!colorName) return "#64748B";
    const c = String(colorName).trim().toLowerCase();
    if (c.startsWith("#")) return c;

    // Specific multi-word shades first
    if (c.includes("light blue") || c.includes("sky blue") || c.includes("powder blue") || c.includes("baby blue")) return "#38BDF8";
    if (c.includes("dark blue")) return "#1E3A8A";
    if (c.includes("royal blue")) return "#1D4ED8";
    if (c.includes("dark teal")) return "#115E59";
    if (c.includes("peacock")) return "#0E7490";
    if (c.includes("sea green")) return "#059669";
    if (c.includes("dark green") || c.includes("forest")) return "#14532D";
    if (c.includes("burnt orange") || c.includes("rust")) return "#C2410C";
    if (c.includes("peach")) return "#FB923C";
    if (c.includes("coral")) return "#F97316";
    if (c.includes("rose")) return "#F43F5E";
    if (c.includes("blush") || c.includes("salmon")) return "#FB7185";
    if (c.includes("mustard")) return "#CA8A04";
    if (c.includes("lavender") || c.includes("lilac")) return "#C084FC";
    if (c.includes("plum")) return "#581C87";
    if (c.includes("tan")) return "#D2B48C";
    if (c.includes("mocha")) return "#6F4E37";

    // Primary / Standard shades
    if (c.includes("navy") || c.includes("midnight")) return "#1B2A4A";
    if (c.includes("teal") || c.includes("cyan") || c.includes("turquoise") || c.includes("aqua")) return "#0D9488";
    if (c.includes("olive") || c.includes("military") || c.includes("army")) return "#65A30D";
    if (c.includes("sage")) return "#84A98C";
    if (c.includes("mint") || c.includes("seafoam")) return "#6EE7B7";
    if (c.includes("blue") || c.includes("indigo") || c.includes("royal") || c.includes("powder") || c.includes("sky")) return "#2563EB";
    if (c.includes("maroon") || c.includes("burgundy") || c.includes("wine")) return "#832729";
    if (c.includes("red") || c.includes("crimson") || c.includes("ruby")) return "#DC2626";
    if (c.includes("orange")) return "#EA580C";
    if (c.includes("green") || c.includes("emerald")) return "#16A34A";
    if (c.includes("yellow") || c.includes("gold") || c.includes("lemon") || c.includes("amber")) return "#EAB308";
    if (c.includes("pink") || c.includes("magenta")) return "#EC4899";
    if (c.includes("purple") || c.includes("violet")) return "#9333EA";
    if (c.includes("brown") || c.includes("cognac")) return "#78350F";
    if (c.includes("camel") || c.includes("beige") || c.includes("khaki") || c.includes("sand")) return "#D4B996";
    if (c.includes("charcoal")) return "#334155";
    if (c.includes("grey") || c.includes("gray") || c.includes("silver") || c.includes("ash")) return "#64748B";
    if (c.includes("white") || c.includes("cream") || c.includes("ivory")) return "#FFFFFF";
    if (c.includes("black") || c.includes("jet") || c.includes("obsidian")) return "#181818";

    return "#64748B";
}

function getMatchingColorPhoto(category, color) {
    if (!color) return "/images/jacket3.jpg";
    const cat = String(category || "").toLowerCase();
    const c = String(color || "").trim().toLowerCase();

    // 1. Jackets
    if (cat.includes("jacket") || cat.includes("coat") || cat.includes("outerwear") || cat.includes("hoodie")) {
        if (c.includes("blue") || c.includes("navy") || c.includes("sky")) return "/images/jacket2.jpg";
        if (c.includes("black") || c.includes("dark") || c.includes("jet")) return "/images/jacket3.jpg";
        if (c.includes("red") || c.includes("maroon") || c.includes("burgundy") || c.includes("wine")) return "/images/jacket6.jpg";
        if (c.includes("white") || c.includes("cream")) return "/images/jacket4.jpg";
        if (c.includes("green") || c.includes("olive") || c.includes("military")) return "/images/jacket1.jpg";
        if (c.includes("brown") || c.includes("tan") || c.includes("cognac")) return "/images/shirt2.jpg";
    }

    // 2. Jeans & Pants
    if (cat.includes("jean") || cat.includes("pant") || cat.includes("bottom") || cat.includes("short")) {
        if (c.includes("blue") || c.includes("indigo") || c.includes("denim")) return "/images/jeans3.jpg";
        if (c.includes("black") || c.includes("dark")) return "/images/jacket3.jpg";
        if (c.includes("white")) return "/images/jacket4.jpg";
        if (c.includes("red")) return "/images/jacket6.jpg";
    }

    // 3. T-Shirts
    if (cat.includes("t-shirt") || cat.includes("tshirt") || cat.includes("tee")) {
        if (c.includes("black") || c.includes("dark") || c.includes("jet")) return "/images/tshirt4.jpg";
        if (c.includes("navy")) return "/images/tshirt1.jpg";
        if (c.includes("blue") || c.includes("sky")) return "/images/tshirt10.jpg";
        if (c.includes("red") || c.includes("maroon") || c.includes("crimson")) return "/images/tshirt7.jpg";
        if (c.includes("white") || c.includes("cream")) return "/images/tshirt9.jpg";
        if (c.includes("green") || c.includes("olive") || c.includes("military")) return "/images/tshirt2.jpg";
        if (c.includes("grey") || c.includes("gray")) return "/images/tshirt3.jpg";
        if (c.includes("teal") || c.includes("cyan")) return "/images/tshirt10.jpg";
        return "/images/tshirt4.jpg";
    }

    // 4. Shirts (Real Shirt Photos)
    if (cat.includes("shirt")) {
        if (c.includes("navy")) return "/images/shirt7.jpg";
        if (c.includes("blue") || c.includes("sky")) return "/images/shirt10.jpg";
        if (c.includes("red") || c.includes("maroon") || c.includes("crimson")) return "/images/shirt9.jpg";
        if (c.includes("orange") || c.includes("coral") || c.includes("rust")) return "/images/shirt11.jpg";
        if (c.includes("yellow") || c.includes("gold") || c.includes("mustard")) return "/images/shirt11.jpg";
        if (c.includes("brown") || c.includes("tan") || c.includes("khaki") || c.includes("beige")) return "/images/shirt2.jpg";
        if (c.includes("green") || c.includes("teal") || c.includes("peacock") || c.includes("olive")) return "/images/shirt8.jpg";
        if (c.includes("grey") || c.includes("gray") || c.includes("charcoal")) return "/images/shirt6.jpg";
        if (c.includes("pink") || c.includes("rose") || c.includes("peach")) return "/images/shirt5.jpg";
        if (c.includes("black") || c.includes("dark") || c.includes("jet")) return "/images/shirt4.jpg";
        if (c.includes("white") || c.includes("cream")) return "/images/shirt3.jpg";
        return "/images/shirt10.jpg";
    }

    // 5. Direct color match fallback
    if (c.includes("navy")) return "/images/tshirt1.jpg";
    if (c.includes("blue")) return "/images/tshirt10.jpg";
    if (c.includes("black") || c.includes("dark")) return "/images/tshirt4.jpg";
    if (c.includes("red") || c.includes("maroon")) return "/images/tshirt7.jpg";
    if (c.includes("orange") || c.includes("coral") || c.includes("rust")) return "/images/shirt11.jpg";
    if (c.includes("yellow") || c.includes("gold") || c.includes("mustard")) return "/images/shirt11.jpg";
    if (c.includes("white") || c.includes("cream")) return "/images/tshirt9.jpg";
    if (c.includes("green") || c.includes("olive")) return "/images/tshirt2.jpg";
    if (c.includes("grey") || c.includes("gray")) return "/images/tshirt3.jpg";
    if (c.includes("brown") || c.includes("tan")) return "/images/shirt2.jpg";

    return "/images/tshirt4.jpg";
}

function getProductColorSwatches(product) {
    const category = String(product?.category || "").trim().toLowerCase();
    const collected = [];
    const seen = new Set();

    function addColor(name, img) {
        if (!name) return;
        const key = String(name).trim().toLowerCase();
        if (!key || seen.has(key)) return;
        seen.add(key);
        const hex = getColorHex(key);
        const photo = img || getMatchingColorPhoto(category, key);
        collected.push({
            name: String(name).trim(),
            hex: hex,
            image: photo,
            border: hex === "#FFFFFF"
        });
    }

    // 1. From product.variants
    if (Array.isArray(product?.variants) && product.variants.length > 0) {
        product.variants.forEach(function (v) {
            if (v && v.color) {
                addColor(v.color, v.image);
            }
        });
    }

    // 2. From product.colors
    if (product?.colors) {
        if (Array.isArray(product.colors)) {
            product.colors.forEach(function (c) { addColor(c); });
        } else if (typeof product.colors === "string") {
            product.colors.split(",").forEach(function (c) { addColor(c); });
        }
    }
    if (product?.color) {
        addColor(product.color);
    }

    // 3. Fallback defaults per category
    if (collected.length === 0) {
        if (category.includes("jacket") || category.includes("coat") || category.includes("outerwear") || category.includes("hoodie")) {
            addColor("Black", "/images/jacket3.jpg");
            addColor("Blue", "/images/jacket2.jpg");
            addColor("Red", "/images/jacket6.jpg");
            addColor("White", "/images/jacket4.jpg");
            addColor("Green", "/images/jacket1.jpg");
        } else if (category.includes("t-shirt") || category.includes("tee")) {
            addColor("Navy", "/images/tshirt1.jpg");
            addColor("Black", "/images/jacket3.jpg");
            addColor("White", "/images/jacket4.jpg");
            addColor("Red", "/images/jacket6.jpg");
        } else if (category.includes("t-shirt") || category.includes("tshirt") || category.includes("tee")) {
            addColor("Black", "/images/tshirt4.jpg");
            addColor("Blue", "/images/tshirt1.jpg");
            addColor("Red", "/images/tshirt7.jpg");
            addColor("White", "/images/tshirt9.jpg");
            addColor("Green", "/images/tshirt2.jpg");
        } else if (category.includes("shirt")) {
            addColor("Brown", "/images/shirt2.jpg");
            addColor("Blue", "/images/jacket2.jpg");
            addColor("Black", "/images/jacket3.jpg");
            addColor("White", "/images/jacket4.jpg");
        } else if (category.includes("jean") || category.includes("pant")) {
            addColor("Blue", "/images/jeans3.jpg");
            addColor("Black", "/images/jacket3.jpg");
            addColor("White", "/images/jacket4.jpg");
        } else {
            addColor("Black", "/images/jacket3.jpg");
            addColor("Blue", "/images/jacket2.jpg");
            addColor("Red", "/images/jacket6.jpg");
            addColor("White", "/images/jacket4.jpg");
        }
    }

    return collected;
}

function switchCardColor(event, badgeEl, productId, newImageSrc, colorName) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }

    const card = badgeEl ? badgeEl.closest(".product-card, .home-product-card") : null;
    if (!card) return;

    // 1. Update image with smooth fade (offline/file-protocol aware)
    const img = card.querySelector(".product-image img, .product-thumb-wrap img, img");
    if (img && newImageSrc) {
        let resolvedSrc = newImageSrc;
        if (window.location.protocol === "file:") {
            const inViews = window.location.pathname.replace(/\\/g, "/").toLowerCase().includes("/views/");
            const publicPrefix = inViews ? "../public/" : "public/";
            if (resolvedSrc.startsWith("/images/")) {
                resolvedSrc = publicPrefix + "images/" + resolvedSrc.replace("/images/", "");
            }
        }
        img.style.transition = "opacity 0.2s ease, transform 0.25s ease";
        img.style.opacity = "0.3";
        img.style.transform = "scale(0.97)";
        setTimeout(function () {
            img.src = resolvedSrc;
            img.style.opacity = "1";
            img.style.transform = "scale(1)";
        }, 130);
    }

    // 2. Active swatch state
    const swatches = card.querySelectorAll(".card-color-badge");
    swatches.forEach(function (b) { b.classList.remove("active"); });
    badgeEl.classList.add("active");

    // 3. Store selected color on card
    card.dataset.selectedColor = colorName;

    // 4. Update links in card to point to product-details with this color
    const links = card.querySelectorAll("a[data-card-link]");
    links.forEach(function (link) {
        if (window.location.protocol === "file:") {
            const inViews = window.location.pathname.replace(/\\/g, "/").toLowerCase().includes("/views/");
            const prefix = inViews ? "./" : "views/";
            link.href = `${prefix}product-details.html?id=${encodeURIComponent(productId)}&color=${encodeURIComponent(colorName)}`;
        } else {
            link.href = `/product-details.html?id=${encodeURIComponent(productId)}&color=${encodeURIComponent(colorName)}`;
        }
    });
}
window.switchCardColor = switchCardColor;


// ==========================================
// RENDER PRODUCT GRID
// ==========================================

function renderProductGrid(container, items, badgeClass, badgeLabel, baseRating) {

    if (!container || !Array.isArray(items) || items.length === 0) {
        return;
    }

    container.innerHTML = items.map((product, index) => {

        const id = product.id;
        const name = escapeHtml(product.name || "Product");
        const price = Number(product.price || 0);
        const originalPrice = Math.round(price * 1.45);
        const category = escapeHtml(product.category || "Fashion");
        const colorSwatchesList = getProductColorSwatches(product);
        const homeImg = formatHomeImage(product.image);
        let activeIdx = 0;
        if (colorSwatchesList.length > 0) {
            const matchIdx = colorSwatchesList.findIndex(function (s) {
                return s.image && String(s.image).trim().toLowerCase() === String(homeImg).trim().toLowerCase();
            });
            if (matchIdx >= 0) activeIdx = matchIdx;
        }
        const initialColor = colorSwatchesList.length > 0 ? colorSwatchesList[activeIdx].name : "";
        const rawImg = (colorSwatchesList.length > 0 && colorSwatchesList[activeIdx].image) ? colorSwatchesList[activeIdx].image : homeImg;
        const image = normalizeProductImagePath(rawImg);
        const rating = (baseRating - (index * 0.1)).toFixed(1);

        const swatchesHtml = colorSwatchesList.length > 0 ? `
            <div class="card-color-swatches" onclick="event.stopPropagation();" title="Choose color">
                ${colorSwatchesList.map((swatch, idx) => `
                    <button
                        type="button"
                        class="card-color-badge ${swatch.border ? 'white-swatch' : ''} ${idx === activeIdx ? 'active' : ''}"
                        style="background-color: ${swatch.hex};"
                        title="${escapeHtml(swatch.name)}"
                        aria-label="${escapeHtml(swatch.name)}"
                        onclick="switchCardColor(event, this, ${id}, '${escapeHtml(swatch.image)}', '${escapeHtml(swatch.name)}')"
                    >
                        <i class="fa-solid fa-check"></i>
                    </button>
                `).join("")}
            </div>
        ` : "";

        const productUrl = `./product-details.html?id=${encodeURIComponent(id)}${initialColor ? '&color=' + encodeURIComponent(initialColor) : ''}`;

        return `
            <div class="home-product-card" data-product-id="${id}" ${initialColor ? `data-selected-color="${escapeHtml(initialColor)}"` : ''}>
                <span class="product-badge ${badgeClass}">${badgeLabel}</span>
                <button type="button" class="card-wish-btn" onclick="toggleWishlist(${id})" title="Add to Wishlist">
                    <i class="fa-regular fa-heart"></i>
                </button>
                <a href="${productUrl}" class="product-thumb-wrap" data-card-link>
                    <img src="${image}" alt="${name}" onerror="this.src=normalizeProductImagePath('shirt2.jpg')">
                </a>
                <div class="home-card-body">
                    <span class="home-card-category">${category}</span>
                    <a href="${productUrl}" class="home-card-title" data-card-link>${name}</a>
                    ${swatchesHtml}
                    <div class="home-card-rating">
                        <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
                        <span>(${rating})</span>
                    </div>
                    <div class="home-card-price-row">
                        <span class="home-card-price">₹${price.toFixed(2)}</span>
                        <span class="home-card-old-price">₹${originalPrice.toFixed(2)}</span>
                        <span class="home-card-discount">35% OFF</span>
                    </div>
                    <button type="button" class="home-card-add-btn" onclick="quickAddToCart(${id}, '${name.replace(/'/g, "\\'")}', ${price}, '${image}')">
                        <i class="fa-solid fa-bag-shopping"></i> Add to Cart
                    </button>
                </div>
            </div>
        `;

    }).join("");

}


// ==========================================
// FORMAT HOME IMAGE
// ==========================================

function formatHomeImage(image) {
    return normalizeProductImagePath(image);
}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(str) {

    if (str === null || str === undefined) return "";

    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// QUICK ADD TO CART
// ==========================================

function quickAddToCart(productId, productName, price, image) {

    try {

        let cart =
            JSON.parse(localStorage.getItem("cart")) || [];

        const existing =
            cart.find(item => Number(item.id || item.product_id) === Number(productId));

        if (existing) {

            existing.quantity =
                Number(existing.quantity || 1) + 1;

        } else {

            cart.push({
                id: Number(productId),
                product_id: Number(productId),
                name: productName || "Fashion Product",
                price: Number(price) || 0,
                image: image || "/images/tshirt1.jpg",
                quantity: 1
            });

        }

        localStorage.setItem("cart", JSON.stringify(cart));

        updateCartCount();

        showToastNotification(`${productName || "Product"} added to cart! 🛍️`);

    } catch (error) {

        console.error("Add to cart error:", error);

    }

}


// ==========================================
// TOGGLE WISHLIST
// ==========================================

function toggleWishlist(productId) {

    try {

        let wishlist =
            JSON.parse(localStorage.getItem("wishlist")) || [];

        const idNum = Number(productId);
        const idx = wishlist.indexOf(idNum);

        if (idx > -1) {

            wishlist.splice(idx, 1);
            showToastNotification("Removed from wishlist");

        } else {

            wishlist.push(idNum);
            showToastNotification("Added to wishlist ❤️");

        }

        localStorage.setItem("wishlist", JSON.stringify(wishlist));

    } catch (error) {

        console.error("Wishlist error:", error);

    }

}


// ==========================================
// COPY COUPON CODE
// ==========================================

function copyCouponCode() {

    const code = "LUXE40";

    navigator.clipboard.writeText(code).then(function () {

        const btn = document.getElementById("copyCouponBtn");

        if (btn) {

            btn.innerHTML = '<i class="fa-solid fa-check"></i> COPIED!';
            btn.style.background = '#0f5132';
            btn.style.color = '#ffffff';

            setTimeout(function () {
                btn.innerHTML = '<i class="fa-solid fa-copy"></i> COPY';
                btn.style.background = '#C5A059';
                btn.style.color = '#1F1F1F';
            }, 2000);

        }

        showToastNotification("Coupon LUXE40 copied to clipboard! 🎟️");

    }).catch(function () {

        showToastNotification("Promo code: LUXE40");

    });

}


// ==========================================
// TOAST NOTIFICATION
// ==========================================

function showToastNotification(message) {

    let toast = document.getElementById("homeToastNotice");

    if (!toast) {

        toast = document.createElement("div");
        toast.id = "homeToastNotice";
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #1F1F1F;
            color: #ffffff;
            border-left: 4px solid #C5A059;
            padding: 14px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            z-index: 99999;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 10px;
            transition: opacity 0.3s ease, transform 0.3s ease;
            opacity: 0;
            transform: translateY(20px);
            pointer-events: none;
        `;

        document.body.appendChild(toast);

    }

    toast.textContent = message;
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";

    clearTimeout(toast._timeout);

    toast._timeout = setTimeout(function () {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(20px)";
    }, 2500);

}

async function addToCart(productId) {

    try {

        // Get current cart

        let cart =
            JSON.parse(
                localStorage.getItem("cart")
            ) || [];


        // Get products from API

        const response =
            await fetch("/api/products");


        const data =
            await response.json();


        if (!data.success) {

            alert(
                "Unable to add product."
            );

            return;
        }


        // Find selected product

        const product =
            data.products.find(
                item => item.id === productId
            );


        if (!product) {

            alert(
                "Product not found."
            );

            return;
        }


        // Check existing product

        const existingProduct =
            cart.find(
                item => item.id === productId
            );


        if (existingProduct) {

            existingProduct.quantity++;

        }

        else {

            cart.push({

                id: product.id,

                name: product.name,

                price: Number(product.price),

                image: product.image,

                quantity: 1

            });

        }


        // Save cart

        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );


        // Update cart number

        updateCartCount();


        alert(
            `${product.name} added to cart!`
        );

    }

    catch (error) {

        console.error(
            "Add to Cart Error:",
            error
        );


        alert(
            "Unable to add product to cart."
        );

    }

}

// ==========================================
// GLOBAL NAVBAR + USER LOGIN STATUS
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // CHECK LOGIN STATUS
    // ==========================================

    checkLoginStatus();


    // ==========================================
    // LOGOUT
    // ==========================================

    const logoutBtn =
        document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            logout
        );

    }


    // ==========================================
    // UPDATE CART COUNT
    // ==========================================

    updateCartCount();


    // ==========================================
    // MOBILE MENU
    // ==========================================

    const menuBtn =
        document.getElementById("menuBtn");

    const navLinks =
        document.querySelector(".nav-links");

    if (menuBtn && navLinks) {

        menuBtn.addEventListener(
            "click",
            function () {

                navLinks.classList.toggle(
                    "mobile-active"
                );

            }
        );

    }

});


// ==========================================
// CHECK LOGIN STATUS
// ==========================================

function checkLoginStatus() {

    const token =
        localStorage.getItem("token");

    const userData =
        localStorage.getItem("user");


    const loginBtn =
        document.getElementById("loginBtn");

    const userMenu =
        document.getElementById("userMenu");

    const userName =
        document.getElementById("userName");


    // ==========================================
    // USER LOGGED IN
    // ==========================================

    if (token && userData) {

        try {

            const user =
                JSON.parse(userData);


            // Hide Login

            if (loginBtn) {

                loginBtn.style.display =
                    "none";

            }


            // Show User Menu

            if (userMenu) {

                userMenu.style.display =
                    "flex";

            }


            // Show User Name

            if (
                userName &&
                user.name
            ) {

                userName.textContent =
                    user.name;

            }

        }

        catch (error) {

            console.error(
                "User data error:",
                error
            );

            localStorage.removeItem("user");
            localStorage.removeItem("token");

        }

    }


    // ==========================================
    // USER NOT LOGGED IN
    // ==========================================

    else {

        if (loginBtn) {

            loginBtn.style.display =
                "inline-block";

        }


        if (userMenu) {

            userMenu.style.display =
                "none";

        }

    }

}


// ==========================================
// LOGOUT
// ==========================================

function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");


    window.location.href =
        "/login.html";

}


// ==========================================
// UPDATE CART COUNT
// ==========================================

function updateCartCount() {

    const cartCount =
        document.getElementById(
            "cart-count"
        );


    // Cart count does not exist on this page

    if (!cartCount) {

        return;

    }


    let cart = [];

    try {

        cart =
            JSON.parse(
                localStorage.getItem("cart")
            ) || [];

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
            function (total, item) {

                return total +
                    Number(item.quantity || 0);

            },
            0
        );


    cartCount.textContent =
        totalQuantity;

}


// ==========================================
// HERO BANNER CAROUSEL (AUTO-SCROLLING & DYNAMIC DATA)
// ==========================================

let _heroSlideInterval = null;

function initHeroCarousel() {

    const carousel = document.getElementById("heroCarousel");
    if (!carousel) return;

    const track = document.getElementById("heroTrack");
    const slides = carousel.querySelectorAll(".hero-slide");
    const dots = carousel.querySelectorAll(".hero-dot");
    const prevBtn = document.getElementById("heroPrevBtn");
    const nextBtn = document.getElementById("heroNextBtn");
    const progressFill = document.getElementById("heroProgressFill");

    if (slides.length === 0) return;

    // Clear any prior interval
    if (_heroSlideInterval) {
        clearInterval(_heroSlideInterval);
        _heroSlideInterval = null;
    }

    let currentIndex = 0;
    const totalSlides = slides.length;
    const slideDuration = 4500; // 4.5 seconds per slide

    function resetProgressBar() {
        if (!progressFill) return;
        progressFill.style.transition = "none";
        progressFill.style.width = "0%";
        void progressFill.offsetWidth; // Trigger reflow
        progressFill.style.transition = `width ${slideDuration}ms linear`;
        progressFill.style.width = "100%";
    }

    function showSlide(index) {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;
        currentIndex = index;

        // Slide the track horizontally one by one
        if (track) {
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
        }

        slides.forEach((slide, i) => {
            if (i === currentIndex) {
                slide.classList.add("active");
            } else {
                slide.classList.remove("active");
            }
        });

        dots.forEach((dot, i) => {
            if (i === currentIndex) {
                dot.classList.add("active");
            } else {
                dot.classList.remove("active");
            }
        });

        resetProgressBar();
    }

    function nextSlide() {
        showSlide(currentIndex + 1);
    }

    function prevSlide() {
        showSlide(currentIndex - 1);
    }

    function startAutoScroll() {
        stopAutoScroll();
        resetProgressBar();
        _heroSlideInterval = setInterval(nextSlide, slideDuration);
    }

    function stopAutoScroll() {
        if (_heroSlideInterval) {
            clearInterval(_heroSlideInterval);
            _heroSlideInterval = null;
        }
        if (progressFill) {
            const currentComputedWidth = window.getComputedStyle(progressFill).width;
            progressFill.style.transition = "none";
            progressFill.style.width = currentComputedWidth;
        }
    }

    // Arrow navigation (clean clone to avoid duplicate listeners)
    if (nextBtn) {
        nextBtn.onclick = () => {
            nextSlide();
            startAutoScroll();
        };
    }

    if (prevBtn) {
        prevBtn.onclick = () => {
            prevSlide();
            startAutoScroll();
        };
    }

    // Dot navigation
    dots.forEach((dot) => {
        dot.onclick = () => {
            const idx = parseInt(dot.getAttribute("data-index"), 10);
            if (!isNaN(idx)) {
                showSlide(idx);
                startAutoScroll();
            }
        };
    });

    // Pause on hover, resume on mouse leave
    carousel.onmouseenter = stopAutoScroll;
    carousel.onmouseleave = startAutoScroll;

    // Touch swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.ontouchstart = (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoScroll();
    };

    carousel.ontouchend = (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (diff > 45) {
            nextSlide();
        } else if (diff < -45) {
            prevSlide();
        }
        startAutoScroll();
    };

    // Initial launch
    showSlide(0);
    startAutoScroll();

}

// ==========================================
// DYNAMIC BANNER LOADER & RENDERER
// ==========================================

function formatHeroTitle(title) {
    if (!title) return "DEFINE YOUR <span class=\"highlight-gold\">STYLE</span>";
    if (title.includes("<") && title.includes(">")) {
        return title; // already contains HTML tags
    }
    const words = title.trim().split(" ");
    if (words.length > 1) {
        const lastWord = words.pop();
        return `${words.join(" ")} <span class="highlight-gold">${lastWord}</span>`;
    }
    return title;
}

function renderHeroCarousel(banners, track, dotsNav) {
    track.innerHTML = banners.map((b, i) => `
        <div class="hero-slide ${i === 0 ? 'active' : ''}" style="background-image: linear-gradient(to right, rgba(20, 5, 6, 0.88) 0%, rgba(20, 5, 6, 0.65) 50%, rgba(20, 5, 6, 0.3) 100%), url('${b.image}');">
            <div class="hero-slide-content">
                ${b.badge ? `<span class="hero-slide-badge"><i class="fa-solid fa-crown"></i> ${b.badge}</span>` : ""}
                <h1 class="hero-slide-title">${formatHeroTitle(b.title)}</h1>
                ${b.subtitle ? `<p class="hero-slide-desc">${b.subtitle}</p>` : ""}
                <div class="hero-slide-actions">
                    <a href="${b.link || '/products.html'}" class="hero-btn-primary">
                        <i class="fa-solid fa-bag-shopping"></i> ${b.button_text || 'EXPLORE COLLECTION'}
                    </a>
                    ${b.secondary_link ? `
                        <a href="${b.secondary_link}" class="hero-btn-secondary">
                            ${b.secondary_button_text || 'VIEW MORE'} <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    ` : ""}
                </div>
            </div>
        </div>
    `).join("");

    if (dotsNav) {
        dotsNav.innerHTML = banners.map((_, i) => `
            <span class="hero-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>
        `).join("");
    }

    // Re-initialize carousel controller with new slides
    initHeroCarousel();
}

function renderSpecialOfferBanner(b) {
    const offerSection = document.getElementById("special-offer");
    if (!offerSection) return;

    if (b.image) {
        offerSection.style.backgroundImage = `linear-gradient(rgba(20, 5, 6, 0.88), rgba(20, 5, 6, 0.92)), url('${b.image}')`;
        offerSection.style.backgroundSize = "cover";
        offerSection.style.backgroundPosition = "center";
    }

    const pill = offerSection.querySelector(".offer-pill");
    if (pill && b.badge) {
        pill.innerHTML = `<i class="fa-solid fa-bolt"></i> ${b.badge}`;
    }

    const titleEl = offerSection.querySelector("h2");
    if (titleEl && b.title) {
        titleEl.innerHTML = formatHeroTitle(b.title);
    }

    const descEl = offerSection.querySelector("p");
    if (descEl && b.subtitle) {
        descEl.textContent = b.subtitle;
    }

    const ctaBtn = offerSection.querySelector(".offer-cta-btn");
    if (ctaBtn) {
        if (b.link) ctaBtn.href = b.link;
        if (b.button_text) {
            ctaBtn.innerHTML = `<i class="fa-solid fa-tag"></i> ${b.button_text}`;
        }
    }
}

async function loadHomepageBanners() {
    const carousel = document.getElementById("heroCarousel");
    const track = document.getElementById("heroTrack");
    const dotsNav = document.getElementById("heroDotsNav");

    if (!carousel || !track) return;

    try {
        const res = await fetch("/api/banners");
        const data = await res.json();

        if (data.success && Array.isArray(data.banners) && data.banners.length > 0) {
            // 1. Hero Banners
            const heroBanners = data.banners.filter(b => b.position === "hero");
            if (heroBanners.length > 0) {
                renderHeroCarousel(heroBanners, track, dotsNav);
            }

            // 2. Promotional Banners
            const promoBanners = data.banners.filter(b => b.position === "promo");
            if (promoBanners.length > 0) {
                renderSpecialOfferBanner(promoBanners[0]);
            }
        }
    } catch (err) {
        console.warn("Could not load dynamic banners, keeping default slides:", err);
    }
}


// ==========================================
// SIZE & FIT GUIDE (TABS & CALCULATOR)
// ==========================================

function initSizeGuide() {

    const sizeTabs = document.querySelectorAll(".size-tab");
    if (!sizeTabs || sizeTabs.length === 0) return;

    sizeTabs.forEach(tabBtn => {
        tabBtn.addEventListener("click", () => {
            const targetTab = tabBtn.getAttribute("data-tab");
            if (!targetTab) return;

            // Activate tab button
            sizeTabs.forEach(btn => btn.classList.remove("active"));
            tabBtn.classList.add("active");

            // Show corresponding size table panel
            const panels = document.querySelectorAll(".size-panel");
            panels.forEach(panel => panel.classList.remove("active"));

            const targetPanel = document.getElementById(`panel-${targetTab}`);
            if (targetPanel) {
                targetPanel.classList.add("active");
            }
        });
    });

    // Real-time calculation on input change
    const chestInput = document.getElementById("chestInput");
    const fitPref = document.getElementById("fitPreference");

    if (chestInput) {
        chestInput.addEventListener("input", calculateRecommendedSize);
    }
    if (fitPref) {
        fitPref.addEventListener("change", calculateRecommendedSize);
    }

}

function calculateRecommendedSize() {

    const chestEl = document.getElementById("chestInput");
    const fitEl = document.getElementById("fitPreference");
    const resultEl = document.getElementById("fitResultDisplay");

    if (!chestEl || !resultEl) return;

    const chestInches = parseFloat(chestEl.value);
    const fit = fitEl ? fitEl.value : "regular";

    if (isNaN(chestInches) || chestInches < 28 || chestInches > 60) {
        resultEl.innerHTML = `
            <i class="fa-solid fa-triangle-exclamation" style="color: #c53030;"></i>
            <span>Please enter a valid chest measurement between 28" and 60".</span>
        `;
        return;
    }

    let baseSize = "M";
    let sizeName = "Medium";
    let fitAdvice = "Balanced tailored fit with room to move.";

    if (chestInches < 35) {
        baseSize = fit === "relaxed" ? "S" : "XS";
        sizeName = baseSize === "XS" ? "Extra Small" : "Small";
        fitAdvice = fit === "slim" ? "Streamlined, body-hugging contour." : "Tailored silhouette.";
    } else if (chestInches >= 35 && chestInches <= 37.5) {
        baseSize = fit === "relaxed" ? "M" : (fit === "slim" ? "XS" : "S");
        sizeName = baseSize === "S" ? "Small" : (baseSize === "M" ? "Medium" : "Extra Small");
        fitAdvice = fit === "relaxed" ? "Relaxed modern silhouette with extra chest ease." : "Standard clean look.";
    } else if (chestInches > 37.5 && chestInches <= 40.5) {
        baseSize = fit === "relaxed" ? "L" : (fit === "slim" ? "S" : "M");
        sizeName = baseSize === "M" ? "Medium" : (baseSize === "L" ? "Large" : "Small");
        fitAdvice = fit === "slim" ? "Form-fitting athletic contour." : "Versatile classic fit.";
    } else if (chestInches > 40.5 && chestInches <= 43.5) {
        baseSize = fit === "relaxed" ? "XL" : (fit === "slim" ? "M" : "L");
        sizeName = baseSize === "L" ? "Large" : (baseSize === "XL" ? "Extra Large" : "Medium");
        fitAdvice = fit === "relaxed" ? "Drapey street style with relaxed shoulders." : "Crisp comfortable fit.";
    } else if (chestInches > 43.5 && chestInches <= 46.5) {
        baseSize = fit === "relaxed" ? "XXL" : (fit === "slim" ? "L" : "XL");
        sizeName = baseSize === "XL" ? "Extra Large" : (baseSize === "XXL" ? "Double XL" : "Large");
        fitAdvice = "Spacious chest ease with comfortable drape.";
    } else {
        baseSize = fit === "slim" ? "XL" : "XXL";
        sizeName = baseSize === "XXL" ? "Double XL (2XL)" : "Extra Large (XL)";
        fitAdvice = "Generous premium drape for effortless all-day comfort.";
    }

    const fitLabel = fit === "slim" ? "Slim Fit" : (fit === "relaxed" ? "Relaxed Fit" : "Regular Fit");

    resultEl.innerHTML = `
        <i class="fa-solid fa-circle-check" style="color: #C5A059; font-size: 22px;"></i>
        <div>
            <div>Your Recommended Size: <strong style="color: #832729; font-size: 16px;">${baseSize} (${sizeName} — ${fitLabel})</strong></div>
            <small style="color: #666; font-size: 12px; display: block; margin-top: 2px;">${fitAdvice}</small>
        </div>
    `;

}

// Make globally accessible for inline onclick
window.calculateRecommendedSize = calculateRecommendedSize;


// ==========================================
// START
// ==========================================

getProducts();

updateCartCount();

checkLoginStatus();

// Initialize Hero Carousel, Dynamic Banners, and Size Guide
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        initHeroCarousel();
        loadHomepageBanners();
        initSizeGuide();
    });
} else {
    initHeroCarousel();
    loadHomepageBanners();
    initSizeGuide();
}