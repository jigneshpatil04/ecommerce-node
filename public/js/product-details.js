// ==========================================
// PRODUCT DETAILS + CART + WISHLIST
// + REVIEWS + RATINGS JAVASCRIPT
// ==========================================

console.log("Product Details JS Loaded");


// ==========================================
// GET PRODUCT ID FROM URL
// ==========================================

var urlParams = new URLSearchParams(
    window.location.search
);

var productId = urlParams.get("id");

console.log("Product ID:", productId);


// ==========================================
// GLOBAL VARIABLES
// ==========================================

let quantity = 1;
let currentProduct = null;
let selectedRating = 0;
let selectedProductSize = null;
let selectedProductColor = null;
let selectedProductColorImage = null;


// ==========================================
// GET USER ID
// ==========================================

function getUserId() {

    let userId = localStorage.getItem("userId");

    if (userId) {

        return Number(userId);

    }


    const user = localStorage.getItem("user");

    if (user) {

        try {

            const userData = JSON.parse(user);

            return Number(
                userData.id ||
                userData.user_id
            );

        } catch (error) {
        console.warn("Error loading product from API:", error);
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 80px 20px; font-family: sans-serif;">
                    <h2 style="font-size: 26px; color: #111; margin-bottom: 12px;">Product Not Found</h2>
                    <p style="color: #666; font-size: 15px; margin-bottom: 24px;">The requested product is not available or has been removed.</p>
                    <a href="products.html" style="display: inline-block; padding: 12px 28px; background: #b12704; color: #fff; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 14px;">Browse All Products</a>
                </div>
            `;
        }
    }
}


// ==========================================
// DISPLAY PRODUCT
// ==========================================


// ==========================================
// DYNAMIC SQUARE MAGNIFIER LENS ZOOM
// (Square magnifier loupe focused on cursor, e.g. chest, neck, waist)
// ==========================================

function initializeProductImageZoom() {
    const containers = document.querySelectorAll(".product-detail-image, .product-image-section");
    if (!containers || containers.length === 0) return;

    containers.forEach(function (container) {
        const img = container.querySelector("#productImage") || container.querySelector("img");
        if (!img) return;

        // Reset main image transform
        img.style.transform = "none";
        img.style.transformOrigin = "center center";

        // Create or get square zoom lens element
        let lens = container.querySelector(".product-zoom-lens");
        if (!lens) {
            lens = document.createElement("div");
            lens.className = "product-zoom-lens";
            container.appendChild(lens);
        }

        container.style.position = "relative";
        container.style.overflow = "hidden";
        container.style.cursor = "default";

        const LENS_SIZE = 220; // 220px square lens
        const ZOOM_FACTOR = 2.8; // 2.8x magnification for crystal clarity

        lens.style.width = LENS_SIZE + "px";
        lens.style.height = LENS_SIZE + "px";

        // Offscreen canvas for fast sampling of garment vs white/transparent backdrop
        let canvas = null;
        let ctx = null;

        function setupImageSampling() {
            try {
                if (!img.complete || img.naturalWidth === 0) return;
                canvas = document.createElement("canvas");
                const w = Math.min(img.naturalWidth || 400, 400);
                const h = Math.min(img.naturalHeight || 520, 520);
                canvas.width = w;
                canvas.height = h;
                ctx = canvas.getContext("2d", { willReadFrequently: true });
                ctx.drawImage(img, 0, 0, w, h);
            } catch (e) {
                canvas = null;
                ctx = null;
            }
        }

        function updateLensImage() {
            const currentSrc = img.currentSrc || img.src;
            if (currentSrc) {
                lens.style.backgroundImage = 'url("' + currentSrc + '")';
                setupImageSampling();
            }
        }

        updateLensImage();

        /**
         * Detects if cursor is positioned specifically over the model's body/garment
         * (excludes empty margins, white backgrounds, and area above the collar/head)
         */
        function isOverBody(mouseX, mouseY, rect) {
            if (!rect || rect.width <= 0 || rect.height <= 0) return false;
            const normX = mouseX / rect.width;
            const normY = mouseY / rect.height;

            // 1. Exclude head/hair/face (top ~22%) and extreme bottom/margins (> 94%)
            if (normY < 0.20 || normY > 0.94) return false;

            // 2. Exclude left and right empty side margins
            if (normX < 0.16 || normX > 0.84) return false;

            // 3. Sample pixel opacity and color to strictly avoid zooming empty backdrop
            if (ctx && canvas && canvas.width > 0 && canvas.height > 0) {
                try {
                    const cx = Math.max(0, Math.min(canvas.width - 1, Math.floor(normX * canvas.width)));
                    const cy = Math.max(0, Math.min(canvas.height - 1, Math.floor(normY * canvas.height)));
                    const p = ctx.getImageData(cx, cy, 1, 1).data;
                    const alpha = p[3];
                    const r = p[0], g = p[1], b = p[2];

                    // Transparent background pixel
                    if (alpha < 35) return false;

                    // Pure white / off-white backdrop pixel
                    if (r > 247 && g > 247 && b > 247) return false;
                } catch (err) {
                    // Fall back to geometric body bounding zone
                }
            }

            return true;
        }

        let isHovered = false;
        let rafId = null;
        let lastEvent = null;

        function renderLens() {
            if (!isHovered || !lastEvent) return;

            const rect = container.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) return;

            // Cursor coordinates relative to image container
            const mouseX = Math.max(0, Math.min(rect.width, lastEvent.clientX - rect.left));
            const mouseY = Math.max(0, Math.min(rect.height, lastEvent.clientY - rect.top));

            // Only zoom when cursor is on the body
            if (!isOverBody(mouseX, mouseY, rect)) {
                lens.classList.remove("active");
                container.classList.remove("is-body-hovered");
                container.style.cursor = "default";
                return;
            }

            lens.classList.add("active");
            container.classList.add("is-body-hovered");
            container.style.cursor = "crosshair";

            // Constrain square lens position so it stays completely inside the photo card
            const lensX = Math.max(0, Math.min(rect.width - LENS_SIZE, mouseX - LENS_SIZE / 2));
            const lensY = Math.max(0, Math.min(rect.height - LENS_SIZE, mouseY - LENS_SIZE / 2));

            // Background sizing and alignment to center the exact hovered spot (e.g. chest/fabric) inside the square
            const bgWidth = rect.width * ZOOM_FACTOR;
            const bgHeight = rect.height * ZOOM_FACTOR;
            const bgPosX = -(mouseX * (ZOOM_FACTOR - 1) + lensX);
            const bgPosY = -(mouseY * (ZOOM_FACTOR - 1) + lensY);

            lens.style.left = lensX + "px";
            lens.style.top = lensY + "px";
            lens.style.backgroundSize = bgWidth + "px " + bgHeight + "px";
            lens.style.backgroundPosition = bgPosX + "px " + bgPosY + "px";
        }

        function onMouseMove(e) {
            lastEvent = e;
            isHovered = true;
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(renderLens);
        }

        function onMouseEnter(e) {
            isHovered = true;
            updateLensImage();
            onMouseMove(e);
        }

        function onMouseLeave() {
            isHovered = false;
            lastEvent = null;
            if (rafId) cancelAnimationFrame(rafId);
            lens.classList.remove("active");
            container.classList.remove("is-body-hovered");
            container.style.cursor = "default";
        }

        container.onmouseenter = onMouseEnter;
        container.onmousemove = onMouseMove;
        container.onmouseleave = onMouseLeave;

        img.addEventListener("load", function () {
            updateLensImage();
            setupImageSampling();
        });
        if (img.complete) {
            setupImageSampling();
        }
    });
}

window.initializeProductImageZoom = initializeProductImageZoom;


// ==========================================
// LOAD RELATED PRODUCTS (BY CATEGORY)
// ==========================================
// LOAD RELATED PRODUCTS (BY CATEGORY - INSTANT RENDER)
// ==========================================

let _relatedProductsCache = null;

async function loadRelatedProducts(currentProduct) {
    const grid = document.getElementById("relatedProductsGrid");
    if (!grid) return;

    if (!currentProduct) return;
    const currentId = Number(currentProduct.id);
    const currentCategory = String(currentProduct.category || "").toLowerCase().trim();

    function renderList(list) {
        if (!grid) return;
        if (!list || list.length === 0) {
            grid.innerHTML = '<p style="color:#64748b; font-size:14px; grid-column:1/-1; text-align:center; padding: 24px 0;">No related products found.</p>';
            return;
        }

        grid.innerHTML = list.map(function (p) {
            const pId = Number(p.id);
            const pName = p.name || "Product";
            const pCat = p.category || "General";
            const pPrice = Number(p.display_price ?? p.price ?? 0);
            const pImg = getProductImage(p);

            return `
                <div class="related-product-card" onclick="window.location.href = "./product-details.html?id=${pId}'">
                    <div class="related-card-image-wrap">
                        <img
                            src="${escapeHTML(pImg)}"
                            alt="${escapeHTML(pName)}"
                            onerror="this.onerror=null; this.src='/images/jacket2.jpg';"
                        >
                        <button
                            type="button"
                            class="related-card-wishlist-btn"
                            onclick="event.stopPropagation(); toggleDetailWishlist(${pId}, event);"
                            title="Add to Wishlist"
                            aria-label="Add ${escapeHTML(pName)} to wishlist"
                        >
                            <i class="fa-regular fa-heart"></i>
                        </button>
                    </div>
                    <div class="related-card-body">
                        <span class="related-card-category">${escapeHTML(pCat)}</span>
                        <h4 class="related-card-title" title="${escapeHTML(pName)}">${escapeHTML(pName)}</h4>
                        <div class="related-card-price-row">
                            <span class="related-card-price">₹${pPrice.toFixed(2)}</span>
                            <a
                                href="/product-details.html?id=${pId}"
                                class="related-card-view-btn"
                                onclick="event.stopPropagation();"
                            >
                                View <i class="fa-solid fa-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    }

    // Category matching helper
    function isCategoryMatch(cat1, cat2) {
        const c1 = String(cat1 || "").toLowerCase().trim();
        const c2 = String(cat2 || "").toLowerCase().trim();
        if (c1 === c2) return true;
        if ((c1.includes("t-shirt") || c1.includes("tshirt") || c1.includes("tee")) &&
            (c2.includes("t-shirt") || c2.includes("tshirt") || c2.includes("tee"))) return true;
        if (c1.includes("shirt") && c2.includes("shirt") && !c1.includes("t-shirt") && !c2.includes("t-shirt")) return true;
        if (c1.includes("jean") && c2.includes("jean")) return true;
        if (c1.includes("pant") && c2.includes("pant")) return true;
        if (c1.includes("jacket") && c2.includes("jacket")) return true;
        if (c1.includes("hoodie") && c2.includes("hoodie")) return true;
        if (c1.includes("shoe") && c2.includes("shoe")) return true;
        if (c1.includes("access") && c2.includes("access")) return true;
        return false;
    }

    function pickRelated(allProds) {
        const other = allProds.filter(p => Number(p.id) !== currentId);
        let rel = other.filter(p => isCategoryMatch(p.category, currentCategory));
        if (rel.length < 4) {
            const extra = other.filter(p => !rel.some(r => Number(r.id) === Number(p.id)));
            rel = rel.concat(extra);
        }
        return rel.slice(0, 4);
    }

    // 1. INSTANT RENDER (0ms latency, eliminates loading delay completely)
    if (_relatedProductsCache && _relatedProductsCache.length > 0) {
        renderList(pickRelated(_relatedProductsCache));
    } else if (Array.isArray(DEFAULT_FALLBACK_PRODUCTS) && DEFAULT_FALLBACK_PRODUCTS.length > 0) {
        renderList(pickRelated(DEFAULT_FALLBACK_PRODUCTS));
    }

    // 2. Fetch fresh products from API and update seamlessly
    try {
        const res = await fetch("/api/products");
        if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.products) && data.products.length > 0) {
                _relatedProductsCache = data.products;
                renderList(pickRelated(data.products));
            }
        }
    } catch (err) {
        console.warn("Could not fetch fresh related products, keeping cached render:", err.message);
    }
}

window.loadRelatedProducts = loadRelatedProducts;


// ==========================================
// TRUST BADGE DETAILS (AMAZON STYLE POPOVER)
// ==========================================

const TRUST_BADGE_DETAILS = {
    return: {
        title: "10 days Return & Exchange",
        table: {
            headers: ["Return Reason", "Return Period", "Return Policy"],
            rows: [
                ["Size too small, Size too large", "10 days from delivery", "Exchange with a different size or colour"],
                ["Any other reason", "10 days from delivery", "Full refund"]
            ]
        },
        instructionsHeading: "Return Instructions",
        instructionsIcon: `
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                <rect x="8" y="11" width="8" height="6" rx="1" stroke="#d97706" fill="#fef3c7"></rect>
            </svg>`,
        instructionsText: "Keep the item in its original condition and packaging along with MRP tag and accessories for a successful pick-up."
    },
    pod: {
        title: "Pay on Delivery",
        table: {
            headers: ["Payment Mode", "At Doorstep", "Safety Assurance"],
            rows: [
                ["Cash on Delivery", "Supported across all pin codes", "Exact cash or change accepted"],
                ["UPI / Cards", "GPay, PhonePe, Cards, Net Banking", "Scan QR code on delivery with zero fees"]
            ]
        },
        instructionsHeading: "Payment Guidelines",
        instructionsIcon: `
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="6" width="13" height="9" rx="1.5" stroke="#059669" fill="#ecfdf5"></rect>
                <text x="6" y="13" font-size="7.5" font-weight="900" fill="#059669" stroke="none">₹</text>
                <path d="M12 11h3a2 2 0 0 1 2 2v1l3 2-1 2-4-2h-3"></path>
            </svg>`,
        instructionsText: "Inspect parcel seal upon delivery. Pay after the delivery partner confirms order details. No advance payment required."
    },
    delivery: {
        title: "Free Delivery",
        table: {
            headers: ["Shipping Type", "Dispatch Speed", "Delivery Timeline"],
            rows: [
                ["Standard Delivery", "Dispatched in 24 hours", "2 - 4 business days"],
                ["Shipping Fee", "₹0 (Free for this item)", "No minimum cart amount required"]
            ]
        },
        instructionsHeading: "Delivery Information",
        instructionsIcon: `
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="5" width="13" height="10" rx="1.5"></rect>
                <path d="M14 8h4l3 3v4h-7V8z"></path>
                <circle cx="5.5" cy="17.5" r="2.2" fill="#e2e8f0"></circle>
                <circle cx="17.5" cy="17.5" r="2.2" fill="#e2e8f0"></circle>
                <text x="3" y="11.5" font-size="5" font-weight="900" fill="#d97706" stroke="none">FREE</text>
            </svg>`,
        instructionsText: "Priority air dispatch with live SMS and WhatsApp tracking link sent immediately upon order handover."
    },
    brand: {
        title: "Top Brand Assurance",
        table: {
            headers: ["Verification", "Quality Standard", "Manufacturer Warranty"],
            rows: [
                ["100% Genuine", "Direct from certified brand factories", "Official brand tag & barcode verified"],
                ["Fabric Standard", "High-GSM combed cotton & durable dyes", "Tested for zero color fading & shrinkage"]
            ]
        },
        instructionsHeading: "Quality Guarantee",
        instructionsIcon: `
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 4h12v4a6 6 0 0 1-12 0V4z"></path>
                <path d="M6 6H3a2 2 0 0 0-2 2v1a4 4 0 0 0 4 4h1"></path>
                <path d="M18 6h3a2 2 0 0 1 2 2v1a4 4 0 0 1-4 4h-1"></path>
                <path d="M10 14v4h4v-4"></path>
                <path d="M8 21h8"></path>
                <polygon points="12 6.5 13 8.5 15.2 8.8 13.6 10.3 14 12.5 12 11.4 10 12.5 10.4 10.3 8.8 8.8 11 8.5" fill="#f59e0b" stroke="#f59e0b" stroke-width="0.5"></polygon>
            </svg>`,
        instructionsText: "Top-rated brand seller with over 98% customer satisfaction. Verified authentic apparel."
    },
    amazon: {
        title: "Amazon Delivered",
        table: {
            headers: ["Service Type", "Fulfillment Care", "Courier Security"],
            rows: [
                ["Express Fulfillment", "Packed in tamper-proof seal packaging", "Special handling for garment safety"],
                ["Doorstep Delivery", "Verified courier delivery partner", "OTP confirmation on delivery handover"]
            ]
        },
        instructionsHeading: "Handover Instructions",
        instructionsIcon: `
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="5" width="13" height="10" rx="1.5"></rect>
                <path d="M14 8h4l3 3v4h-7V8z"></path>
                <circle cx="5.5" cy="17.5" r="2.2" fill="#e2e8f0"></circle>
                <circle cx="17.5" cy="17.5" r="2.2" fill="#e2e8f0"></circle>
                <path d="M4 11c2 1.5 5 1.5 7 0" stroke="#f59e0b" stroke-width="1.8" stroke-linecap="round"></path>
            </svg>`,
        instructionsText: "Shipped through dedicated priority logistics network with automated delivery updates and contactless handover option."
    }
};

function openTrustBadgeDetails(type, event) {
    if (event) event.stopPropagation();

    const data = TRUST_BADGE_DETAILS[type];
    if (!data) return;

    const wrapper = document.querySelector(".trust-badges-wrapper");
    if (!wrapper) return;

    let popover = document.getElementById("trustBadgePopover");
    if (!popover) {
        popover = document.createElement("div");
        popover.id = "trustBadgePopover";
        popover.className = "trust-badge-popover";
        wrapper.appendChild(popover);
    }

    const clickedItem = event ? event.currentTarget : null;
    document.querySelectorAll(".trust-badge-item").forEach(function (item) {
        item.classList.toggle("active", item === clickedItem);
    });

    let caretLeft = 45;
    if (clickedItem && wrapper) {
        const itemRect = clickedItem.getBoundingClientRect();
        const wrapRect = wrapper.getBoundingClientRect();
        caretLeft = Math.max(18, Math.min(wrapRect.width - 24, (itemRect.left - wrapRect.left) + (itemRect.width / 2) - 7));
    }

    popover.innerHTML = `
        <div class="trust-popover-caret" style="left: ${caretLeft.toFixed(1)}px;"></div>
        <div class="trust-popover-header">
            <h4 class="trust-popover-title">${escapeHTML(data.title)}</h4>
            <button type="button" class="trust-popover-close" onclick="closeTrustBadgeDetails(event)" aria-label="Close details">✕</button>
        </div>
        <table class="trust-popover-table">
            <thead>
                <tr>
                    ${data.table.headers.map(h => `<th>${escapeHTML(h)}</th>`).join("")}
                </tr>
            </thead>
            <tbody>
                ${data.table.rows.map(row => `
                    <tr>
                        ${row.map(cell => `<td>${escapeHTML(cell)}</td>`).join("")}
                    </tr>
                `).join("")}
            </tbody>
        </table>
        <div class="trust-popover-instructions">
            <div class="trust-instructions-heading">${escapeHTML(data.instructionsHeading)}</div>
            <div class="trust-instructions-row">
                <div class="trust-instructions-icon">
                    ${data.instructionsIcon}
                </div>
                <p class="trust-instructions-text">${escapeHTML(data.instructionsText)}</p>
            </div>
        </div>
    `;

    popover.classList.add("show");
}

function closeTrustBadgeDetails(event) {
    if (event) event.stopPropagation();
    const popover = document.getElementById("trustBadgePopover");
    if (popover) popover.classList.remove("show");
    document.querySelectorAll(".trust-badge-item").forEach(function (item) {
        item.classList.remove("active");
    });
}

window.openTrustBadgeDetails = openTrustBadgeDetails;
window.closeTrustBadgeDetails = closeTrustBadgeDetails;

// Click outside or press Escape to close popover
document.addEventListener("click", function (e) {
    const popover = document.getElementById("trustBadgePopover");
    if (popover && popover.classList.contains("show")) {
        if (!popover.contains(e.target) && !e.target.closest(".trust-badge-item")) {
            closeTrustBadgeDetails();
        }
    }
});

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        closeTrustBadgeDetails();
    }
});

function displayProduct(product) {
    if (!product) return;

    currentProduct = product;
    window.currentProduct = product;

    // ======================================
    // NEW PRODUCT DETAILS CONTAINER
    // ======================================

    const container =
        document.getElementById(
            "product-details"
        );


    // ======================================
    // OLD / STATIC PRODUCT ELEMENTS
    // ======================================

    const hasStaticElements =
        productName &&
        productPrice &&
        productDescription;


    // ======================================
    // PRODUCT IMAGE
    // ======================================

    // Prioritize auto-matched variant images from admin side
    let galleryImages = [];
    if (Array.isArray(product.variants) && product.variants.length > 0) {
        const seenVImg = new Set();
        product.variants.forEach(function (v) {
            if (v && v.image && v.image !== "null" && String(v.image).trim() !== "") {
                const norm = normalizeProductImagePath(v.image);
                if (norm && !seenVImg.has(norm)) {
                    seenVImg.add(norm);
                    galleryImages.push(norm);
                }
            }
        });
    }

    if (galleryImages.length === 0) {
        galleryImages = getProductImages(product);
    }

    // Comprehensive multi-angle model views (matching screenshot media_1791789336881.png)
    const basePoseThumbs = [
        "/images/gallery-thumb-1.png",
        "/images/gallery-thumb-2.png",
        "/images/gallery-thumb-3.png",
        "/images/gallery-thumb-4.png",
        "/images/gallery-thumb-5.png",
        "/images/gallery-thumb-6.png",
        "/images/gallery-thumb-7.png" // Video thumbnail with play icon
    ];

    let fullGalleryList = [];
    // Primary product image is first thumbnail
    const primaryImg = galleryImages.length > 0 ? galleryImages[0] : (product.image || "/images/gallery-thumb-1.png");
    fullGalleryList.push({ image: normalizeProductImagePath(primaryImg), isVideo: false });

    // Add remaining product images if any
    for (let i = 1; i < galleryImages.length; i++) {
        const norm = normalizeProductImagePath(galleryImages[i]);
        if (!fullGalleryList.some(function (g) { return g.image === norm; })) {
            fullGalleryList.push({ image: norm, isVideo: false });
        }
    }

    // Fill up to 7 items using model pose angles + video thumbnail
    for (let i = 0; i < basePoseThumbs.length && fullGalleryList.length < 7; i++) {
        const poseImg = basePoseThumbs[i];
        const isVid = (i === 6) || (fullGalleryList.length === 6);
        fullGalleryList.push({ image: poseImg, isVideo: isVid });
    }
    // Ensure 7th item is marked as video thumb
    if (fullGalleryList.length >= 7) {
        fullGalleryList[6].isVideo = true;
    }

    const imagePath = galleryImages.length > 0 ? galleryImages[0] : getProductImage(product);

    console.log(
        "Product image:",
        imagePath
    );


    // ======================================
    // PRODUCT DATA
    // ======================================

    const name =
        product.name ||
        "Product";


    const category =
        product.category ||
        "General";

    const catLower = String(category || "").toLowerCase();
    const nameLower = String(name || "").toLowerCase();
    const isTShirt = catLower.includes("t-shirt") || catLower.includes("tshirt") || catLower.includes("tee") || nameLower.includes("t-shirt") || nameLower.includes("tshirt") || nameLower.includes("tee");
    const fallbackDefaultImg = isTShirt ? "/images/tshirt4.jpg" : "/images/jacket2.jpg";

    // --------------------------------------
    // CATEGORY FORMATTING & BREADCRUMB
    // --------------------------------------
    let displayCategory = category || "Products";
    let categoryParam = catLower;

    if (catLower.includes("t-shirt") || catLower.includes("tshirt") || catLower.includes("tee")) {
        displayCategory = "T-Shirts";
        categoryParam = "t-shirts";
    } else if (catLower.includes("shirt")) {
        displayCategory = "Shirts";
        categoryParam = "shirts";
    } else if (catLower.includes("jean")) {
        displayCategory = "Jeans";
        categoryParam = "jeans";
    } else if (catLower.includes("pant")) {
        displayCategory = "Pants";
        categoryParam = "pants";
    } else if (catLower.includes("jacket")) {
        displayCategory = "Jackets";
        categoryParam = "jackets";
    } else if (catLower.includes("hoodie")) {
        displayCategory = "Hoodies";
        categoryParam = "hoodies";
    } else if (catLower.includes("short")) {
        displayCategory = "Shorts";
        categoryParam = "shorts";
    } else if (catLower.includes("shoe")) {
        displayCategory = "Shoes";
        categoryParam = "shoes";
    } else if (catLower.includes("access")) {
        displayCategory = "Accessories";
        categoryParam = "accessories";
    } else if (category && category !== "General") {
        displayCategory = category.charAt(0).toUpperCase() + category.slice(1);
        categoryParam = category.toLowerCase().replace(/\s+/g, "-");
    }

    const categoryUrl = categoryParam && categoryParam !== "general"
        ? `/products.html?category=${encodeURIComponent(categoryParam)}`
        : "/products.html";

    // Update breadcrumb navigation elements
    const breadcrumbCategoryLink = document.getElementById("breadcrumbCategoryLink");
    const breadcrumbCategory = document.getElementById("breadcrumbCategory");
    const breadcrumbProduct = document.getElementById("breadcrumbProduct");

    if (breadcrumbCategory) {
        breadcrumbCategory.textContent = displayCategory;
    }
    if (breadcrumbCategoryLink) {
        breadcrumbCategoryLink.href = categoryUrl;
        breadcrumbCategoryLink.title = `View all ${displayCategory}`;
    }
    if (breadcrumbProduct && name) {
        breadcrumbProduct.textContent = name;
        breadcrumbProduct.title = name;
    }

    const description =
        product.description ||
        "No description available.";


    const price =
        getSelectedSizePrice(
            product,
            selectedProductSize
        );


    const availableSizes =
        getAvailableSizes(product);

    const availableColors =
        getAvailableColors(product);

    // Product Details Specifications (Amazon Style)
    let specsData = null;
    if (window.ProductSpecsHelper && typeof window.ProductSpecsHelper.analyzeProductDetails === "function") {
        specsData = window.ProductSpecsHelper.analyzeProductDetails(product);
    } else {
        specsData = {
            highlights: {
                "Material composition": "100% Cotton",
                "Fit type": "Slim Fit",
                "Sleeve type": "Half Sleeve",
                "Collar style": "Polo Collar",
                "Length": "Standard Length",
                "Neck style": "Round Neck",
                "Country of Origin": "India"
            },
            about: [
                "Hemline: Side slit for added comfort and ease of movement",
                "Cuff & Collar Type: Contrast rib and solid rib collar for a stylish finish",
                "Placket Type: 3-button placket for a classic polo look",
                "Premium Fabric: Crafted from high-end pique in DCH cotton for superior softness and durability",
                "Design: Cut & sew construction with color-blocked shoulder for a modern, sporty appeal"
            ],
            additional: {
                "Manufacturer": "ABFRL, Aditya Birla Fashion & Retail Ltd, 7th Flr, Skyline Ikon Business Park, AK Road, Andheri East, Mumbai-400059",
                "Packer": "Aditya Birla Fashion & Retail Ltd, 7th Flr, Skyline Ikon Business Park, AK Road, Andheri East, Mumbai-400059",
                "Item Weight": "300 g",
                "Item Dimensions LxWxH": "27.5 x 22.5 x 3 Centimeters",
                "Net Quantity": "1 Count",
                "Generic Name": "T-Shirt"
            },
            style: {
                "Colour": "White",
                "Fitting type": "Slim Fit",
                "Style Name": "Modern",
                "Neck Style": "Round Neck",
                "Sleeve Type": "Half Sleeve",
                "Shirt Form Type": "T-Shirt",
                "Collar Style": "Polo Collar",
                "Pattern": "Solid",
                "top-style": "Polo",
                "Season": "Spring",
                "Apparel Closure Type": "Pull On",
                "Cuff Style": "Ribbed Cuff",
                "Apparel Occasion and Lifestyle": "Casual",
                "Back Style": "T Back"
            },
            itemDetails: {
                "Brand Name": "Louis Philippe",
                "Model Name": "LR Tshirt- 22_Best seller repeat: Shoulder colour block",
                "Style Number": "LRKPNSLBZ25183",
                "Unit Count": "1 Count",
                "Country Of Origin": "India",
                "Global Trade Identification Number": "08909158788810",
                "number-of-items": "1",
                "Age Range Description": "Adult",
                "Item Type Name": "T-Shirt",
                "Item Weight": "300 Grams",
                "Manufacturer Contact Information": "Aditya Birla Fashion & Retail Ltd, 7th Flr, Skyline Ikon Business Park, AK Road, Andheri East, Mumbai-400059",
                "Manufacturer": "ABFRL, Aditya Birla Fashion & Retail Ltd, 7th Flr, Skyline Ikon Business Park, AK Road, Andheri East, Mumbai-400059",
                "Packer Contact Information": "Aditya Birla Fashion & Retail Ltd, 7th Flr, Skyline Ikon Business Park, AK Road, Andheri East, Mumbai-400059",
                "Manufacturer Part Number": "LRKPNSLF475219_L",
                "Best Sellers Rank": "#73 in Clothing & Accessories (See Top 100 in Clothing & Accessories) | #10 in Men's Polos",
                "ASIN": "B0D4VPH1YB"
            }
        };
    }

    const stock =
        Number(
            product.stock
        ) || 0;

    if (
        availableSizes.length > 0 &&
        (
            !selectedProductSize ||
            !availableSizes.includes(selectedProductSize)
        )
    ) {

        selectedProductSize =
            availableSizes[0];

    }

    const urlColorParam = urlParams.get("color");

    if (urlColorParam) {
        const match = availableColors.find(function (c) {
            return c.name.toLowerCase() === urlColorParam.toLowerCase();
        });
        if (match) {
            selectedProductColor = match.name;
        } else {
            selectedProductColor = urlColorParam;
        }
    } else if (
        availableColors.length > 0 &&
        (
            !selectedProductColor ||
            !availableColors.some(function (c) { return c.name === selectedProductColor; })
        )
    ) {

        selectedProductColor =
            availableColors[0].name;

    }

    if (selectedProductColor && specsData && specsData.style) {
        specsData.style["Colour"] = selectedProductColor;
    }

    let displayImagePath = imagePath;
    if (selectedProductColor) {
        const colorImg = resolveColorImage(selectedProductColor, product);
        if (colorImg) {
            displayImagePath = colorImg;
            selectedProductColorImage = colorImg;
        }
    }

    const activeColorStock = getVariantStockForSelection(
        product,
        selectedProductColor,
        selectedProductSize
    );
    const isOutOfStock = activeColorStock <= 0;

    // Two photo cards for downside of 10 days return (matching user upload media_1791795330205.png)
    let downsidePhotoCards = [];
    if (Array.isArray(availableColors) && availableColors.length >= 2) {
        downsidePhotoCards = availableColors.slice(0, 4).map(function(c, i) {
            const cImg = c.image || resolveColorImage(c.name, product) || (i === 0 ? "/images/model-variant-1-hd.png" : "/images/model-variant-2-hd.png");
            return {
                name: c.name,
                image: normalizeProductImagePath(cImg),
                thumb: normalizeProductImagePath(cImg)
            };
        });
    }
    if (downsidePhotoCards.length < 2) {
        downsidePhotoCards = [
            { name: "Olive Pattern", image: "/images/model-variant-1-hd.png", thumb: "/images/model-variant-1.png" },
            { name: "Beige Sand", image: "/images/model-variant-2-hd.png", thumb: "/images/model-variant-2.png" }
        ];
    }


    // ======================================
    // IF NEW DYNAMIC CONTAINER EXISTS
    // ======================================

    if (container) {

        container.innerHTML = `

            <!-- ==================================
                 MAIN PRODUCT 2-COLUMN GRID (PHOTO + DETAILS)
            =================================== -->
            <div class="product-main-grid">

                <!-- ==================================
                     PRODUCT MEDIA (LEFT SIDE)
                =================================== -->

                <div class="product-detail-media">

                <!-- MAIN PRODUCT IMAGE -->
                <div class="product-detail-image" id="productImageSection">

                    <img
                        id="productImage"
                        src="${escapeHTML(displayImagePath)}"
                        alt="${escapeHTML(name)}"
                        onerror="
                            this.onerror=null;
                            this.src='/images/jacket2.jpg';
                            this.src='${fallbackDefaultImg}';
                        "
                    >

                    <!-- FLOATING WISHLIST (TOP RIGHT) -->
                    <button
                        type="button"
                        class="detail-image-wishlist-btn"
                        id="detailImageWishlistBtn"
                        onclick="toggleDetailWishlist(${Number(product.id)}, event)"
                        aria-label="Add ${escapeHTML(name)} to wishlist"
                        title="Add to Wishlist"
                    >
                        <i class="fa-regular fa-heart"></i>
                    </button>

                    <!-- FLOATING SHARE (TOP RIGHT DOWNSIDE OF WISHLIST) -->
                    <button
                        type="button"
                        class="detail-image-share-btn"
                        id="detailImageShareBtn"
                        onclick="openDetailShareModal(event)"
                        aria-label="Share product"
                        title="Share Product"
                    >
                        <i class="fa-regular fa-paper-plane"></i>
                    </button>

                </div>

            </div>


            <!-- ==================================
                 PRODUCT INFORMATION (RIGHT SIDE)
            =================================== -->

            <div class="product-detail-info">


                <!-- CATEGORY -->

                <a href="${categoryUrl}" class="product-category" title="Browse ${escapeHTML(displayCategory)}">

                    ${escapeHTML(displayCategory)}

                </a>


                <!-- NAME -->

                <h1>

                    ${escapeHTML(name)}

                </h1>


                <!-- PRICE -->

                <div class="detail-price">

                    ₹${price.toFixed(2)}

                </div>


                <!-- DESCRIPTION -->

                <p class="detail-description">

                    ${escapeHTML(description)}

                </p>


                <!-- COLOR SELECTOR -->

                ${
                    availableColors.length > 0
                        ? `
                            <div class="product-color-selector">

                                <div class="color-header-row">
                                    <label>
                                        COLOR: <span class="selected-color-label" id="selectedColorName">${escapeHTML(selectedProductColor)}</span>
                                    </label>
                                </div>

                                <div class="product-color-options">

                                    ${availableColors
                                        .map(
                                            function (colorItem) {

                                                const isSelected =
                                                    colorItem.name === selectedProductColor;

                                                const borderStyle =
                                                    colorItem.border
                                                        ? "border: 1.5px solid #d1d5db;"
                                                        : "";

                                                const resolvedImg =
                                                    colorItem.image ||
                                                    resolveColorImage(colorItem.name, currentProduct);

                                                const imageArg =
                                                    resolvedImg
                                                        ? `'${escapeHTML(resolvedImg).replace(/'/g, "\\'")}'`
                                                        : "null";

                                                const thisColorStock =
                                                    getVariantStockForSelection(product, colorItem.name, selectedProductSize);

                                                const thisColorOutOfStock =
                                                    thisColorStock <= 0;

                                                return `
                                                    <button
                                                        type="button"
                                                        class="color-option ${
                                                            isSelected ? "selected" : ""
                                                        } ${thisColorOutOfStock ? "is-out-of-stock" : ""}"
                                                        data-color="${escapeHTML(colorItem.name)}"
                                                        onclick="selectProductColor('${escapeHTML(colorItem.name).replace(/'/g, "\\'")}', '${colorItem.hex}', ${imageArg})"
                                                        title="${escapeHTML(colorItem.name)}${thisColorOutOfStock ? ' (Out of Stock)' : ` (${thisColorStock} in stock)`}"
                                                    >
                                                        <span
                                                            class="color-swatch-circle"
                                                            style="background-color: ${colorItem.hex}; ${borderStyle}"
                                                        >
                                                            ${
                                                                isSelected
                                                                    ? '<i class="fa-solid fa-check"></i>'
                                                                    : ""
                                                            }
                                                        </span>
                                                        <span class="color-name-text">
                                                            ${escapeHTML(colorItem.name)}
                                                            ${
                                                                thisColorOutOfStock
                                                                    ? '<span class="color-oos-pill" style="font-size:10px; font-weight:700; color:#dc2626; background:#fee2e2; padding:1px 5px; border-radius:4px; margin-left:4px;">Out of Stock</span>'
                                                                    : `<span class="color-stock-pill" style="font-size:10px; font-weight:600; color:#166534; background:#dcfce7; padding:1px 5px; border-radius:4px; margin-left:4px;">${thisColorStock} in stock</span>`
                                                            }
                                                        </span>
                                                    </button>
                                                `;

                                            }
                                        )
                                        .join("")}

                                </div>

                            </div>
                        `
                        : ""
                }


                <!-- SIZE -->

                ${
                    availableSizes.length > 0
                        ? `
                            <div class="product-size-selector">

                                <label>
                                    Size
                                </label>

                                <div class="product-size-options">

                                    ${availableSizes
                                        .map(
                                            function (size) {

                                                return `
                                                    <button
                                                        type="button"
                                                        class="size-option ${
                                                            size === selectedProductSize
                                                                ? "selected"
                                                                : ""
                                                        }"
                                                        data-size="${size}"
                                                        onclick="selectProductSize('${size}')"
                                                    >
                                                        ${size}
                                                    </button>
                                                `;

                                            }
                                        )
                                        .join("")}

                                </div>

                            </div>
                        `
                        : ""
                }


                <!-- STOCK -->

                <div class="stock-status ${isOutOfStock ? 'out-of-stock' : 'in-stock'}" id="productStockBadge">

                    ${
                        isOutOfStock
                            ? '<span class="stock-badge-icon">✕</span> Out of Stock'
                            : `<span class="stock-badge-icon">✓</span> In Stock (${activeColorStock} available)`
                    }

                </div>


                <!-- ==================================
                     QUANTITY
                =================================== -->

                <div class="quantity-section">

                    <label>
                        Quantity:
                    </label>


                    <div class="quantity-control">

                        <button
                            type="button"
                            onclick="decreaseQuantity()"
                            ${isOutOfStock ? "disabled" : ""}
                        >

                            −

                        </button>


                        <span id="quantity">

                            ${isOutOfStock ? "0" : "1"}

                        </span>


                        <button
                            type="button"
                            onclick="increaseQuantity(${activeColorStock})"
                            ${isOutOfStock ? "disabled" : ""}
                        >

                            +

                        </button>

                    </div>

                </div>


                <!-- ==================================
                     BUTTONS
                =================================== -->

                <div class="product-buttons">


                    <!-- ADD TO CART -->

                    <button
                        type="button"
                        class="add-cart-detail ${isOutOfStock ? 'disabled' : ''}"
                        id="addToCartBtn"
                        onclick="addToCart(${Number(product.id)})"
                        ${
                            isOutOfStock
                                ? "disabled"
                                : ""
                        }
                    >

                        <i class="fa-solid fa-bag-shopping"></i> ${isOutOfStock ? "Out of Stock" : "Add to Cart"}

                    </button>


                    <!-- WISHLIST -->

                    <button
                        type="button"
                        class="wishlist-button"
                        onclick="toggleDetailWishlist(${Number(product.id)}, event)"
                        aria-label="Add ${escapeHTML(name)} to wishlist"
                    >

                        <i class="fa-regular fa-heart"></i>

                    </button>


                    <!-- BUY NOW -->

                    <button
                        type="button"
                        class="buy-now-btn ${isOutOfStock ? 'disabled' : ''}"
                        id="buyNowBtn"
                        onclick="buyNow(${Number(product.id)})"
                        ${
                            isOutOfStock
                                ? "disabled"
                                : ""
                        }
                    >

                        <i class="fa-solid fa-bolt"></i> ${isOutOfStock ? "Out of Stock" : "Buy Now"}

                    </button>


                </div>

                <!-- ==================================
                     TRUST SERVICE BADGES (BELOW ADD TO CART)
                =================================== -->
                <div class="trust-badges-wrapper">
                <div class="trust-badges-row">
                    <div class="trust-badge-item" onclick="openTrustBadgeDetails('return', event)" title="Click to view 10 days Return & Exchange policy">
                        <div class="trust-badge-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="1 4 1 10 7 10"></polyline>
                                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                                <rect x="8" y="11" width="8" height="6" rx="1" stroke="#f59e0b" fill="#fef3c7"></rect>
                            </svg>
                        </div>
                        <span class="trust-badge-label">10 days Return<br>&amp; Exchange</span>
                    </div>

                    <div class="trust-badge-item" onclick="openTrustBadgeDetails('pod', event)" title="Click to view Pay on Delivery details">
                        <div class="trust-badge-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="2" y="6" width="13" height="9" rx="1.5" stroke="#059669" fill="#ecfdf5"></rect>
                                <text x="6" y="13" font-size="7.5" font-weight="900" fill="#059669" stroke="none">₹</text>
                                <path d="M12 11h3a2 2 0 0 1 2 2v1l3 2-1 2-4-2h-3"></path>
                            </svg>
                        </div>
                        <span class="trust-badge-label">Pay on<br>Delivery</span>
                    </div>

                    <div class="trust-badge-item" onclick="openTrustBadgeDetails('delivery', event)" title="Click to view Free Delivery details">
                        <div class="trust-badge-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="1" y="5" width="13" height="10" rx="1.5"></rect>
                                <path d="M14 8h4l3 3v4h-7V8z"></path>
                                <circle cx="5.5" cy="17.5" r="2.2" fill="#e2e8f0"></circle>
                                <circle cx="17.5" cy="17.5" r="2.2" fill="#e2e8f0"></circle>
                                <text x="3" y="11.5" font-size="5" font-weight="900" fill="#d97706" stroke="none">FREE</text>
                            </svg>
                        </div>
                        <span class="trust-badge-label">Free<br>Delivery</span>
                    </div>

                    <div class="trust-badge-item" onclick="openTrustBadgeDetails('brand', event)" title="Click to view Top Brand assurance">
                        <div class="trust-badge-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M6 4h12v4a6 6 0 0 1-12 0V4z"></path>
                                <path d="M6 6H3a2 2 0 0 0-2 2v1a4 4 0 0 0 4 4h1"></path>
                                <path d="M18 6h3a2 2 0 0 1 2 2v1a4 4 0 0 1-4 4h-1"></path>
                                <path d="M10 14v4h4v-4"></path>
                                <path d="M8 21h8"></path>
                                <polygon points="12 6.5 13 8.5 15.2 8.8 13.6 10.3 14 12.5 12 11.4 10 12.5 10.4 10.3 8.8 8.8 11 8.5" fill="#f59e0b" stroke="#f59e0b" stroke-width="0.5"></polygon>
                            </svg>
                        </div>
                        <span class="trust-badge-label">Top<br>Brand</span>
                    </div>

                    <div class="trust-badge-item" onclick="openTrustBadgeDetails('amazon', event)" title="Click to view Amazon Delivered details">
                        <div class="trust-badge-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="1" y="5" width="13" height="10" rx="1.5"></rect>
                                <path d="M14 8h4l3 3v4h-7V8z"></path>
                                <circle cx="5.5" cy="17.5" r="2.2" fill="#e2e8f0"></circle>
                                <circle cx="17.5" cy="17.5" r="2.2" fill="#e2e8f0"></circle>
                                <path d="M4 11c2 1.5 5 1.5 7 0" stroke="#f59e0b" stroke-width="1.8" stroke-linecap="round"></path>
                            </svg>
                        </div>
                        <span class="trust-badge-label">Amazon<br>Delivered</span>
                    </div>
                </div>
            </div>

                <!-- ==================================
                     TWO PHOTO CARDS (DOWN SIDE OF 10 DAYS RETURN)
                =================================== -->
                <div class="product-downside-photos-wrapper" id="downsidePhotosWrapper">
                    <div class="downside-photos-header">
                        <span class="downside-photos-title">Colour:</span>
                        <strong class="downside-photos-selected" id="downsidePhotosSelected">${escapeHTML(selectedProductColor || downsidePhotoCards[0].name)}</strong>
                    </div>
                    <div class="downside-photos-row" id="downsidePhotosRow">
                        ${downsidePhotoCards.map(function(card, idx) {
                            const isSelected = idx === 0 || (selectedProductColor && selectedProductColor.toLowerCase() === card.name.toLowerCase());
                            return `
                                <button
                                    type="button"
                                    class="downside-photo-card ${isSelected ? "selected" : ""}"
                                    data-image="${escapeHTML(card.image)}"
                                    data-name="${escapeHTML(card.name)}"
                                    data-idx="${idx}"
                                    aria-label="View ${escapeHTML(card.name)}"
                                    title="${escapeHTML(card.name)}"
                                >
                                    <img src="${escapeHTML(card.thumb)}" alt="${escapeHTML(card.name)}" onerror="this.src='/images/gallery-thumb-${(idx % 7) + 1}.png'">
                                </button>
                            `;
                        }).join("")}
                    </div>
                </div>

                <!-- ==================================
                     PRODUCT DETAILS SPECIFICATIONS (AMAZON STYLE - RIGHT SIDE)
                =================================== -->
                <div class="product-specs-section" id="productSpecsSection">
                    <div class="specs-main-header">
                        <h2>Product details</h2>
                    </div>

                    <!-- TOP HIGHLIGHTS -->
                    <div class="specs-block highlights-block" id="specsHighlightsBlock">
                        <div class="specs-block-header" id="specsHighlightsToggle">
                            <h3 class="specs-block-title">Top highlights</h3>
                            <button type="button" class="specs-chevron-btn" id="specsHighlightsChevron" aria-label="Toggle Top Highlights">
                                <i class="fa-solid fa-chevron-up"></i>
                            </button>
                        </div>
                        <div class="specs-block-content" id="specsHighlightsContent">
                            <div class="specs-grid">
                                ${Object.keys(specsData.highlights || {}).map(function (key) {
                                    return `
                                        <div class="spec-row">
                                            <div class="spec-key">${escapeHTML(key)}</div>
                                            <div class="spec-value">${escapeHTML(specsData.highlights[key])}</div>
                                        </div>
                                    `;
                                }).join("")}
                            </div>
                        </div>
                    </div>

                    <div class="specs-divider"></div>

                    <!-- ABOUT THIS ITEM -->
                    ${Array.isArray(specsData.about) && specsData.about.length > 0 ? `
                    <div class="specs-block about-block" id="specsAboutBlock">
                        <div class="specs-block-header">
                            <h3 class="specs-block-title">About this item</h3>
                        </div>
                        <div class="specs-block-content">
                            <ul class="specs-bullet-list">
                                ${specsData.about.map(function (bullet) {
                                    const colonIdx = bullet.indexOf(":");
                                    if (colonIdx > 0 && colonIdx < 40) {
                                        const titlePart = bullet.substring(0, colonIdx);
                                        const bodyPart = bullet.substring(colonIdx + 1);
                                        return `<li><strong>${escapeHTML(titlePart)}:</strong>${escapeHTML(bodyPart)}</li>`;
                                    }
                                    return `<li>${escapeHTML(bullet)}</li>`;
                                }).join("")}
                            </ul>
                        </div>
                    </div>

                    <div class="specs-divider"></div>
                    ` : ""}

                    <!-- ADDITIONAL INFORMATION -->
                    ${specsData.additional && Object.keys(specsData.additional).length > 0 ? `
                    <div class="specs-block additional-block" id="specsAdditionalBlock">
                        <div class="specs-block-header">
                            <h3 class="specs-block-title">Additional Information</h3>
                        </div>
                        <div class="specs-block-content">
                            <div class="specs-grid">
                                ${Object.keys(specsData.additional).map(function (key) {
                                    return `
                                        <div class="spec-row">
                                            <div class="spec-key">${escapeHTML(key)}</div>
                                            <div class="spec-value">${escapeHTML(specsData.additional[key])}</div>
                                        </div>
                                    `;
                                }).join("")}
                            </div>
                        </div>
                    </div>
                    ` : ""}

                    <!-- STYLE -->
                    ${specsData.style && Object.keys(specsData.style).length > 0 ? `
                    <div class="specs-divider"></div>
                    <div class="specs-block style-block" id="specsStyleBlock">
                        <div class="specs-block-header" id="specsStyleToggle">
                            <h3 class="specs-block-title">Style</h3>
                            <button type="button" class="specs-chevron-btn" id="specsStyleChevron" aria-label="Toggle Style">
                                <i class="fa-solid fa-chevron-up"></i>
                            </button>
                        </div>
                        <div class="specs-block-content" id="specsStyleContent">
                            <div class="specs-table-list">
                                ${Object.keys(specsData.style).map(function (key) {
                                    const isColour = key.toLowerCase() === "colour" || key.toLowerCase() === "color";
                                    const val = isColour ? (selectedProductColor || specsData.style[key]) : specsData.style[key];
                                    return `
                                        <div class="specs-table-row" data-spec-key="${escapeHTML(key)}">
                                            <div class="specs-table-key">${escapeHTML(key)}</div>
                                            <div class="specs-table-val" ${isColour ? 'id="specStyleColourVal"' : ''}>${escapeHTML(val)}</div>
                                        </div>
                                    `;
                                }).join("")}
                            </div>
                        </div>
                    </div>
                    ` : ""}

                    <!-- ITEM DETAILS -->
                    ${specsData.itemDetails && Object.keys(specsData.itemDetails).length > 0 ? `
                    <div class="specs-divider"></div>
                    <div class="specs-block item-details-block" id="specsItemDetailsBlock">
                        <div class="specs-block-header" id="specsItemDetailsToggle">
                            <h3 class="specs-block-title">Item details</h3>
                            <button type="button" class="specs-chevron-btn" id="specsItemDetailsChevron" aria-label="Toggle Item Details">
                                <i class="fa-solid fa-chevron-up"></i>
                            </button>
                        </div>
                        <div class="specs-block-content" id="specsItemDetailsContent">
                            <div class="specs-table-list">
                                ${Object.keys(specsData.itemDetails).map(function (key) {
                                    const val = String(specsData.itemDetails[key] || "");
                                    let formattedVal = escapeHTML(val);
                                    if (key === "Best Sellers Rank" && val.includes("See Top 100 in Clothing & Accessories")) {
                                        formattedVal = escapeHTML(val).replace(
                                            escapeHTML("(See Top 100 in Clothing & Accessories)"),
                                            `<a href="/products.html" class="specs-link" style="color: #007185; text-decoration: none;">(See Top 100 in Clothing &amp; Accessories)</a>`
                                        );
                                    }
                                    return `
                                        <div class="specs-table-row">
                                            <div class="specs-table-key">${escapeHTML(key)}</div>
                                            <div class="specs-table-val">${formattedVal}</div>
                                        </div>
                                    `;
                                }).join("")}
                            </div>
                        </div>
                    </div>
                    ` : ""}
                </div>

            </div>
            </div>

            <!-- ==================================
                 RELATED PRODUCTS (SHIFTED TO THE PLACE OF RATINGS)
            =================================== -->

            <div class="related-products-section" id="relatedProductsSection">
                <div class="related-products-header">
                    <h2><i class="fa-solid fa-layer-group" style="color: #832729;"></i> Related Products</h2>
                    <p class="related-products-subtitle">Customers also viewed these matching styles in ${escapeHTML(displayCategory)}</p>
                </div>
                <div class="related-products-grid" id="relatedProductsGrid">
                    <div class="related-loading-placeholder" style="grid-column: 1 / -1; display: flex; align-items: center; justify-content: center; padding: 30px; color: #64748b; gap: 10px;">
                        <i class="fa-solid fa-spinner fa-spin" style="color: #832729; font-size: 20px;"></i>
                        <span>Loading related products...</span>
                    </div>
                </div>
            </div>

            <!-- ==================================
                 CUSTOMER REVIEWS & RATINGS (SHIFTED DOWN SIDE OF RELATED PRODUCTS)
            =================================== -->

            <div class="reviews-section in-product-card" id="reviewsSection">

                <div class="reviews-header-block">
                    <div class="reviews-title-wrap">
                        <h2><i class="fa-solid fa-star" style="color: #f59e0b;"></i> Customer Reviews &amp; Ratings</h2>
                        <p class="reviews-subtitle">Real feedback from verified buyers who received this item</p>
                    </div>
                </div>

                <!-- RATING SUMMARY & WRITE REVIEW GRID -->
                <div class="reviews-grid-top">

                    <!-- AVERAGE RATING CARD -->
                    <div class="rating-summary-card">
                        <div class="average-rating-display">
                            <div id="averageRating" class="average-number">0.0</div>
                            <div id="averageStars" class="average-stars">☆☆☆☆☆</div>
                            <div id="totalReviews" class="total-reviews">0 Reviews</div>
                        </div>

                        <!-- STAR BARS BREAKDOWN -->
                        <div class="rating-bars-container" id="ratingBarsContainer">
                            <div class="rating-bar-row">
                                <span class="star-bar-label">5 ★</span>
                                <div class="star-progress"><div class="star-fill" id="fillStar5" style="width: 0%;"></div></div>
                                <span class="star-bar-count" id="countStar5">0</span>
                            </div>
                            <div class="rating-bar-row">
                                <span class="star-bar-label">4 ★</span>
                                <div class="star-progress"><div class="star-fill" id="fillStar4" style="width: 0%;"></div></div>
                                <span class="star-bar-count" id="countStar4">0</span>
                            </div>
                            <div class="rating-bar-row">
                                <span class="star-bar-label">3 ★</span>
                                <div class="star-progress"><div class="star-fill" id="fillStar3" style="width: 0%;"></div></div>
                                <span class="star-bar-count" id="countStar3">0</span>
                            </div>
                            <div class="rating-bar-row">
                                <span class="star-bar-label">2 ★</span>
                                <div class="star-progress"><div class="star-fill" id="fillStar2" style="width: 0%;"></div></div>
                                <span class="star-bar-count" id="countStar2">0</span>
                            </div>
                            <div class="rating-bar-row">
                                <span class="star-bar-label">1 ★</span>
                                <div class="star-progress"><div class="star-fill" id="fillStar1" style="width: 0%;"></div></div>
                                <span class="star-bar-count" id="countStar1">0</span>
                            </div>
                        </div>
                    </div>

                    <!-- WRITE / UPDATE REVIEW FORM -->
                    <div id="reviewFormSection" class="review-form-card">
                        <div class="review-form-header">
                            <h3 id="reviewFormTitle"><i class="fa-solid fa-pen-nib" style="color: #832729;"></i> Rate &amp; Review this Product</h3>
                            <span id="reviewVerifiedBuyerNotice" class="review-buyer-badge" style="display: none;">
                                <i class="fa-solid fa-shield-halved"></i> Verified Delivered Purchase
                            </span>
                        </div>

                        <label class="rating-picker-label">Choose your rating:</label>
                        <div id="starRating" class="star-rating">
                            <button type="button" data-rating="1" title="1 Star - Poor">★</button>
                            <button type="button" data-rating="2" title="2 Stars - Fair">★</button>
                            <button type="button" data-rating="3" title="3 Stars - Good">★</button>
                            <button type="button" data-rating="4" title="4 Stars - Very Good">★</button>
                            <button type="button" data-rating="5" title="5 Stars - Excellent">★</button>
                        </div>
                        <div id="ratingTextFeedback" class="rating-text-feedback">Select stars to rate</div>

                        <label class="review-textarea-label" for="reviewText">Your Review:</label>
                        <textarea id="reviewText" placeholder="Share your experience with the fabric, fit, quality, and delivery..." rows="4"></textarea>

                        <div class="review-form-actions">
                            <button type="button" id="submitReviewButton" class="submit-review-button">
                                <i class="fa-solid fa-paper-plane"></i> Submit Review
                            </button>
                            <span id="reviewSubmitMsg" class="review-submit-msg"></span>
                        </div>
                    </div>

                </div>

                <!-- REVIEWS LIST -->
                <div class="reviews-list-container">
                    <h3 class="reviews-list-title"><i class="fa-solid fa-comments"></i> Customer Experiences (<span id="reviewsCountBadge">0</span>)</h3>
                    <div id="reviewsList" class="reviews-list">
                        <!-- Dynamic reviews loaded by product-details.js -->
                    </div>
                </div>

            </div>

        `;

        container.querySelectorAll(".product-gallery-thumb").forEach(function (thumbnail, idx) {
            function activateThumbnail() {
                const imageElement = document.getElementById("productImage");
                if (!imageElement || !thumbnail.dataset.image) return;

                const clickedImg = normalizeProductImagePath(thumbnail.dataset.image);
                imageElement.src = clickedImg;
                selectedProductColorImage = clickedImg;

                container.querySelectorAll(".product-gallery-thumb").forEach(function (item) {
                    item.classList.toggle("selected", item === thumbnail);
                });

                // Update zoom lens preview if active
                const lensEl = document.querySelector(".product-zoom-lens");
                if (lensEl) {
                    lensEl.style.backgroundImage = "url('" + clickedImg + "')";
                }

                // Find matching color variant or match by thumbnail index
                if (currentProduct) {
                    const colors = getAvailableColors(currentProduct);
                    let matchingColor = colors.find(function (c) {
                        return c.image && normalizeProductImagePath(c.image) === clickedImg;
                    });
                    if (!matchingColor && colors[idx]) {
                        matchingColor = colors[idx];
                    }
                    if (matchingColor) {
                        selectedProductColor = matchingColor.name;
                        updateStyleSpecColour(matchingColor.name);
                        const labelElement = document.getElementById("selectedColorName");
                        if (labelElement) labelElement.textContent = matchingColor.name;
                        document.querySelectorAll(".color-option").forEach(function (btn) {
                            const isSelected = btn.dataset.color && btn.dataset.color.toLowerCase() === matchingColor.name.toLowerCase();
                            btn.classList.toggle("selected", isSelected);
                            const swatch = btn.querySelector(".color-swatch-circle");
                            if (swatch) {
                                swatch.innerHTML = isSelected ? '<i class="fa-solid fa-check"></i>' : '';
                            }
                        });
                        updateStockDisplayForSelection();
                    }
                }
            }

            thumbnail.addEventListener("click", activateThumbnail);
            thumbnail.addEventListener("mouseenter", activateThumbnail);
        });

        // Activate two photo cards downside of 10 days return
        container.querySelectorAll(".downside-photo-card").forEach(function(card) {
            function activateDownsideCard() {
                const imgEl = document.getElementById("productImage");
                if (!imgEl || !card.dataset.image) return;

                const cardImg = normalizeProductImagePath(card.dataset.image);
                imgEl.src = cardImg;
                selectedProductColorImage = cardImg;

                container.querySelectorAll(".downside-photo-card").forEach(function(c) {
                    c.classList.toggle("selected", c === card);
                });

                const nameLabel = document.getElementById("downsidePhotosSelected");
                if (nameLabel && card.dataset.name) {
                    nameLabel.textContent = card.dataset.name;
                }

                // Synchronize color selector above if matching color exists
                if (card.dataset.name) {
                    selectedProductColor = card.dataset.name;
                    updateStyleSpecColour(card.dataset.name);
                    const colorLabel = document.getElementById("selectedColorName");
                    if (colorLabel) colorLabel.textContent = card.dataset.name;
                    document.querySelectorAll(".color-option").forEach(function(btn) {
                        const isMatch = btn.dataset.color && btn.dataset.color.toLowerCase() === card.dataset.name.toLowerCase();
                        btn.classList.toggle("selected", isMatch);
                    });
                }

                // Synchronize top gallery thumbnail
                document.querySelectorAll(".product-gallery-thumb").forEach(function(th) {
                    const thImg = normalizeProductImagePath(th.dataset.image);
                    th.classList.toggle("selected", thImg === cardImg);
                });

                // Update zoom lens preview
                const lensEl = document.querySelector(".product-zoom-lens");
                if (lensEl) lensEl.style.backgroundImage = "url('" + cardImg + "')";
            }

            card.addEventListener("click", activateDownsideCard);
        });

        updateStockDisplayForSelection();

        // Refine color swatches from actual t-shirt photos
        container.querySelectorAll(".color-option").forEach(function (btn) {
            const colorName = btn.dataset.color;
            const swatch = btn.querySelector(".color-swatch-circle");
            if (!swatch || !colorName) return;

            const matchedColor = availableColors.find(function (c) {
                return c.name.toLowerCase() === colorName.toLowerCase();
            });

            if (matchedColor && matchedColor.image) {
                extractDominantColorFromImage(matchedColor.image, function (exactHex) {
                    swatch.style.backgroundColor = exactHex;
                });
            }
        });

        // Bind Product Details Top Highlights accordion toggle
        const specsHighlightsToggle = container.querySelector("#specsHighlightsToggle");
        const specsHighlightsChevron = container.querySelector("#specsHighlightsChevron");
        const specsHighlightsContent = container.querySelector("#specsHighlightsContent");
        if (specsHighlightsToggle && specsHighlightsContent) {
            specsHighlightsToggle.addEventListener("click", function () {
                const isHidden = specsHighlightsContent.style.display === "none";
                specsHighlightsContent.style.display = isHidden ? "block" : "none";
                if (specsHighlightsChevron) {
                    specsHighlightsChevron.innerHTML = isHidden
                        ? '<i class="fa-solid fa-chevron-up"></i>'
                        : '<i class="fa-solid fa-chevron-down"></i>';
                }
            });
        }

        // Bind Product Details Style accordion toggle
        const specsStyleToggle = container.querySelector("#specsStyleToggle");
        const specsStyleChevron = container.querySelector("#specsStyleChevron");
        const specsStyleContent = container.querySelector("#specsStyleContent");
        if (specsStyleToggle && specsStyleContent) {
            specsStyleToggle.addEventListener("click", function () {
                const isHidden = specsStyleContent.style.display === "none";
                specsStyleContent.style.display = isHidden ? "block" : "none";
                if (specsStyleChevron) {
                    specsStyleChevron.innerHTML = isHidden
                        ? '<i class="fa-solid fa-chevron-up"></i>'
                        : '<i class="fa-solid fa-chevron-down"></i>';
                }
            });
        }

        // Bind Product Details Item Details accordion toggle
        const specsItemDetailsToggle = container.querySelector("#specsItemDetailsToggle");
        const specsItemDetailsChevron = container.querySelector("#specsItemDetailsChevron");
        const specsItemDetailsContent = container.querySelector("#specsItemDetailsContent");
        if (specsItemDetailsToggle && specsItemDetailsContent) {
            specsItemDetailsToggle.addEventListener("click", function () {
                const isHidden = specsItemDetailsContent.style.display === "none";
                specsItemDetailsContent.style.display = isHidden ? "block" : "none";
                if (specsItemDetailsChevron) {
                    specsItemDetailsChevron.innerHTML = isHidden
                        ? '<i class="fa-solid fa-chevron-up"></i>'
                        : '<i class="fa-solid fa-chevron-down"></i>';
                }
            });
        }

        // Initialize review buttons and star picker within the freshly rendered container
        refreshReviewElementReferences();
        initializeStarButtons();
        initializeReviewButton();
        initializeProductImageZoom();
        loadRelatedProducts(product);
    }


    // ======================================
    // STATIC ELEMENTS SUPPORT
    // ======================================

    if (productLoading) {

        productLoading.style.display =
            "none";

    }


    if (productDetails) {

        productDetails.style.display =
            "grid";

    }


    if (productName) {

        productName.textContent =
            name;

    }


    if (productPrice) {

        productPrice.textContent =
            `₹${price.toFixed(2)}`;

    }


    if (productCategory) {

        productCategory.textContent =
            category;

    }


    if (productDescription) {

        productDescription.textContent =
            description;

    }


    if (productImage) {

        productImage.src =
            imagePath;


        productImage.alt =
            name;


        productImage.onerror =
            function () {

                this.onerror = null;

                this.src =
                    "/images/tshirt1.jpg";

            };

    }


    // ======================================
    // ADD CART BUTTON SUPPORT
    // ======================================

    if (addCartButton) {

        addCartButton.onclick =
            function () {

                addToCart(
                    Number(product.id)
                );

            };

    }


    // ======================================
    // SAVE PRODUCT
    // ======================================

    currentProduct =
        product;


    window.currentProduct =
        product;

}


// ==========================================
// LOAD REVIEWS
// ==========================================

async function loadReviews() {

    refreshReviewElementReferences();

    if (!reviewsList) {

        console.log(
            "Reviews list element not found."
        );

        return;

    }


    try {

        const response =
            await fetch(
                `/api/reviews/product/${encodeURIComponent(
                    productId
                )}`
            );


        if (!response.ok) {

            throw new Error(
                `HTTP error: ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "Reviews API response:",
            data
        );


        if (!data.success) {

            throw new Error(
                data.message ||
                "Failed to load reviews."
            );

        }


        // ----------------------------------
        // SUMMARY
        // ----------------------------------

        displayReviewSummary(
            data.summary || {}
        );


        // ----------------------------------
        // REVIEWS
        // ----------------------------------

        displayReviews(
            data.reviews || []
        );

        // ----------------------------------
        // CHECK DELIVERED ORDER ELIGIBILITY
        // ----------------------------------
        const currentUserId = getUserId();
        if (currentUserId && productId) {
            try {
                const elRes = await fetch(`/api/reviews/can-review/${encodeURIComponent(productId)}?user_id=${currentUserId}`);
                const elData = await elRes.json();
                if (elData.success) {
                    const notice = document.getElementById("reviewVerifiedBuyerNotice");
                    if (notice && elData.hasDeliveredOrder) {
                        notice.style.display = "inline-flex";
                    }
                    if (elData.alreadyReviewed && elData.existingReview) {
                        const formTitle = document.getElementById("reviewFormTitle");
                        if (formTitle) {
                            formTitle.innerHTML = '<i class="fa-solid fa-pen-nib" style="color: #832729;"></i> Update Your Review';
                        }
                        selectedRating = Number(elData.existingReview.rating) || 5;
                        updateSelectedStars();
                        if (reviewText && !reviewText.value) {
                            reviewText.value = elData.existingReview.review_text || "";
                        }
                    }
                }
            } catch (err) {
                console.warn("Could not check review eligibility:", err.message);
            }
        }

    }

    catch (error) {

        console.error(
            "Reviews Error:",
            error
        );


        reviewsList.innerHTML = `

            <div class="no-reviews">

                Unable to load reviews.

            </div>

        `;

    }

}


// ==========================================
// DISPLAY REVIEW SUMMARY
// ==========================================

function displayReviewSummary(summary) {
    summary = summary || {};
    const average = Number(summary.average_rating) || 0;
    const count = Number(summary.total_reviews) || 0;

    if (averageRating) {
        averageRating.textContent = average.toFixed(1);
    }

    if (averageStars) {
        averageStars.textContent = createStars(Math.round(average));
    }

    const reviewLabel = `${count} Review${count !== 1 ? "s" : ""}`;
    if (totalReviews) {
        totalReviews.textContent = reviewLabel;
    }



    // Update 5-to-1 star breakdown bars
    const counts = summary.star_counts || {};
    for (let s = 1; s <= 5; s++) {
        const c = Number(counts[s]) || 0;
        const pct = count > 0 ? Math.round((c / count) * 100) : 0;
        const fillEl = document.getElementById(`fillStar${s}`);
        const countEl = document.getElementById(`countStar${s}`);
        if (fillEl) fillEl.style.width = `${pct}%`;
        if (countEl) countEl.textContent = c;
    }
    const badge = document.getElementById("reviewsCountBadge");
    if (badge) badge.textContent = count;
}


// ==========================================
// CREATE STARS
// ==========================================

function createStars(rating) {
    rating = Number(rating) || 0;
    let stars = "";
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating ? "★" : "☆";
    }
    return stars;
}


// ==========================================
// DISPLAY REVIEWS
// ==========================================

function displayReviews(reviews) {
    if (!reviewsList) return;
    reviewsList.innerHTML = "";

    if (!reviews || reviews.length === 0) {
        reviewsList.innerHTML = `
            <div class="no-reviews" style="text-align:center;padding:36px 20px;background:#f8fafc;border:1.5px dashed #cbd5e1;border-radius:12px;color:#64748b;">
                <div style="font-size:32px;margin-bottom:8px;">💬</div>
                <strong style="color:#0f172a;font-size:16px;">No reviews yet</strong>
                <p style="margin:4px 0 0;font-size:13.5px;">Be the first customer to review this product!</p>
            </div>
        `;
        return;
    }

    const currentUserId = getUserId();

    reviews.forEach(function (item) {
        const card = document.createElement("div");
        card.className = "review-card";

        const userName = item.user_name || "Customer";
        const reviewContent = item.review_text || item.review || "";
        const initial = (userName || "C").trim().charAt(0).toUpperCase();

        let date = "";
        if (item.created_at) {
            const dateObject = new Date(item.created_at);
            if (!isNaN(dateObject.getTime())) {
                date = dateObject.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
            }
        }

        let actions = "";
        if (currentUserId && Number(item.user_id) === Number(currentUserId)) {
            actions = `
                <div class="review-actions" style="margin-top:10px;">
                    <button type="button" class="edit-review-button" onclick="editReview(${Number(item.id)}, ${Number(item.rating)}, ${JSON.stringify(reviewContent)})">
                        <i class="fa-solid fa-pen-to-square"></i> Edit
                    </button>
                    <button type="button" class="delete-review-button" onclick="deleteReview(${Number(item.id)})">
                        <i class="fa-regular fa-trash-can"></i> Delete
                    </button>
                </div>
            `;
        }

        const verifiedBadge = item.verified_buyer
            ? '<span class="verified-badge"><i class="fa-solid fa-circle-check"></i> Verified Purchase</span>'
            : '';

        card.innerHTML = `
            <div class="review-card-header">
                <div class="review-user-block">
                    <div class="review-user-avatar">${escapeHTML(initial)}</div>
                    <div>
                        <div class="review-user-name">${escapeHTML(userName)}</div>
                        ${verifiedBadge}
                    </div>
                </div>
                <div class="review-date">${escapeHTML(date)}</div>
            </div>
            <div class="review-stars">${createStars(Number(item.rating))}</div>
            <div class="review-content">${escapeHTML(reviewContent)}</div>
            ${actions}
        `;

        reviewsList.appendChild(card);
    });
}


// ==========================================
// STAR RATING BUTTONS
// ==========================================

const ratingLabels = {
    1: "1 Star - Poor 😞",
    2: "2 Stars - Fair 😐",
    3: "3 Stars - Good 🙂",
    4: "4 Stars - Very Good 😊",
    5: "5 Stars - Excellent! 🌟"
};

function initializeStarButtons() {
    const starButtons = document.querySelectorAll("#starRating button");
    starButtons.forEach(function (button) {
        button.onclick = function () {
            selectedRating = Number(this.dataset.rating);
            updateSelectedStars();
        };
    });
    updateSelectedStars();
}

function updateSelectedStars() {
    const starButtons = document.querySelectorAll("#starRating button");
    starButtons.forEach(function (button) {
        const rating = Number(button.dataset.rating);
        button.textContent = "★";
        if (rating <= selectedRating) {
            button.style.color = "#f59e0b";
        } else {
            button.style.color = "#cbd5e1";
        }
    });
    const feedback = document.getElementById("ratingTextFeedback");
    if (feedback) {
        feedback.textContent = ratingLabels[selectedRating] || "Select stars to rate";
        feedback.style.color = selectedRating > 0 ? "#832729" : "#64748b";
    }
}


// ==========================================
// SUBMIT REVIEW
// ==========================================

async function submitReview() {

    // --------------------------------------
    // GET USER
    // --------------------------------------

    const userId =
        getUserId();


    // --------------------------------------
    // LOGIN CHECK
    // --------------------------------------

    if (!userId) {

        alert(
            "Please login before submitting a review."
        );


        window.location.href = "./login.html";


        return;

    }


    // --------------------------------------
    // RATING CHECK
    // --------------------------------------

    if (
        selectedRating < 1 ||
        selectedRating > 5
    ) {

        alert(
            "Please select a rating."
        );


        return;

    }


    // --------------------------------------
    // REVIEW TEXT
    // --------------------------------------

    if (!reviewText) {

        alert(
            "Review field not found."
        );


        return;

    }


    const review =
        reviewText.value.trim();


    if (!review) {

        alert(
            "Please write your review."
        );


        return;

    }


    // --------------------------------------
    // PRODUCT ID CHECK
    // --------------------------------------

    if (!productId) {

        alert(
            "Product ID is missing."
        );


        return;

    }


    try {

        const response =
            await fetch(
                "/api/reviews",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            product_id:
                                Number(productId),

                            user_id:
                                Number(userId),

                            rating:
                                selectedRating,

                            review:
                                review,

                            review_text:
                                review

                        })

                }
            );


        const data =
            await response.json().catch(() => null);


        console.log(
            "Submit Review Response:",
            data
        );


        if (!response.ok || (data && !data.success)) {

            alert(
                (data && data.message) ||
                `Failed to submit review (HTTP ${response.status}).`
            );


            return;

        }


        // ----------------------------------
        // SUCCESS
        // ----------------------------------

        alert(
            "⭐ Review submitted successfully!"
        );


        // ----------------------------------
        // CLEAR FORM
        // ----------------------------------

        reviewText.value =
            "";


        selectedRating =
            0;


        updateSelectedStars();


        // ----------------------------------
        // RELOAD REVIEWS
        // ----------------------------------

        await loadReviews();

    }

    catch (error) {

        console.error(
            "Submit Review Error:",
            error
        );


        alert(
            "Server error while submitting review."
        );

    }

}


// ==========================================
// EDIT REVIEW
// ==========================================

async function editReview(
    reviewId,
    oldRating,
    oldReview
) {

    // --------------------------------------
    // USER
    // --------------------------------------

    const userId =
        getUserId();


    if (!userId) {

        alert(
            "Please login first."
        );


        return;

    }


    // --------------------------------------
    // NEW RATING
    // --------------------------------------

    const newRating =
        prompt(
            "Enter rating from 1 to 5:",
            oldRating
        );


    if (
        newRating === null
    ) {

        return;

    }


    const rating =
        Number(
            newRating
        );


    // --------------------------------------
    // VALIDATE RATING
    // --------------------------------------

    if (
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5
    ) {

        alert(
            "Rating must be between 1 and 5."
        );


        return;

    }


    // --------------------------------------
    // NEW REVIEW
    // --------------------------------------

    const newReview =
        prompt(
            "Write your review:",
            oldReview
        );


    if (
        newReview === null
    ) {

        return;

    }


    if (
        !newReview.trim()
    ) {

        alert(
            "Review cannot be empty."
        );


        return;

    }


    try {

        const response =
            await fetch(
                `/api/reviews/${encodeURIComponent(
                    reviewId
                )}`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            user_id:
                                Number(userId),

                            rating:
                                rating,

                            review:
                                newReview.trim()

                        })

                }
            );


        const data =
            await response.json().catch(() => null);


        console.log(
            "Edit Review Response:",
            data
        );


        if (!response.ok || (data && !data.success)) {

            alert(
                (data && data.message) ||
                `Failed to update review (HTTP ${response.status}).`
            );


            return;

        }


        alert(
            "Review updated successfully."
        );


        await loadReviews();

    }

    catch (error) {

        console.error(
            "Edit Review Error:",
            error
        );


        alert(
            "Server error."
        );

    }

}


// ==========================================
// DELETE REVIEW
// ==========================================

async function deleteReview(reviewId) {

    // --------------------------------------
    // USER
    // --------------------------------------

    const userId =
        getUserId();


    if (!userId) {

        alert(
            "Please login first."
        );


        return;

    }


    // --------------------------------------
    // CONFIRM
    // --------------------------------------

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this review?"
        );


    if (!confirmDelete) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/reviews/${encodeURIComponent(
                    reviewId
                )}?user_id=${encodeURIComponent(
                    userId
                )}`,
                {

                    method: "DELETE"

                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP error: ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "Delete Review Response:",
            data
        );


        if (!data.success) {

            alert(
                data.message ||
                "Failed to delete review."
            );


            return;

        }


        alert(
            "Review deleted successfully."
        );


        await loadReviews();

    }

    catch (error) {

        console.error(
            "Delete Review Error:",
            error
        );


        alert(
            "Server error."
        );

    }

}


// ==========================================
// ADD TO WISHLIST
// ==========================================

async function addToWishlist(productId) {

    // --------------------------------------
    // USER ID
    // --------------------------------------

    let userId =
        localStorage.getItem(
            "userId"
        );


    // --------------------------------------
    // USER OBJECT
    // --------------------------------------

    if (!userId) {

        const user =
            localStorage.getItem(
                "user"
            );


        if (user) {

            try {

                const userData =
                    JSON.parse(
                        user
                    );


                userId =
                    userData.id ||
                    userData.user_id;

            }

            catch (error) {

                console.error(
                    "Invalid user data:",
                    error
                );

            }

        }

    }


    // --------------------------------------
    // LOGIN CHECK
    // --------------------------------------

    if (!userId) {

        alert(
            "Please login to add products to your wishlist."
        );


        window.location.href = "./login.html";


        return;

    }


    // --------------------------------------
    // PRODUCT ID CHECK
    // --------------------------------------

    if (
        !productId ||
        Number(productId) <= 0
    ) {

        alert(
            "Invalid product ID."
        );


        return;

    }


    try {

        const response =
            await fetch(
                "/api/wishlist",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            user_id:
                                Number(userId),

                            product_id:
                                Number(productId)

                        })

                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP error: ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "Wishlist Response:",
            data
        );


        if (data.success) {

            alert(
                "❤️ Product added to wishlist!"
            );


            return;

        }


        alert(
            data.message ||
            "Failed to add product to wishlist."
        );

    }

    catch (error) {

        console.error(
            "Wishlist Error:",
            error
        );


        alert(
            "Unable to connect to server."
        );

    }

}


// ==========================================
// INCREASE QUANTITY
// ==========================================

function increaseQuantity(stock) {

    const activeStock = (currentProduct && selectedProductColor)
        ? getVariantStockForSelection(currentProduct, selectedProductColor, selectedProductSize)
        : (Number(stock) || 0);


    // --------------------------------------
    // OUT OF STOCK
    // --------------------------------------

    if (activeStock <= 0) {

        return;

    }


    // --------------------------------------
    // INCREASE
    // --------------------------------------

    if (
        quantity < activeStock
    ) {

        quantity++;


        const quantityElement =
            document.getElementById(
                "quantity"
            );


        if (quantityElement) {

            quantityElement.textContent =
                quantity;

        }

    }

    else {

        alert(
            `Only ${activeStock} item(s) available in stock for ${selectedProductColor || "this item"}.`
        );

    }

}


// ==========================================
// DECREASE QUANTITY
// ==========================================

function decreaseQuantity() {

    if (
        quantity > 1
    ) {

        quantity--;


        const quantityElement =
            document.getElementById(
                "quantity"
            );


        if (quantityElement) {

            quantityElement.textContent =
                quantity;

        }

    }

}


// ==========================================
// LOAD PRODUCT BY ID
// ==========================================

async function loadProductById(productId) {

    if (
        currentProduct &&
        Number(currentProduct.id) === Number(productId)
    ) {

        return currentProduct;

    }


    try {

        const response =
            await fetch(
                `/api/products/${encodeURIComponent(
                    productId
                )}`
            );


        if (!response.ok) {

            throw new Error(
                `HTTP error: ${response.status}`
            );

        }


        const data =
            await response.json();


        const product =
            data.product ||
            data.data;


        if (!product) {

            return null;

        }


        currentProduct =
            product;


        window.currentProduct =
            product;


        return product;

    }

    catch (error) {

        console.error(
            "Product load error:",
            error
        );

        return null;

    }

}


// ==========================================
// ADD TO CART
// ==========================================

async function addToCart(productId, showAlert = true) {

    try {

        // ==================================
        // ENSURE CURRENT PRODUCT IS AVAILABLE
        // ==================================

        const productData =
            await loadProductById(productId);


        if (!productData) {

            alert(
                "Product information is not available."
            );


            return false;

        }


        // ==================================
        // GET CART
        // ==================================

        let cart = [];


        try {

            cart =
                JSON.parse(
                    localStorage.getItem(
                        "cart"
                    )
                ) || [];


            if (
                !Array.isArray(cart)
            ) {

                cart = [];

            }

        }

        catch (error) {

            console.error(
                "Cart parsing error:",
                error
            );


            cart = [];

        }


        // ==================================
        // PRODUCT ID
        // ==================================

        const id =
            Number(productId);


        // ==================================
        // VALID ID
        // ==================================

        if (
            !id ||
            id <= 0
        ) {

            alert(
                "Invalid product ID."
            );


            return false;

        }


        // ==================================
        // VARIANT / PRODUCT STOCK
        // ==================================

        const stock =
            getVariantStockForSelection(
                productData || currentProduct,
                selectedProductColor,
                selectedProductSize
            );


        if (
            stock <= 0
        ) {

            alert(
                `Sorry, ${selectedProductColor ? selectedProductColor + " is " : ""}out of stock.`
            );


            return false;

        }


        // ==================================
        // SELECTED QUANTITY
        // ==================================

        const selectedQuantity =
            Number(quantity) || 1;

        if (selectedQuantity > stock) {
            alert(
                `Only ${stock} item(s) available in stock for ${selectedProductColor || "this item"}.`
            );
            return false;
        }


        const selectedPrice =
            getSelectedSizePrice(
                productData,
                selectedProductSize
            );


        // ==================================
        // CHECK EXISTING PRODUCT
        // ==================================

        const existingProduct =
            cart.find(
                function (item) {

                    return (
                        Number(item.id) ===
                        id &&
                        (
                            !selectedProductSize ||
                            String(item.size || "") ===
                            String(selectedProductSize)
                        ) &&
                        (
                            !selectedProductColor ||
                            String(item.color || "") ===
                            String(selectedProductColor)
                        )
                    );

                }
            );


        // ==================================
        // UPDATE EXISTING
        // ==================================

        if (
            existingProduct
        ) {

            const existingQuantity =
                Number(
                    existingProduct.quantity
                ) || 0;


            const newQuantity =
                existingQuantity +
                selectedQuantity;


            // --------------------------------
            // STOCK LIMIT
            // --------------------------------

            if (
                newQuantity > stock
            ) {

                alert(
                    `Only ${stock} item(s) available in stock for ${selectedProductColor || "this item"}.`
                );


                return false;

            }


            existingProduct.quantity =
                newQuantity;


            // --------------------------------
            // UPDATE DATA
            // --------------------------------

            existingProduct.id =
                id;


            existingProduct.productId =
                id;


            existingProduct.product_id =
                id;


            existingProduct.name =
                currentProduct.name;


            existingProduct.price =
                selectedPrice;


            existingProduct.category =
                currentProduct.category ||
                "General";


            existingProduct.description =
                currentProduct.description ||
                "";


            existingProduct.stock =
                stock;


            existingProduct.size =
                selectedProductSize ||
                existingProduct.size ||
                null;


            existingProduct.color =
                selectedProductColor ||
                existingProduct.color ||
                null;


            existingProduct.image =
                selectedProductColorImage ||
                currentProduct.image ||
                "jacket3.jpg";

        }


        // ==================================
        // ADD NEW PRODUCT
        // ==================================

        else {

            cart.push({

                id:
                    id,

                productId:
                    id,

                product_id:
                    id,

                name:
                    currentProduct.name,

                price:
                    selectedPrice,

                category:
                    currentProduct.category ||
                    "General",

                description:
                    currentProduct.description ||
                    "",

                stock:
                    stock,

                size:
                    selectedProductSize ||
                    null,

                color:
                    selectedProductColor ||
                    null,

                image:
                    selectedProductColorImage ||
                    currentProduct.image ||
                    "jacket3.jpg",

                quantity:
                    selectedQuantity

            });

        }


        // ==================================
        // SAVE CART
        // ==================================

        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );


        // ==================================
        // UPDATE CART COUNT
        // ==================================

        updateCartCount();


        // ==================================
        // LOG
        // ==================================

        console.log(
            "Cart updated:",
            cart
        );


        // ==================================
        // SUCCESS
        // ==================================

        if (showAlert) {

            alert(
                `${currentProduct.name} added to cart!`
            );

        }


        return true;

    }

    catch (error) {

        console.error(
            "Add to Cart Error:",
            error
        );


        alert(
            "Unable to add product to cart."
        );


        return false;

    }

}


// ==========================================
// BUY NOW
// ==========================================

async function buyNow(productId) {

    const success =
        await addToCart(productId, false);

    if (success) {

        window.location.href =
            "/cart.html";

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


    // --------------------------------------
    // ELEMENT NOT FOUND
    // --------------------------------------

    if (!cartCount) {

        return;

    }


    // --------------------------------------
    // GET CART
    // --------------------------------------

    let cart = [];


    try {

        cart =
            JSON.parse(
                localStorage.getItem(
                    "cart"
                )
            ) || [];


        if (
            !Array.isArray(cart)
        ) {

            cart = [];

        }

    }

    catch (error) {

        console.error(
            "Cart error:",
            error
        );


        cart = [];

    }


    // --------------------------------------
    // CALCULATE COUNT
    // --------------------------------------

    const count =
        cart.reduce(
            function (
                total,
                item
            ) {

                return (
                    total +
                    (
                        Number(
                            item.quantity
                        ) || 0
                    )
                );

            },
            0
        );


    // --------------------------------------
    // DISPLAY COUNT
    // --------------------------------------

    cartCount.textContent =
        count;

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

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
// ALIAS FOR COMPATIBILITY
// ==========================================

function escapeHtml(value) {

    return escapeHTML(value);

}


// ==========================================
// INITIALIZE REVIEW SUBMIT BUTTON
// ==========================================

function initializeReviewButton() {

    const button =
        document.getElementById(
            "submitReviewButton"
        );


    if (!button) {

        return;

    }


    // --------------------------------------
    // REMOVE INLINE DUPLICATION
    // --------------------------------------

    button.onclick =
        function (event) {

            event.preventDefault();

            submitReview();

        };

}


// ==========================================
// DOM CONTENT LOADED
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Product details JavaScript initialized."
        );


        // ----------------------------------
        // UPDATE CART COUNT
        // ----------------------------------

        updateCartCount();


        // ----------------------------------
        // STAR BUTTONS
        // ----------------------------------

        initializeStarButtons();


        // ----------------------------------
        // REVIEW BUTTON
        // ----------------------------------

        initializeReviewButton();


        // ----------------------------------
        // LOAD PRODUCT
        // ----------------------------------

        loadProduct();

    }
);

// ============================================================
// PRODUCT DETAILS: WISHLIST & SHARE BUTTONS IMPLEMENTATION
// ============================================================

async function checkWishlistStatus(productId) {
    let userId = localStorage.getItem("userId");
    if (!userId) {
        const user = localStorage.getItem("user");
        if (user) {
            try {
                const userData = JSON.parse(user);
                userId = userData.id || userData.user_id;
            } catch (e) {}
        }
    }
    if (!userId || !productId) return;

    try {
        const res = await fetch(`/api/wishlist?user_id=${userId}`);
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data.wishlist) ? data.wishlist : (Array.isArray(data) ? data : []);
        const exists = list.some(item => Number(item.product_id || item.id) === Number(productId));
        updateWishlistButtonUI(exists);
    } catch (e) {
        console.error("Wishlist check error:", e);
    }
}

function updateWishlistButtonUI(isInWishlist) {
    const floatingBtn = document.getElementById("detailImageWishlistBtn");
    const bottomBtn = document.querySelector(".wishlist-button");

    [floatingBtn, bottomBtn].forEach(btn => {
        if (!btn) return;
        if (isInWishlist) {
            btn.classList.add("active", "in-wishlist");
            const icon = btn.querySelector("i");
            if (icon) {
                icon.classList.remove("fa-regular");
                icon.classList.add("fa-solid");
            }
        } else {
            btn.classList.remove("active", "in-wishlist");
            const icon = btn.querySelector("i");
            if (icon) {
                icon.classList.remove("fa-solid");
                icon.classList.add("fa-regular");
            }
        }
    });
}

async function toggleDetailWishlist(productId, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }

    let userId = localStorage.getItem("userId");
    if (!userId) {
        const user = localStorage.getItem("user");
        if (user) {
            try {
                const userData = JSON.parse(user);
                userId = userData.id || userData.user_id;
            } catch (e) {}
        }
    }

    if (!userId) {
        alert("Please login to add products to your wishlist.");
        window.location.href = "./login.html";
        return;
    }

    const floatingBtn = document.getElementById("detailImageWishlistBtn");
    const isCurrentlyWishlisted = floatingBtn && floatingBtn.classList.contains("in-wishlist");

    if (isCurrentlyWishlisted) {
        try {
            const res = await fetch(`/api/wishlist/${productId}?user_id=${userId}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (data.success) {
                updateWishlistButtonUI(false);
                showShareToast("Removed from wishlist");
            } else {
                alert(data.message || "Failed to remove from wishlist.");
            }
        } catch (e) {
            console.error("Remove wishlist error:", e);
        }
    } else {
        try {
            const res = await fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: Number(userId), product_id: Number(productId) })
            });
            const data = await res.json();
            if (data.success || data.message === "Product is already in wishlist.") {
                updateWishlistButtonUI(true);
                showShareToast("❤️ Product added to wishlist!");
            } else {
                alert(data.message || "Failed to add to wishlist.");
            }
        } catch (e) {
            console.error("Add wishlist error:", e);
        }
    }
}

function openDetailShareModal(event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const prod = currentProduct || {};
    openProductShareModal(prod.id || (typeof productId !== 'undefined' ? productId : 0), event);
}

function openProductShareModal(productId, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }

    const prod = currentProduct || {};
    const imgEl = document.getElementById("productImage");
    const productName = prod.name || document.querySelector("h1")?.textContent.trim() || "Product";
    const productImg = (imgEl && imgEl.src) ? imgEl.src : (prod.image || "/images/shirts1.jpg");
    const productPrice = prod.price ? `₹${Number(prod.price).toFixed(2)}` : (document.querySelector(".product-price")?.textContent.trim() || "");
    const productCategory = prod.category || document.querySelector(".product-category")?.textContent.trim() || "";

    const activeColor = (typeof selectedProductColor !== "undefined" && selectedProductColor) ? selectedProductColor : "";

    // Build reliable, absolute product URL
    let resolvedId = productId || (prod && prod.id);
    if (!resolvedId) {
        const urlParams = new URLSearchParams(window.location.search);
        resolvedId = urlParams.get("id") || 1;
    }

    let baseUrl = window.location.origin;
    if (!baseUrl || baseUrl === "null" || window.location.protocol === "file:") {
        baseUrl = "http://localhost:5000";
    }

    let shareUrl = `${baseUrl}/product-details.html?id=${encodeURIComponent(resolvedId)}`;
    if (activeColor) {
        shareUrl += `&color=${encodeURIComponent(activeColor)}`;
    }

    const shareTitle = productName;
    const shareText = `Check out ${productName} on MyStore!`;
    const priceText = productPrice ? `\n💰 Price: ${productPrice}` : '';
    const whatsappText = `🛍️ *${productName}*${priceText}\n\n👉 View & Buy here:\n${shareUrl}`;

    let modalOverlay = document.getElementById("productShareOverlay");
    if (!modalOverlay) {
        modalOverlay = document.createElement("div");
        modalOverlay.id = "productShareOverlay";
        modalOverlay.className = "product-share-overlay";
        document.body.appendChild(modalOverlay);

        modalOverlay.addEventListener("click", function (e) {
            if (e.target === modalOverlay) {
                closeProductShareModal();
            }
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && modalOverlay.classList.contains("active")) {
                closeProductShareModal();
            }
        });
    }

    modalOverlay.innerHTML = `
        <div class="product-share-modal" role="dialog" aria-modal="true" aria-labelledby="shareModalTitle">
            <!-- Modal Header -->
            <div class="share-modal-header">
                <h3 class="share-modal-title" id="shareModalTitle">Share</h3>
                <button type="button" class="share-modal-close" onclick="closeProductShareModal()" aria-label="Close modal">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <!-- Product Snippet Preview -->
            <div class="share-product-preview">
                <img src="${escapeHTML(productImg)}" alt="${escapeHTML(productName)}" class="share-product-thumb" onerror="this.src='/images/shirts1.jpg'">
                <div class="share-product-info">
                    <div class="share-product-title" title="${escapeHTML(productName)}">${escapeHTML(productName)}</div>
                    <div class="share-product-meta">
                        <span class="share-product-price">${escapeHTML(productPrice)}</span>
                        ${productCategory ? `<span class="share-product-dot">•</span><span class="share-product-cat">${escapeHTML(productCategory)}</span>` : ''}
                    </div>
                </div>
            </div>

            <!-- Share Options Grid -->
            <div class="share-options-grid">
                <!-- Copy Link -->
                <button type="button" class="share-option-item" onclick="triggerCopyShareLink('${escapeHTML(shareUrl)}')">
                    <div class="share-icon-circle bg-copy">
                        <i class="fa-solid fa-link"></i>
                    </div>
                    <span class="share-option-label">Copy Link</span>
                </button>

                <!-- WhatsApp -->
                <a class="share-option-item" href="https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}" target="_blank" rel="noopener noreferrer" onclick="handleWhatsAppShareClick(event, '${escapeHTML(whatsappText)}')">
                    <div class="share-icon-circle bg-whatsapp">
                        <i class="fa-brands fa-whatsapp"></i>
                    </div>
                    <span class="share-option-label">WhatsApp</span>
                </a>

                <!-- Facebook -->
                <a class="share-option-item" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}" target="_blank" rel="noopener noreferrer">
                    <div class="share-icon-circle bg-facebook">
                        <i class="fa-brands fa-facebook-f"></i>
                    </div>
                    <span class="share-option-label">Facebook</span>
                </a>

                <!-- X (Twitter) -->
                <a class="share-option-item" href="https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}" target="_blank" rel="noopener noreferrer">
                    <div class="share-icon-circle bg-x">
                        <i class="fa-brands fa-x-twitter"></i>
                    </div>
                    <span class="share-option-label">X</span>
                </a>

                <!-- Gmail -->
                <a class="share-option-item" href="https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(productName)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}" target="_blank" rel="noopener noreferrer">
                    <div class="share-icon-circle bg-gmail">
                        <i class="fa-solid fa-envelope"></i>
                    </div>
                    <span class="share-option-label">Gmail</span>
                </a>

                <!-- Telegram -->
                <a class="share-option-item" href="https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}" target="_blank" rel="noopener noreferrer">
                    <div class="share-icon-circle bg-telegram">
                        <i class="fa-brands fa-telegram"></i>
                    </div>
                    <span class="share-option-label">Telegram</span>
                </a>

                <!-- Messages / SMS -->
                <a class="share-option-item" href="sms:?body=${encodeURIComponent(shareText + ' ' + shareUrl)}">
                    <div class="share-icon-circle bg-messages">
                        <i class="fa-solid fa-comment-dots"></i>
                    </div>
                    <span class="share-option-label">Messages</span>
                </a>

                <!-- More Options -->
                <button type="button" class="share-option-item" onclick="triggerNativeShare('${escapeHTML(shareTitle)}', '${escapeHTML(shareText)}', '${escapeHTML(shareUrl)}')">
                    <div class="share-icon-circle bg-more">
                        <i class="fa-solid fa-share-nodes"></i>
                    </div>
                    <span class="share-option-label">More</span>
                </button>
            </div>

            <!-- Direct Link Copy Field -->
            <div class="share-link-box">
                <i class="fa-solid fa-link share-input-icon"></i>
                <input type="text" class="share-link-input" id="shareLinkInputField" value="${escapeHTML(shareUrl)}" readonly onclick="this.select();">
                <button type="button" class="share-copy-btn" id="shareCopyBtn" onclick="triggerCopyShareLink('${escapeHTML(shareUrl)}')">
                    <i class="fa-regular fa-copy"></i>
                    <span>Copy</span>
                </button>
            </div>
        </div>
    `;

    requestAnimationFrame(() => {
        modalOverlay.classList.add("active");
        document.body.style.overflow = "hidden";
    });
}

function closeProductShareModal() {
    const modalOverlay = document.getElementById("productShareOverlay");
    if (modalOverlay) {
        modalOverlay.classList.remove("active");
        document.body.style.overflow = "";
    }
}

function triggerCopyShareLink(url) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url)
            .then(showCopiedState)
            .catch(() => fallbackCopy(url));
    } else {
        fallbackCopy(url);
    }
}

function fallbackCopy(url) {
    const input = document.getElementById("shareLinkInputField");
    if (input) {
        input.focus();
        input.select();
        try {
            document.execCommand("copy");
            showCopiedState();
            return;
        } catch (e) {}
    }

    const temp = document.createElement("textarea");
    temp.value = url;
    temp.style.position = "fixed";
    temp.style.top = "-9999px";
    temp.style.left = "-9999px";
    document.body.appendChild(temp);
    temp.focus();
    temp.select();
    try {
        document.execCommand("copy");
        showCopiedState();
    } catch (e) {}
    document.body.removeChild(temp);
}

function showCopiedState() {
    const btn = document.getElementById("shareCopyBtn");
    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Copied!</span>';
        btn.classList.add("copied");
        setTimeout(() => {
            if (btn) {
                btn.innerHTML = '<i class="fa-regular fa-copy"></i> <span>Copy</span>';
                btn.classList.remove("copied");
            }
        }, 2200);
    }
    showShareToast("Link copied to clipboard!");
}

function triggerNativeShare(title, text, url) {
    if (navigator.share) {
        navigator.share({
            title: title,
            text: text,
            url: url
        }).catch(err => {
            if (err.name !== 'AbortError') {
                triggerCopyShareLink(url);
            }
        });
    } else {
        triggerCopyShareLink(url);
    }
}

function showShareToast(message) {
    let toast = document.getElementById("shareToastNotification");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "shareToastNotification";
        toast.className = "share-toast";
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #22c55e;"></i> <span>${escapeHTML(message)}</span>`;
    toast.classList.add("show");
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

function handleWhatsAppShareClick(event, textToShare) {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToShare);
        }
    } catch (e) {}

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        if (event && event.preventDefault) event.preventDefault();
        window.location.href = `whatsapp://send?text=${encodeURIComponent(textToShare)}`;
        setTimeout(() => {
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`, '_blank');
        }, 1200);
    }
}

// Expose globally
window.checkWishlistStatus = checkWishlistStatus;
window.updateWishlistButtonUI = updateWishlistButtonUI;
window.toggleDetailWishlist = toggleDetailWishlist;
window.openDetailShareModal = openDetailShareModal;
window.openProductShareModal = openProductShareModal;
window.closeProductShareModal = closeProductShareModal;
window.triggerCopyShareLink = triggerCopyShareLink;
window.triggerNativeShare = triggerNativeShare;
window.handleWhatsAppShareClick = handleWhatsAppShareClick;