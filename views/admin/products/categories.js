// =====================================================
// ADMIN PRODUCT CATEGORIES
// =====================================================

console.log("Admin Product Categories Loaded");


const productsToggle =
    document.getElementById("productsToggle");

const productsMenu =
    document.getElementById("productsMenu");


const menuBtn =
    document.getElementById("menuBtn");

const sidebar =
    document.getElementById("sidebar");

if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });
}


const categoriesContainer =
    document.getElementById("categoriesContainer");

const categoryGrid =
    document.getElementById("categoryGrid");

const categorySearch =
    document.getElementById("categorySearch");

const clearSearch =
    document.getElementById("clearSearch");

const noCategoriesFound =
    document.getElementById("noCategoriesFound");

const categoryFilterHeader =
    document.getElementById("categoryFilterHeader");

const activeCategoryTitle =
    document.getElementById("activeCategoryTitle");

const activeCategoryBadge =
    document.getElementById("activeCategoryBadge");

const resetCategoryFilterBtn =
    document.getElementById("resetCategoryFilterBtn");

const backToCategoriesBtn =
    document.getElementById("backToCategoriesBtn");

const viewAllProductsQuickBtn =
    document.getElementById("viewAllProductsQuickBtn");


let allProducts = [];
let selectedFilterCategory = null;

// =====================================================
// CANONICAL CATEGORIES & ALIASES
// All variants (e.g. Shirt, shirts) shift into canonical plural names
// =====================================================

const CANONICAL_CATEGORIES = [
    {
        key: "t-shirts",
        name: "T-Shirts",
        icon: "fa-shirt",
        desc: "Comfortable everyday T-Shirts",
        aliases: ["t-shirt", "t-shirts", "tshirt", "tshirts", "tee", "tees", "t shirt", "t shirts"]
    },
    {
        key: "shirts",
        name: "Shirts",
        icon: "fa-user-tie",
        desc: "Formal and casual shirts",
        aliases: ["shirt", "shirts", "formal shirt", "casual shirt", "dress shirt"]
    },
    {
        key: "jeans",
        name: "Jeans",
        icon: "fa-tags",
        desc: "Stylish jeans for every look",
        aliases: ["jean", "jeans", "denim", "denims"]
    },
    {
        key: "pants",
        name: "Pants",
        icon: "fa-layer-group",
        desc: "Comfortable and stylish pants",
        aliases: ["pant", "pants", "trouser", "trousers", "chinos", "chino", "bottom", "bottoms"]
    },
    {
        key: "jackets",
        name: "Jackets",
        icon: "fa-vest",
        desc: "Trendy jackets for every season",
        aliases: ["jacket", "jackets", "coat", "coats", "blazer", "blazers", "outerwear"]
    },
    {
        key: "hoodies",
        name: "Hoodies",
        icon: "fa-fire",
        desc: "Warm and comfortable hoodies",
        aliases: ["hoodie", "hoodies", "sweatshirt", "sweatshirts"]
    },
    {
        key: "shorts",
        name: "Shorts",
        icon: "fa-umbrella-beach",
        desc: "Casual shorts for daily wear",
        aliases: ["short", "shorts"]
    },
    {
        key: "shoes",
        name: "Shoes",
        icon: "fa-shoe-prints",
        desc: "Complete your outfit with shoes",
        aliases: ["shoe", "shoes", "sneaker", "sneakers", "footwear", "boots", "boot"]
    },
    {
        key: "accessories",
        name: "Accessories",
        icon: "fa-gem",
        desc: "Stylish accessories for your look",
        aliases: ["accessory", "accessories", "belt", "belts", "cap", "caps", "hat", "hats", "watch", "watches", "sunglasses"]
    }
];


// =====================================================
// CANONICAL CATEGORY NORMALIZATION
// =====================================================

function getCanonicalCategory(rawCategory) {
    if (!rawCategory) return "Other";
    const cleaned = String(rawCategory).trim().toLowerCase();

    // 1. Direct match on canonical name or key
    for (const cat of CANONICAL_CATEGORIES) {
        if (cat.name.toLowerCase() === cleaned || cat.key === cleaned) {
            return cat.name;
        }
        if (cat.aliases && cat.aliases.includes(cleaned)) {
            return cat.name;
        }
    }

    // 2. Substring or singular/plural check
    for (const cat of CANONICAL_CATEGORIES) {
        const catLower = cat.name.toLowerCase();
        if (cleaned + "s" === catLower || catLower + "s" === cleaned) {
            return cat.name;
        }
        if (cat.aliases && cat.aliases.some(alias => cleaned.includes(alias) || alias.includes(cleaned))) {
            return cat.name;
        }
    }

    // 3. Fallback: Capitalize first letter for custom category
    return rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1);
}

function getCategoryIcon(catName) {
    const canonicalName = getCanonicalCategory(catName).toLowerCase();
    const found = CANONICAL_CATEGORIES.find(c => c.name.toLowerCase() === canonicalName);
    return found ? found.icon : "fa-tags";
}

function getCategoryProductCount(catName) {
    const canonicalTarget = getCanonicalCategory(catName).toLowerCase();
    return allProducts.filter(p => {
        const pCanonical = getCanonicalCategory(p.category || "").toLowerCase();
        return pCanonical === canonicalTarget;
    }).length;
}


// =====================================================
// LOAD PRODUCTS
// =====================================================

async function loadProducts() {
    try {
        const response = await fetch("/api/products");

        if (!response.ok) {
            throw new Error(`Failed to load products. HTTP ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
            allProducts = data;
        } else if (Array.isArray(data.products)) {
            allProducts = data.products;
        } else {
            allProducts = [];
        }

        renderCategoryCards();

        // Check if there is an active category or URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const catParam = urlParams.get("category");

        if (selectedFilterCategory) {
            shiftToCategory(selectedFilterCategory);
        } else if (catParam && catParam.trim() !== "") {
            shiftToCategory(catParam.trim());
        } else {
            // Default: show category grid directory
            shiftBackToCategories();
        }

    } catch (error) {
        console.error("Load Products Error:", error);
        if (categoriesContainer) {
            categoriesContainer.innerHTML = `
                <div class="loading">
                    Failed to load products. Please check your server and API.
                </div>
            `;
        }
    }
}


// =====================================================
// RENDER CATEGORY CARDS (With Real Dynamic Counts)
// =====================================================

function renderCategoryCards() {
    if (!categoryGrid) {
        return;
    }

    // Collect distinct canonical categories from loaded products
    const dynamicCategories = new Set();
    allProducts.forEach(product => {
        if (product.category && String(product.category).trim() !== "") {
            const canonical = getCanonicalCategory(product.category);
            dynamicCategories.add(canonical);
        }
    });

    const categoriesToDisplay = [...CANONICAL_CATEGORIES];

    // Add any database categories that aren't in the default preset list
    dynamicCategories.forEach(catName => {
        const alreadyListed = categoriesToDisplay.some(
            c => c.name.toLowerCase() === catName.toLowerCase()
        );

        if (!alreadyListed) {
            categoriesToDisplay.push({
                key: catName.toLowerCase().replace(/\s+/g, "-"),
                name: catName,
                icon: "fa-tags",
                desc: `Explore ${catName} collection`,
                aliases: [catName.toLowerCase()]
            });
        }
    });

    categoryGrid.innerHTML = categoriesToDisplay.map(cat => {
        const productCount = getCategoryProductCount(cat.name);
        const isFiltered =
            selectedFilterCategory &&
            getCanonicalCategory(selectedFilterCategory).toLowerCase() === cat.name.toLowerCase();

        return `
            <div
                class="category-card ${isFiltered ? 'active-filter' : ''}"
                data-category="${escapeHtml(cat.name)}"
                data-key="${escapeHtml(cat.key)}"
            >
                <div class="category-card-top-row">
                    <span class="category-count-badge">
                        <i class="fa-solid fa-box-archive"></i>
                        ${productCount} ${productCount === 1 ? 'Product' : 'Products'}
                    </span>
                </div>

                <div class="category-icon">
                    <i class="fa-solid ${cat.icon}"></i>
                </div>

                <h3>
                    ${escapeHtml(cat.name)}
                </h3>

                <p>
                    ${escapeHtml(cat.desc)}
                </p>

                <button
                    type="button"
                    class="shop-category-btn"
                    data-category="${escapeHtml(cat.name)}"
                >
                    Shop Now <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        `;
    }).join("");

    // Wire click events on cards
    categoryGrid.querySelectorAll(".category-card").forEach(card => {
        card.addEventListener("click", function () {
            const catName = this.dataset.category;
            shiftToCategory(catName);
        });
    });

    // Wire click events on shop buttons directly
    categoryGrid.querySelectorAll(".shop-category-btn").forEach(btn => {
        btn.addEventListener("click", function (event) {
            event.stopPropagation();
            const catName = this.dataset.category;
            shiftToCategory(catName);
        });
    });
}


// =====================================================
// SHIFT TO SPECIFIC CATEGORY ("Shop Now" Behavior)
// =====================================================

// =====================================================
// SHIFT TO SPECIFIC CATEGORY ("Shop Now" Behavior)
// Shifts inside category: hides grid, shows category products
// =====================================================

function shiftToCategory(catName) {
    const canonicalName = getCanonicalCategory(catName);
    selectedFilterCategory = canonicalName;

    // 1. Hide category directory grid & search bar
    const categoryGridSection = document.getElementById("categoryGridSection");
    if (categoryGridSection) {
        categoryGridSection.style.display = "none";
    }

    const searchBarWrap = document.querySelector(".category-search-bar-wrap");
    if (searchBarWrap) {
        searchBarWrap.style.display = "none";
    }

    // 2. Show category products container & header
    const productsWrapper = document.getElementById("categoryProductsWrapper");
    if (productsWrapper) {
        productsWrapper.style.display = "block";
    }

    if (categoryFilterHeader) {
        categoryFilterHeader.style.display = "flex";
    }

    if (activeCategoryTitle) {
        activeCategoryTitle.textContent = `${canonicalName} Collection`;
    }

    const count = getCategoryProductCount(canonicalName);
    const badge = document.getElementById("activeCategoryBadge");
    if (badge) {
        badge.textContent = `${count} ${count === 1 ? 'Product' : 'Products'}`;
    }

    // 3. Highlight active category card
    if (categoryGrid) {
        categoryGrid.querySelectorAll(".category-card").forEach(c => {
            const cCanonical = getCanonicalCategory(c.dataset.category || "");
            if (cCanonical.toLowerCase() === canonicalName.toLowerCase()) {
                c.classList.add("active-filter");
            } else {
                c.classList.remove("active-filter");
            }
        });
    }

    // 4. Render products inside this category
    displayCategories();

    // 5. Scroll to top so products are immediately visible
    window.scrollTo({ top: 0, behavior: "smooth" });
}


// =====================================================
// SHIFT BACK TO ALL CATEGORIES
// Restores category directory grid
// =====================================================

function shiftBackToCategories() {
    selectedFilterCategory = null;

    // 1. Hide products wrapper & filter header
    const productsWrapper = document.getElementById("categoryProductsWrapper");
    if (productsWrapper) {
        productsWrapper.style.display = "none";
    }

    if (categoryFilterHeader) {
        categoryFilterHeader.style.display = "none";
    }

    // 2. Show category grid & search bar
    const categoryGridSection = document.getElementById("categoryGridSection");
    if (categoryGridSection) {
        categoryGridSection.style.display = "block";
    }

    const searchBarWrap = document.querySelector(".category-search-bar-wrap");
    if (searchBarWrap) {
        searchBarWrap.style.display = "block";
    }

    if (categoryGrid) {
        categoryGrid.querySelectorAll(".category-card").forEach(c => {
            c.classList.remove("active-filter");
        });
    }

    // 3. Scroll back to top of category grid
    window.scrollTo({ top: 0, behavior: "smooth" });
}

if (backToCategoriesBtn) {
    backToCategoriesBtn.addEventListener("click", shiftBackToCategories);
}

if (resetCategoryFilterBtn) {
    resetCategoryFilterBtn.addEventListener("click", shiftBackToCategories);
}


// =====================================================
// VIEW ALL CATEGORIES OVERVIEW
// =====================================================

function viewAllCategoriesProducts() {
    selectedFilterCategory = null;

    const categoryGridSection = document.getElementById("categoryGridSection");
    if (categoryGridSection) {
        categoryGridSection.style.display = "none";
    }

    const searchBarWrap = document.querySelector(".category-search-bar-wrap");
    if (searchBarWrap) {
        searchBarWrap.style.display = "none";
    }

    const productsWrapper = document.getElementById("categoryProductsWrapper");
    if (productsWrapper) {
        productsWrapper.style.display = "block";
    }

    if (categoryFilterHeader) {
        categoryFilterHeader.style.display = "flex";
    }

    if (activeCategoryTitle) {
        activeCategoryTitle.textContent = "All Categories Overview";
    }

    const badge = document.getElementById("activeCategoryBadge");
    if (badge) {
        badge.textContent = `${allProducts.length} Products`;
    }

    displayCategories();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

if (viewAllProductsQuickBtn) {
    viewAllProductsQuickBtn.addEventListener("click", viewAllCategoriesProducts);
}


// =====================================================
// URL PARAMETER DETECTION (?category=...)
// =====================================================

function checkUrlCategoryParam() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const catParam = urlParams.get("category");
        if (catParam && catParam.trim() !== "") {
            shiftToCategory(catParam.trim());
        }
    } catch (e) {
        console.warn("Could not parse URL params", e);
    }
}


// =====================================================
// SEARCH CATEGORIES (Matching Screenshot)
// =====================================================

function filterCategoriesBySearch() {
    if (!categorySearch || !categoryGrid) {
        return;
    }

    const query = categorySearch.value.trim().toLowerCase();
    const cards = categoryGrid.querySelectorAll(".category-card");
    let matchCount = 0;

    cards.forEach(card => {
        const catName = (card.dataset.category || "").toLowerCase();
        const desc = (card.querySelector("p")?.textContent || "").toLowerCase();

        if (!query || catName.includes(query) || desc.includes(query)) {
            card.style.display = "flex";
            matchCount++;
        } else {
            card.style.display = "none";
        }
    });

    if (noCategoriesFound) {
        if (matchCount === 0 && query !== "") {
            noCategoriesFound.classList.remove("hidden");
        } else {
            noCategoriesFound.classList.add("hidden");
        }
    }
}

if (categorySearch) {
    categorySearch.addEventListener("input", filterCategoriesBySearch);
}

if (clearSearch) {
    clearSearch.addEventListener("click", () => {
        if (categorySearch) {
            categorySearch.value = "";
            categorySearch.focus();
            filterCategoriesBySearch();
        }
    });
}


// =====================================================
// DISPLAY CATEGORIES (Grouped by Canonical Category)
// =====================================================

function displayCategories() {
    categoriesContainer.innerHTML = "";

    if (!allProducts.length && !selectedFilterCategory) {
        categoriesContainer.innerHTML = `
            <div class="loading">
                No products found.
            </div>
        `;
        return;
    }

    // Group products by canonical category (e.g. "Shirt" -> "Shirts")
    const categories = {};

    // If a specific category was clicked, ensure its bucket exists
    if (selectedFilterCategory) {
        const canonicalTarget = getCanonicalCategory(selectedFilterCategory);
        categories[canonicalTarget] = [];
    }

    allProducts.forEach(product => {
        const canonical = getCanonicalCategory(product.category || "Other");
        if (!categories[canonical]) {
            categories[canonical] = [];
        }
        categories[canonical].push(product);
    });

    // If filtering to a specific category
    if (selectedFilterCategory) {
        const targetCanonical = getCanonicalCategory(selectedFilterCategory);
        const prods = categories[targetCanonical] || [];
        const section = createCategorySection(targetCanonical, prods);
        categoriesContainer.appendChild(section);
        calibrateAdminCardSwatchColors();
        return;
    }

    // Otherwise show all categories that have products
    let keys = Object.keys(categories).sort();

    if (keys.length === 0) {
        categoriesContainer.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon"><i class="fa-solid fa-box-open"></i></div>
                <h3>No products found</h3>
                <p>No products are currently available.</p>
                <button type="button" class="reset-filter-btn" style="margin-top: 16px;" onclick="shiftBackToCategories()">
                    <i class="fa-solid fa-arrow-left"></i> Back to Categories
                </button>
            </div>
        `;
        return;
    }

    // Display category sections matching screenshot
    keys.forEach(category => {
        const section = createCategorySection(category, categories[category]);
        categoriesContainer.appendChild(section);
    });
    calibrateAdminCardSwatchColors();
}


// =====================================================
// CREATE CATEGORY SECTION (Matches Collection Overview)
// =====================================================

function createCategorySection(category, products) {
    const section = document.createElement("section");
    section.className = "category-section";

    const icon = getCategoryIcon(category);
    const hasProducts = products && products.length > 0;

    section.innerHTML = `
        <div class="category-header">
            <div class="category-title-group">
                <div class="category-icon-box">
                    <i class="fa-solid ${icon}"></i>
                </div>
                <div>
                    <h2>${escapeHtml(category)}</h2>
                    <span class="category-subtitle">Collection Overview</span>
                </div>
            </div>

            <span class="product-count">
                <i class="fa-solid fa-box-archive"></i>
                ${products.length} ${products.length === 1 ? "Product" : "Products"}
            </span>
        </div>

        ${hasProducts ? `
            <div class="products-grid">
                ${products.map(product => createProductCard(product)).join("")}
            </div>
        ` : `
            <div class="empty-category-box">
                <div class="empty-category-icon">
                    <i class="fa-solid fa-box-open"></i>
                </div>
                <h3>No products in "${escapeHtml(category)}" yet</h3>
                <p>Products added with category "${escapeHtml(category)}" will appear here.</p>
                <div class="empty-category-actions">
                    <a href="/admin/products.html" class="add-product-quick-btn">
                        <i class="fa-solid fa-plus"></i> Add Product
                    </a>
                    <button type="button" class="back-to-cat-quick-btn" onclick="shiftBackToCategories()">
                        <i class="fa-solid fa-arrow-left"></i> Back to Categories
                    </button>
                </div>
            </div>
        `}
    `;

    return section;
}


// =====================================================
// CREATE PRODUCT CARD
// =====================================================

// =====================================================
// IMAGE NORMALIZATION & COLOR PALETTE HELPERS
// =====================================================

function normalizeCategoryCardImage(raw) {
    if (!raw) return "";
    let val = String(raw).trim();
    if (!val || val === "null" || val === "undefined") return "";

    if (val.startsWith("[") && val.endsWith("]")) {
        try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return normalizeCategoryCardImage(parsed[0]);
            }
        } catch (e) {}
    }

    if (val.startsWith("http://") || val.startsWith("https://") || val.startsWith("data:")) {
        return val;
    }
    if (val.startsWith("/")) {
        return val;
    }
    if (val.startsWith("images/")) {
        return `/${val}`;
    }
    return `/images/${val}`;
}

function getColorHex(colorName) {
    if (!colorName) return "#64748B";
    const c = String(colorName).trim().toLowerCase();
    if (c.startsWith("#")) return c;

    if (c.includes("light blue") || c.includes("sky blue") || c.includes("powder blue") || c.includes("baby blue")) return "#38BDF8";
    if (c.includes("dark blue")) return "#1E3A8A";
    if (c.includes("royal blue")) return "#1D4ED8";
    if (c.includes("dark teal")) return "#115E59";
    if (c.includes("peacock")) return "#0E7490";
    if (c.includes("navy")) return "#1E293B";
    if (c.includes("teal") || c.includes("cyan")) return "#0D9488";
    if (c.includes("blue")) return "#2563EB";
    if (c.includes("black") || c.includes("dark")) return "#0F172A";
    if (c.includes("charcoal")) return "#374151";
    if (c.includes("red") || c.includes("maroon") || c.includes("crimson")) return "#DC2626";
    if (c.includes("orange") || c.includes("rust") || c.includes("coral")) return "#EA580C";
    if (c.includes("yellow") || c.includes("gold") || c.includes("mustard")) return "#EAB308";
    if (c.includes("white") || c.includes("cream")) return "#FFFFFF";
    if (c.includes("olive") || c.includes("military")) return "#65A30D";
    if (c.includes("sage") || c.includes("mint")) return "#8DA496";
    if (c.includes("light green")) return "#86EFAC";
    if (c.includes("green")) return "#16A34A";
    if (c.includes("grey") || c.includes("gray")) return "#64748B";
    if (c.includes("brown") || c.includes("tan") || c.includes("khaki") || c.includes("beige")) return "#92400E";
    if (c.includes("pink") || c.includes("rose")) return "#F43F5E";
    if (c.includes("purple") || c.includes("violet")) return "#9333EA";

    return "#64748B";
}

const adminCardImageColorCache = {};

function extractDominantColorFromImage(imageUrl, callback) {
    if (!imageUrl || typeof callback !== "function") return;
    const url = normalizeCategoryCardImage(imageUrl);
    if (!url) return;
    if (adminCardImageColorCache[url]) {
        callback(adminCardImageColorCache[url]);
        return;
    }

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = function () {
        try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            const w = 60;
            const h = 75;
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(img, 0, 0, w, h);

            const imgData = ctx.getImageData(0, 0, w, h).data;
            const x1 = Math.floor(w * 0.28);
            const x2 = Math.floor(w * 0.72);
            const y1 = Math.floor(h * 0.35);
            const y2 = Math.floor(h * 0.72);

            let totalR = 0, totalG = 0, totalB = 0, count = 0;

            for (let y = y1; y < y2; y++) {
                for (let x = x1; x < x2; x++) {
                    const idx = (y * w + x) * 4;
                    const r = imgData[idx];
                    const g = imgData[idx + 1];
                    const b = imgData[idx + 2];
                    const a = imgData[idx + 3];

                    if (a < 128) continue;

                    const max = Math.max(r, g, b);
                    const min = Math.min(r, g, b);
                    const delta = max - min;

                    if (r > 240 && g > 240 && b > 240 && delta < 15) continue;
                    if (r < 15 && g < 15 && b < 15) continue;

                    const isSkin = r > g && g > b && (r - g >= 14) && (r - g <= 65) && (r - b >= 28) && (r - b <= 88) && max > 100;
                    if (isSkin) continue;

                    totalR += r;
                    totalG += g;
                    totalB += b;
                    count++;
                }
            }

            if (count > 8) {
                const avgR = Math.round(totalR / count);
                const avgG = Math.round(totalG / count);
                const avgB = Math.round(totalB / count);
                const hex = "#" + [avgR, avgG, avgB].map(function (v) { return v.toString(16).padStart(2, "0"); }).join("");
                adminCardImageColorCache[url] = hex;
                callback(hex);
            }
        } catch (e) {}
    };
    img.src = url;
}

function calibrateAdminCardSwatchColors() {
    setTimeout(function () {
        const swatches = document.querySelectorAll(".admin-card-swatch");
        swatches.forEach(function (btn) {
            const imgUrl = btn.dataset.image;
            if (imgUrl) {
                extractDominantColorFromImage(imgUrl, function (exactHex) {
                    if (exactHex) {
                        btn.style.backgroundColor = exactHex;
                        if (exactHex.toUpperCase() === "#FFFFFF") {
                            btn.classList.add("white-swatch");
                        }
                    }
                });
            }
        });
    }, 50);
}

function getProductSwatches(product) {
    const swatches = [];
    const seenColors = new Set();

    if (Array.isArray(product?.variants) && product.variants.length > 0) {
        product.variants.forEach(function (v) {
            if (v && v.color) {
                const colName = String(v.color).trim();
                const key = colName.toLowerCase();
                if (!seenColors.has(key)) {
                    seenColors.add(key);
                    const hex = getColorHex(key);
                    const img = (v.image && v.image !== "null" && String(v.image).trim() !== "")
                        ? normalizeCategoryCardImage(v.image)
                        : "";
                    swatches.push({
                        name: colName,
                        hex: hex,
                        image: img,
                        isWhite: hex.toUpperCase() === "#FFFFFF"
                    });
                }
            }
        });
    }

    if (swatches.length === 0 && product?.image) {
        let imgs = [];
        if (typeof product.image === "string") {
            const trimmed = product.image.trim();
            if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
                try {
                    const parsed = JSON.parse(trimmed);
                    if (Array.isArray(parsed)) imgs = parsed;
                } catch (e) {}
            }
        } else if (Array.isArray(product.image)) {
            imgs = product.image;
        }

        if (imgs.length > 1) {
            imgs.forEach(function (img, idx) {
                const norm = normalizeCategoryCardImage(img);
                if (norm) {
                    swatches.push({
                        name: `Photo ${idx + 1}`,
                        hex: "#64748B",
                        image: norm,
                        isWhite: false
                    });
                }
            });
        }
    }

    return swatches;
}

// =====================================================
// GET PRODUCT IMAGE
// =====================================================

function getProductImage(product) {
    if (!product) {
        return "/images/tshirt1.jpg";
    }

    const category =
        String(product?.category || "")
            .trim()
            .toLowerCase();

    const categoryDefaults = {
        "t-shirt": "/images/tshirt1.jpg",
        "tshirt": "/images/tshirt1.jpg",
        "tee": "/images/tshirt1.jpg",
        shirt: "/images/shirt2.jpg",
        shirts: "/images/shirt2.jpg",
        jeans: "/images/jeans3.jpg",
        pants: "/images/pants cargo.jpg",
        jackets: "/images/jacket1.jpg",
        jacket: "/images/jacket1.jpg",
        hoodie: "/images/jacket5.jpg",
        hoodies: "/images/jacket5.jpg",
        shorts: "/images/pants cargo.jpg",
        shoes: "/images/jacket2.jpg",
        accessories: "/images/jacket3.jpg"
    };

    const defaultFallback = categoryDefaults[category] || "/images/tshirt1.jpg";

    // 1. If an ordered image exists (e.g. from recent order)
    if (product.last_ordered_image) {
        const norm = normalizeCategoryCardImage(product.last_ordered_image);
        if (norm) return norm;
    }

    // 2. If ordered color variant exists with photo
    if (product.last_ordered_color && Array.isArray(product.variants) && product.variants.length > 0) {
        const ordVar = product.variants.find(function (v) {
            return v && v.color && String(v.color).trim().toLowerCase() === String(product.last_ordered_color).trim().toLowerCase() && v.image && v.image !== "null";
        });
        if (ordVar && ordVar.image) {
            const norm = normalizeCategoryCardImage(ordVar.image);
            if (norm) return norm;
        }
    }

    // 3. From product.image
    if (product.image) {
        let rawImage = product.image;
        if (Array.isArray(rawImage) && rawImage.length > 0) {
            const norm = normalizeCategoryCardImage(rawImage[0]);
            if (norm) return norm;
        } else if (typeof rawImage === "string") {
            const trimmed = rawImage.trim();
            if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
                try {
                    const parsed = JSON.parse(trimmed);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        for (const item of parsed) {
                            const norm = normalizeCategoryCardImage(item);
                            if (norm) return norm;
                        }
                    }
                } catch (e) {}
            } else if (trimmed) {
                const norm = normalizeCategoryCardImage(trimmed);
                if (norm) return norm;
            }
        }
    }

    // 4. From any variant image
    if (Array.isArray(product.variants) && product.variants.length > 0) {
        for (const v of product.variants) {
            if (v && v.image && v.image !== "null" && String(v.image).trim() !== "") {
                const norm = normalizeCategoryCardImage(v.image);
                if (norm) return norm;
            }
        }
    }

    return defaultFallback;
}

// =====================================================
// SWITCH ADMIN CATEGORY CARD COLOR / PHOTO
// =====================================================

function switchAdminCategoryCardColor(event, btnEl, productId, newImageSrc, colorName) {
    if (event) {
        event.stopPropagation();
    }
    if (!newImageSrc || newImageSrc === "null" || newImageSrc === "undefined") {
        return;
    }
    const imgEl = document.getElementById(`admin-cat-img-${productId}`);
    if (imgEl) {
        const normalized = normalizeCategoryCardImage(newImageSrc);
        if (normalized) {
            imgEl.src = normalized;
        }
    }
    if (btnEl && btnEl.parentElement) {
        const swatches = btnEl.parentElement.querySelectorAll(".admin-card-swatch");
        swatches.forEach(function (s) {
            s.classList.remove("active");
        });
        btnEl.classList.add("active");
    }
}
window.switchAdminCategoryCardColor = switchAdminCategoryCardColor;

// =====================================================
// CREATE PRODUCT CARD
// =====================================================

function createProductCard(product) {

    const swatches = getProductSwatches(product);

    let activeIdx = 0;
    if (product.last_ordered_color && swatches.length > 0) {
        const ordIdx = swatches.findIndex(function (s) {
            return s.name.toLowerCase() === String(product.last_ordered_color).trim().toLowerCase();
        });
        if (ordIdx >= 0) {
            activeIdx = ordIdx;
        }
    }

    let initialImage = (swatches.length > 0 && swatches[activeIdx].image)
        ? swatches[activeIdx].image
        : getProductImage(product);

    const price =
        Number(
            product.display_price ??
            product.price ?? 0
        )
            .toFixed(2);

    const stock = Number(product.stock ?? 0);
    const isOutOfStock = stock <= 0;

    return `

        <article
            class="product-card"
            data-product-id="${product.id}"
        >

            <div class="product-image-wrap">
                <img
                    id="admin-cat-img-${product.id}"
                    class="product-image"
                    src="${initialImage}"
                    alt="${escapeHtml(product.name)}"
                    onerror="this.onerror=null; this.src='/images/tshirt1.jpg'"
                >
                ${product.last_ordered_color ? `
                    <div class="admin-ordered-badge" title="Recently ordered color: ${escapeHtml(product.last_ordered_color)}">
                        <i class="fa-solid fa-cart-shopping"></i> Ordered: <strong>${escapeHtml(product.last_ordered_color)}</strong>
                    </div>
                ` : ''}
            </div>

            <div class="product-info">

                <div class="product-name">
                    ${escapeHtml(product.name)}
                </div>

                <div class="product-description">
                    ${escapeHtml(
                        product.description ||
                        "No description available."
                    )}
                </div>

                ${swatches.length > 0 ? `
                    <div class="admin-card-swatches-row" onclick="event.stopPropagation();">
                        <span class="admin-swatches-label"><i class="fa-solid fa-palette"></i> Colors:</span>
                        <div class="admin-card-swatches">
                            ${swatches.map(function (s, idx) {
                                return `
                                    <button
                                        type="button"
                                        class="admin-card-swatch ${s.isWhite ? 'white-swatch' : ''} ${idx === activeIdx ? 'active' : ''}"
                                        style="background-color: ${s.hex};"
                                        data-color="${escapeHtml(s.name)}"
                                        data-image="${escapeHtml(s.image)}"
                                        title="${escapeHtml(s.name)}"
                                        aria-label="${escapeHtml(s.name)}"
                                        onclick="switchAdminCategoryCardColor(event, this, ${product.id}, '${escapeHtml(s.image)}', '${escapeHtml(s.name)}')"
                                        onmouseenter="switchAdminCategoryCardColor(event, this, ${product.id}, '${escapeHtml(s.image)}', '${escapeHtml(s.name)}')"
                                    >
                                        <i class="fa-solid fa-check"></i>
                                    </button>
                                `;
                            }).join("")}
                        </div>
                    </div>
                ` : ''}

                <div class="product-price-stock-row">
                    <div class="product-price">
                        ₹${price}
                    </div>

                    <div class="product-stock ${isOutOfStock ? 'out-of-stock' : ''}">
                        <i class="fa-solid ${isOutOfStock ? 'fa-circle-xmark' : 'fa-circle-check'}"></i>
                        ${isOutOfStock ? 'Out of stock' : `Stock: ${stock}`}
                    </div>
                </div>

                <div class="product-actions">

                    <button
                        class="edit-price-btn"
                        onclick="increasePrice(${product.id})"
                        title="Increase price by ₹1"
                    >
                        <i class="fa-solid fa-plus"></i> Price
                    </button>

                    <button
                        class="edit-price-btn"
                        onclick="decreasePrice(${product.id})"
                        title="Decrease price by ₹1"
                    >
                        <i class="fa-solid fa-minus"></i> Price
                    </button>

                    <button
                        class="edit-description-btn"
                        onclick="openProductEdit(${product.id})"
                        title="Edit product in new window"
                    >
                        <i class="fa-solid fa-pen-to-square"></i> Edit
                    </button>

                    <button
                        class="delete-product-btn"
                        onclick="deleteProduct(${product.id})"
                        title="Delete product"
                    >
                        <i class="fa-solid fa-trash-can"></i> Delete
                    </button>

                </div>

            </div>

        </article>

    `;

}


// =====================================================
// CHANGE PRICE
// =====================================================

async function changePrice(productId) {

    const product =
        allProducts.find(
            item => Number(item.id) === Number(productId)
        );


    if (!product) {

        alert("Product not found.");

        return;

    }


    const currentPrice =
        product.price || "";


    const newPrice =
        prompt(
            `Enter new price for "${product.name}":`,
            currentPrice
        );


    if (
        newPrice === null ||
        newPrice.trim() === ""
    ) {

        return;

    }


    const price =
        Number(newPrice);


    if (
        Number.isNaN(price) ||
        price < 0
    ) {

        alert("Please enter a valid price.");

        return;

    }


    try {

        const response =
            await fetch(
                `/api/products/${productId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        price: price
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to update price."
            );

        }


        alert("Product price updated successfully.");


        await loadProducts();


    } catch (error) {

        console.error(
            "Update Price Error:",
            error
        );


        alert(
            error.message ||
            "Failed to update product price."
        );

    }

}


// =====================================================
// OPEN PRODUCT EDIT / DETAILS
// =====================================================

function openProductEdit(productId) {
    if (!productId) return;
    window.open(`/product-details.html?id=${encodeURIComponent(productId)}`, "_blank");
}


// =====================================================
// CHANGE DESCRIPTION
// =====================================================

async function changeDescription(productId) {

    const product =
        allProducts.find(
            item => Number(item.id) === Number(productId)
        );


    if (!product) {

        alert("Product not found.");

        return;

    }


    const newDescription =
        prompt(
            `Enter new description for "${product.name}":`,
            product.description || ""
        );


    if (newDescription === null) {

        return;

    }


    if (
        newDescription.trim() === ""
    ) {

        alert("Description cannot be empty.");

        return;

    }


    try {

        const response =
            await fetch(
                `/api/products/${productId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        name: product.name,
                        description:
                            newDescription.trim(),
                        price: product.price ?? 0,
                        category: product.category || "",
                        stock: product.stock ?? 0
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to update description."
            );

        }


        alert(
            "Product description updated successfully."
        );


        await loadProducts();


    } catch (error) {

        console.error(
            "Update Description Error:",
            error
        );


        alert(
            error.message ||
            "Failed to update description."
        );

    }

}


// =====================================================
// DELETE PRODUCT
// =====================================================

async function deleteProduct(productId) {

    const product =
        allProducts.find(
            item => Number(item.id) === Number(productId)
        );


    if (!product) {

        alert("Product not found.");

        return;

    }


    const confirmed =
        confirm(
            `Are you sure you want to delete "${product.name}"?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/products/${productId}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to delete product."
            );

        }


        alert(
            "Product deleted successfully."
        );


        await loadProducts();


    } catch (error) {

        console.error(
            "Delete Product Error:",
            error
        );


        alert(
            error.message ||
            "Failed to delete product."
        );

    }

}


// =====================================================
// PRICE ADJUSTMENT
// =====================================================

async function increasePrice(productId) {

    await updateProductPrice(
        productId,
        1
    );

}


async function decreasePrice(productId) {

    await updateProductPrice(
        productId,
        -1
    );

}


async function updateProductPrice(productId, amount) {

    const product =
        allProducts.find(
            item => Number(item.id) === Number(productId)
        );


    if (!product) {

        alert("Product not found.");

        return;

    }


    const currentPrice =
        Number(product.price || 0);


    const updatedPrice =
        Math.max(0, currentPrice + amount);


    try {

        const response =
            await fetch(
                `/api/products/${productId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        name: product.name,
                        description: product.description || "",
                        category: product.category || "",
                        stock: product.stock ?? 0,
                        price: updatedPrice
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to update product price."
            );

        }


        alert(
            `Product price updated successfully.`
        );


        await loadProducts();

    } catch (error) {

        console.error(
            "Price Adjustment Error:",
            error
        );


        alert(
            error.message ||
            "Failed to update product price."
        );

    }

}


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =====================================================
// START
// =====================================================

loadProducts();