
// ============================================================
// SQUAD FASHION - PRODUCTS JAVASCRIPT
// ============================================================

console.log("Products JavaScript Loaded");


// ============================================================
// GLOBAL PRODUCT DATA
// ============================================================

let allProducts = [];


// ============================================================
// DOM ELEMENTS
// ============================================================

const productContainer =
    document.getElementById("productContainer");

const searchInput =
    document.getElementById("searchInput");

const searchBtn =
    document.getElementById("searchBtn");

const categoryFilter =
    document.getElementById("categoryFilter");

const priceFilter =
    document.getElementById("priceFilter");

const sizeFilter =
    document.getElementById("sizeFilter");

const brandFilter =
    document.getElementById("brandFilter");

const sortFilter =
    document.getElementById("sortFilter");

const resetFilters =
    document.getElementById("resetFilters");

const resultCount =
    document.getElementById("resultCount");

const noProducts =
    document.getElementById("noProducts");

const cartCount =
    document.getElementById("cart-count");


// ============================================================

// ============================================================
// AMAZON-STYLE FILTER SIDEBAR STATE & LOGIC
// ============================================================

window.sidebarState = {
    category: 'all',
    subCategory: null,
    brands: [],
    priceRange: null, // e.g. '0-300', '300-500', '500-1000', '1000-1500', '1500+', or { min, max }
    ratingMin: null, // e.g. 4, 3, 2, 1
    deal: null, // 'festival', 'todays'
    includeOutOfStock: false,
    customizable: false,
    lifestyles: [],
    sellers: [],
    fashions: [],
    cares: [],
    discountMin: null, // e.g. 10, 25, 35, 50, 60, 70
    cuffs: [],
    arrivalDays: null, // 30, 90
    pockets: [],
    sleeves: [],
    colors: [],
    podOnly: false,
    closures: [],
    occasions: []
};

// 1. DYNAMIC CATEGORY TREE CONFIG
const CATEGORY_TREE_CONFIG = {
    'all': {
        parentDept: 'Clothing & Accessories',
        subDept: 'Men',
        groupTitle: 'All Categories',
        items: [
            { id: 't-shirts', name: 'T-Shirts' },
            { id: 'shirts', name: 'Shirts' },
            { id: 'jeans', name: 'Jeans' },
            { id: 'pants', name: 'Pants' },
            { id: 'jackets', name: 'Jackets' },
            { id: 'hoodies', name: 'Hoodies' },
            { id: 'shorts', name: 'Shorts' },
            { id: 'shoes', name: 'Shoes' },
            { id: 'accessories', name: 'Accessories' }
        ]
    },
    't-shirts': {
        parentDept: 'Clothing & Accessories',
        subDept: 'Men',
        groupTitle: 'T-shirts, Polos & Shirts',
        items: [
            { id: 't-shirts', name: 'T-Shirts' },
            { id: 'shirts', name: 'Shirts' },
            { id: 'polos', name: 'Polos' },
            { id: 'tank-tops', name: 'Tank Tops' }
        ]
    },
    'shirts': {
        parentDept: 'Clothing & Accessories',
        subDept: 'Men',
        groupTitle: 'Shirts',
        items: [
            { id: 'casual-shirts', name: 'Casual Shirts' },
            { id: 'formal-shirts', name: 'Formal Shirts' },
            { id: 'linen-shirts', name: 'Linen Shirts' },
            { id: 'denim-shirts', name: 'Denim Shirts' }
        ]
    },
    'jeans': {
        parentDept: 'Clothing & Accessories',
        subDept: 'Men',
        groupTitle: 'Jeans',
        items: [
            { id: 'slim-fit-jeans', name: 'Slim Fit Jeans' },
            { id: 'skinny-jeans', name: 'Skinny Jeans' },
            { id: 'regular-jeans', name: 'Regular Fit Jeans' },
            { id: 'tapered-jeans', name: 'Tapered Jeans' }
        ]
    },
    'pants': {
        parentDept: 'Clothing & Accessories',
        subDept: 'Men',
        groupTitle: 'Pants & Trousers',
        items: [
            { id: 'cargo-pants', name: 'Cargo Pants' },
            { id: 'chino-pants', name: 'Chino Pants' },
            { id: 'formal-pants', name: 'Formal Trousers' },
            { id: 'joggers', name: 'Joggers' }
        ]
    },
    'jackets': {
        parentDept: 'Clothing & Accessories',
        subDept: 'Men',
        groupTitle: 'Jackets & Coats',
        items: [
            { id: 'bomber-jackets', name: 'Bomber Jackets' },
            { id: 'denim-jackets', name: 'Denim Jackets' },
            { id: 'leather-jackets', name: 'Leather Jackets' },
            { id: 'windcheaters', name: 'Windcheaters' }
        ]
    },
    'hoodies': {
        parentDept: 'Clothing & Accessories',
        subDept: 'Men',
        groupTitle: 'Hoodies & Sweatshirts',
        items: [
            { id: 'pullover-hoodies', name: 'Pullover Hoodies' },
            { id: 'zip-hoodies', name: 'Zip-Up Hoodies' },
            { id: 'sweatshirts', name: 'Sweatshirts' }
        ]
    },
    'shorts': {
        parentDept: 'Clothing & Accessories',
        subDept: 'Men',
        groupTitle: 'Shorts',
        items: [
            { id: 'denim-shorts', name: 'Denim Shorts' },
            { id: 'cargo-shorts', name: 'Cargo Shorts' },
            { id: 'athletic-shorts', name: 'Athletic Shorts' }
        ]
    },
    'shoes': {
        parentDept: 'Footwear',
        subDept: 'Men',
        groupTitle: 'Shoes',
        items: [
            { id: 'sneakers', name: 'Sneakers' },
            { id: 'casual-shoes', name: 'Casual Shoes' },
            { id: 'formal-shoes', name: 'Formal Shoes' }
        ]
    },
    'accessories': {
        parentDept: 'Accessories',
        subDept: 'Men',
        groupTitle: 'Accessories',
        items: [
            { id: 'belts', name: 'Belts' },
            { id: 'wallets', name: 'Wallets' },
            { id: 'caps', name: 'Caps & Hats' }
        ]
    }
};

function renderSidebarCategoryTree(activeCat) {
    const container = document.getElementById('sidebarCategoryNav');
    if (!container) return;

    const normCat = String(activeCat || 'all').toLowerCase().trim();
    let config = CATEGORY_TREE_CONFIG[normCat];
    if (!config) {
        // Fallback or generic match
        for (const k in CATEGORY_TREE_CONFIG) {
            if (normCat.includes(k) || k.includes(normCat)) {
                config = CATEGORY_TREE_CONFIG[k];
                break;
            }
        }
    }
    if (!config) config = CATEGORY_TREE_CONFIG['all'];

    container.innerHTML = `
        <a href="javascript:void(0)" class="cat-parent-link" onclick="setSidebarCategory('all')">
            <span class="cat-parent-arrow">‹</span> ${escapeHTML(config.parentDept)}
        </a>
        <a href="javascript:void(0)" class="cat-parent-link" onclick="setSidebarCategory('all')">
            <span class="cat-parent-arrow">‹</span> ${escapeHTML(config.subDept)}
        </a>
        <div class="cat-active-group">${escapeHTML(config.groupTitle)}</div>
        <ul class="cat-sub-list">
            ${config.items.map(function (it) {
                const isSelected = normCat === it.id || (normCat === 'all' && false);
                return `
                    <li class="cat-sub-item ${isSelected ? 'active' : ''}">
                        <a href="javascript:void(0)" onclick="setSidebarCategory('${it.id}')">${escapeHTML(it.name)}</a>
                    </li>
                `;
            }).join('')}
        </ul>
    `;
}

// Category selection
function setSidebarCategory(catId) {
    window.sidebarState.category = catId || 'all';
    const catSelect = document.getElementById('categoryFilter');
    if (catSelect) {
        catSelect.value = catId || 'all';
    }
    renderSidebarCategoryTree(catId);
    filterProducts();
}

// Price selection
function setSidebarPrice(rangeStr, element) {
    const isAlreadyActive = window.sidebarState.priceRange === rangeStr;
    document.querySelectorAll('.price-link').forEach(el => el.classList.remove('active'));
    if (isAlreadyActive) {
        window.sidebarState.priceRange = null;
    } else {
        window.sidebarState.priceRange = rangeStr;
        if (element) element.classList.add('active');
    }
    filterProducts();
}

function applyCustomPriceFilter() {
    const minVal = parseFloat(document.getElementById('customPriceMin')?.value) || 0;
    const maxVal = parseFloat(document.getElementById('customPriceMax')?.value) || 999999;
    document.querySelectorAll('.price-link').forEach(el => el.classList.remove('active'));
    window.sidebarState.priceRange = { min: minVal, max: maxVal };
    filterProducts();
}

// Rating selection
function setSidebarRating(stars, element) {
    const isAlreadyActive = window.sidebarState.ratingMin === stars;
    document.querySelectorAll('.rating-link').forEach(el => el.classList.remove('active'));
    if (isAlreadyActive) {
        window.sidebarState.ratingMin = null;
    } else {
        window.sidebarState.ratingMin = stars;
        if (element) element.classList.add('active');
    }
    filterProducts();
}

// Deals selection
function toggleDealsFilter(dealType, element) {
    const isAlreadyActive = window.sidebarState.deal === dealType;
    document.querySelectorAll('.deals-link').forEach(el => el.classList.remove('active'));
    if (isAlreadyActive) {
        window.sidebarState.deal = null;
    } else {
        window.sidebarState.deal = dealType;
        if (element) element.classList.add('active');
    }
    filterProducts();
}

// Discount selection
function setSidebarDiscount(percent, element) {
    const isAlreadyActive = window.sidebarState.discountMin === percent;
    document.querySelectorAll('.discount-link').forEach(el => el.classList.remove('active'));
    if (isAlreadyActive) {
        window.sidebarState.discountMin = null;
    } else {
        window.sidebarState.discountMin = percent;
        if (element) element.classList.add('active');
    }
    filterProducts();
}

// Arrivals selection
function setSidebarArrivals(days, element) {
    const isAlreadyActive = window.sidebarState.arrivalDays === days;
    document.querySelectorAll('.arrivals-link').forEach(el => el.classList.remove('active'));
    if (isAlreadyActive) {
        window.sidebarState.arrivalDays = null;
    } else {
        window.sidebarState.arrivalDays = days;
        if (element) element.classList.add('active');
    }
    filterProducts();
}

// Color Swatch toggle
function toggleSidebarColor(colorName, btn) {
    const c = String(colorName).toLowerCase();
    const idx = window.sidebarState.colors.indexOf(c);
    if (idx > -1) {
        window.sidebarState.colors.splice(idx, 1);
        if (btn) btn.classList.remove('active');
    } else {
        window.sidebarState.colors.push(c);
        if (btn) btn.classList.add('active');
    }
    filterProducts();
}

// Read checked checkbox array
function getCheckedValues(selector) {
    return Array.from(document.querySelectorAll(selector + ':checked')).map(el => el.value);
}

// Apply all sidebar checkbox filters
function applySidebarFilters() {
    
    window.sidebarState.includeOutOfStock = !!document.getElementById('includeOutOfStock')?.checked;
    window.sidebarState.customizable = !!document.getElementById('customizableProductFilter')?.checked;
    window.sidebarState.podOnly = !!document.getElementById('podFilter')?.checked;

    window.sidebarState.brands = getCheckedValues('.amazon-brand-checkbox');
    window.sidebarState.lifestyles = getCheckedValues('.amazon-lifestyle-checkbox');
    window.sidebarState.sellers = getCheckedValues('.amazon-seller-checkbox');
    window.sidebarState.fashions = getCheckedValues('.amazon-fashion-checkbox');
    window.sidebarState.cares = getCheckedValues('.amazon-care-checkbox');
    window.sidebarState.cuffs = getCheckedValues('.amazon-cuff-checkbox');
    window.sidebarState.pockets = getCheckedValues('.amazon-pocket-checkbox');
    window.sidebarState.sleeves = getCheckedValues('.amazon-sleeve-checkbox');
    window.sidebarState.closures = getCheckedValues('.amazon-closure-checkbox');
    window.sidebarState.occasions = getCheckedValues('.amazon-occasion-checkbox');

    filterProducts();
}

// Clear all filters
function clearAllSidebarFilters() {
    window.sidebarState = {
        category: 'all',
        subCategory: null,
        brands: [],
        priceRange: null,
        ratingMin: null,
        deal: null,
        includeOutOfStock: false,
        customizable: false,
        lifestyles: [],
        sellers: [],
        fashions: [],
        cares: [],
        discountMin: null,
        cuffs: [],
        arrivalDays: null,
        pockets: [],
        sleeves: [],
        colors: [],
        podOnly: false,
        closures: [],
        occasions: []
    };

    // Uncheck all checkboxes
    document.querySelectorAll('.amazon-filter-sidebar input[type="checkbox"]').forEach(cb => cb.checked = false);
    // Remove active from links and swatches
    document.querySelectorAll('.amazon-filter-link, .amazon-color-swatch-btn').forEach(el => el.classList.remove('active'));
    // Reset custom inputs
    const minEl = document.getElementById('customPriceMin');
    const maxEl = document.getElementById('customPriceMax');
    if (minEl) minEl.value = '';
    if (maxEl) maxEl.value = '';
    const searchEl = document.getElementById('searchInput');
    if (searchEl) searchEl.value = '';

    const catSelect = document.getElementById('categoryFilter');
    if (catSelect) catSelect.value = 'all';

    renderSidebarCategoryTree('all');
    filterProducts();
}

// Sync mobile sort select with main sort select
function syncSortFilter(val) {
    const mainSort = document.getElementById('sortFilter');
    if (mainSort) {
        mainSort.value = val;
        filterProducts();
    }
}

// Toggle mobile sidebar drawer
function toggleAmazonSidebar(open) {
    const sidebar = document.getElementById('amazonFilterSidebar');
    const backdrop = document.getElementById('amazonSidebarBackdrop');
    if (!sidebar || !backdrop) return;
    if (typeof open === 'boolean') {
        sidebar.classList.toggle('open', open);
        backdrop.classList.toggle('open', open);
    } else {
        sidebar.classList.toggle('open');
        backdrop.classList.toggle('open');
    }
}

// Update active chips bar
function renderActiveFilterChips() {
    const row = document.getElementById('activeFilterChipsRow');
    const badge = document.getElementById('activeFilterBadge');
    if (!row) return;

    const chips = [];
    const state = window.sidebarState;

    if (state.category && state.category !== 'all') {
        chips.push({ label: 'Category: ' + state.category, clear: () => setSidebarCategory('all') });
    }
    if (state.primeOnly) {
        chips.push({ label: 'Prime', clear: () => { document.getElementById('primeFilter').checked = false; applySidebarFilters(); } });
    }
    state.brands.forEach(b => {
        chips.push({ label: 'Brand: ' + b, clear: () => {
            const cb = Array.from(document.querySelectorAll('.amazon-brand-checkbox')).find(c => c.value === b);
            if (cb) cb.checked = false;
            applySidebarFilters();
        }});
    });
    if (state.priceRange) {
        let pLabel = 'Price';
        if (typeof state.priceRange === 'string') {
            if (state.priceRange === '0-300') pLabel = 'Under ₹300';
            else if (state.priceRange === '300-500') pLabel = '₹300 - ₹500';
            else if (state.priceRange === '500-1000') pLabel = '₹500 - ₹1,000';
            else if (state.priceRange === '1000-1500') pLabel = '₹1,000 - ₹1,500';
            else if (state.priceRange === '1500+') pLabel = 'Over ₹1,500';
        } else if (state.priceRange.min || state.priceRange.max) {
            pLabel = '₹' + state.priceRange.min + ' - ₹' + state.priceRange.max;
        }
        chips.push({ label: pLabel, clear: () => setSidebarPrice(null) });
    }
    if (state.ratingMin) {
        chips.push({ label: state.ratingMin + '★ & Up', clear: () => setSidebarRating(null) });
    }
    state.colors.forEach(c => {
        chips.push({ label: 'Colour: ' + c, clear: () => {
            const btn = Array.from(document.querySelectorAll('.amazon-color-swatch-btn')).find(b => b.dataset.color === c);
            toggleSidebarColor(c, btn);
        }});
    });
    if (state.discountMin) {
        chips.push({ label: state.discountMin + '% Off+', clear: () => setSidebarDiscount(null) });
    }
    if (state.podOnly) {
        chips.push({ label: 'Pay On Delivery', clear: () => { document.getElementById('podFilter').checked = false; applySidebarFilters(); } });
    }
    state.sleeves.forEach(s => chips.push({ label: s, clear: () => {
        const cb = Array.from(document.querySelectorAll('.amazon-sleeve-checkbox')).find(c => c.value === s);
        if (cb) cb.checked = false;
        applySidebarFilters();
    }}));

    if (badge) badge.textContent = chips.length;

    if (chips.length === 0) {
        row.style.display = 'none';
        row.innerHTML = '';
        return;
    }

    row.style.display = 'flex';
    row.innerHTML = chips.map((c, i) => `
        <span class="active-filter-chip">
            ${escapeHTML(c.label)}
            <button type="button" onclick="window._sidebarChipClear(${i})" aria-label="Remove filter">✕</button>
        </span>
    `).join('') + '<a href="javascript:void(0)" class="active-chips-clear-all" onclick="clearAllSidebarFilters()">Clear all</a>';

    window._sidebarChipClear = function (idx) {
        if (chips[idx] && chips[idx].clear) chips[idx].clear();
    };
}

window.setSidebarCategory = setSidebarCategory;
window.setSidebarPrice = setSidebarPrice;
window.applyCustomPriceFilter = applyCustomPriceFilter;
window.setSidebarRating = setSidebarRating;
window.toggleDealsFilter = toggleDealsFilter;
window.setSidebarDiscount = setSidebarDiscount;
window.setSidebarArrivals = setSidebarArrivals;
window.toggleSidebarColor = toggleSidebarColor;
window.applySidebarFilters = applySidebarFilters;
window.clearAllSidebarFilters = clearAllSidebarFilters;
window.syncSortFilter = syncSortFilter;
window.toggleAmazonSidebar = toggleAmazonSidebar;

// GET PRODUCT IMAGE
// ============================================================

function getProductImage(product) {

    const category =
        String(product?.category || "")
            .trim()
            .toLowerCase();


    const categoryDefaults = {
        "t-shirt": "tshirt1.jpg",
        "tshirt": "tshirt1.jpg",
        shirt: "shirt2.jpg",
        shirts: "shirt2.jpg",
        jeans: "jeans3.jpg",
        pants: "pants cargo.jpg",
        jackets: "jacket1.jpg",
        jacket: "jacket1.jpg",
        hoodie: "jacket5.jpg",
        hoodies: "jacket5.jpg",
        shorts: "/images/pants cargo.jpg",
        shoes: "/images/jacket2.jpg",
        accessories: "/images/jacket3.jpg"
    };


    const defaultImage = normalizeProductImagePath(categoryDefaults[category] || "shirt2.jpg");


    if (!product) {
        return defaultImage;
    }


    // --------------------------------------------------------
    // GET IMAGE FROM DATABASE
    // --------------------------------------------------------

    let image =
        product.image;


    // --------------------------------------------------------
    // IMAGE NOT AVAILABLE
    // --------------------------------------------------------

    if (
        !image ||
        String(image).trim() === ""
    ) {

        return defaultImage;

    }


    image =
        String(image).trim();

    if (image.startsWith("[") && image.endsWith("]")) {
        try {
            const parsed = JSON.parse(image);
            if (Array.isArray(parsed) && parsed.length > 0) {
                image = String(parsed[0] || "").trim();
            }
        } catch (e) {}
    }


    // --------------------------------------------------------
    // COMPLETE IMAGE URL
    // --------------------------------------------------------

    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {

        return image;

    }


    // --------------------------------------------------------
    // OLD DATABASE IMAGE NAMES
    // --------------------------------------------------------

    if (
        image.toLowerCase() === "tshirt.jpg" ||
        image.toLowerCase() === "/images/tshirt.jpg"
    ) {

        return "/images/tshirt1.jpg";

    }


    if (
        image.toLowerCase() === "shirt.jpg" ||
        image.toLowerCase() === "/images/shirt.jpg"
    ) {

        return "/images/shirt2.jpg";

    }


    if (
        image.toLowerCase() === "jeans.jpg" ||
        image.toLowerCase() === "/images/jeans.jpg"
    ) {

        return "/images/jeans3.jpg";

    }


    // --------------------------------------------------------
    // IMAGE ALREADY STARTS WITH /
    // --------------------------------------------------------

    if (
        image.startsWith("/")
    ) {

        return image;

    }


    // --------------------------------------------------------
    // IMAGE ALREADY CONTAINS images/
    // --------------------------------------------------------

    if (
        image.startsWith("images/")
    ) {

        return `/${image}`;

    }


    // --------------------------------------------------------
    // ONLY FILENAME
    // --------------------------------------------------------

    return `/images/${image}`;

}

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


// ============================================================
// COLOR MATCHING & PALETTES FOR PRODUCT CARDS
// ============================================================

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

const cardImageColorCache = {};

function extractDominantColorFromImage(imageUrl, callback) {
    if (!imageUrl || typeof callback !== "function") return;
    const url = normalizeProductImagePath(imageUrl);
    if (cardImageColorCache[url]) {
        callback(cardImageColorCache[url]);
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
                cardImageColorCache[url] = hex;
                callback(hex);
            }
        } catch (e) {}
    };
    img.src = url;
}

function getMatchingColorPhoto(category, color) {
    if (!color) return "/images/tshirt4.jpg";
    const cat = String(category || "").toLowerCase();
    const c = String(color || "").trim().toLowerCase();

    // 1. T-Shirts
    if (cat.includes("t-shirt") || cat.includes("tshirt") || cat.includes("tee")) {
        if (c.includes("black") || c.includes("dark") || c.includes("jet")) return "/images/tshirt4.jpg";
        if (c.includes("navy")) return "/images/tshirt1.jpg";
        if (c.includes("teal") || c.includes("cyan")) return "/images/tshirt10.jpg";
        if (c.includes("blue") || c.includes("sky")) return "/images/tshirt1.jpg";
        if (c.includes("red") || c.includes("maroon") || c.includes("crimson")) return "/images/tshirt7.jpg";
        if (c.includes("white") || c.includes("cream")) return "/images/tshirt9.jpg";
        if (c.includes("green") || c.includes("olive") || c.includes("military")) return "/images/tshirt2.jpg";
        if (c.includes("grey") || c.includes("gray")) return "/images/tshirt3.jpg";
        return "/images/tshirt4.jpg";
    }

    // 2. Outerwear / Jackets / Hoodies
    if (cat.includes("jacket") || cat.includes("coat") || cat.includes("outerwear") || cat.includes("hoodie")) {
        if (c.includes("navy")) return "/images/jacket2.jpg";
        if (c.includes("blue") || c.includes("sky")) return "/images/jacket2.jpg";
        if (c.includes("black") || c.includes("dark") || c.includes("jet")) return "/images/jacket3.jpg";
        if (c.includes("red") || c.includes("maroon") || c.includes("burgundy") || c.includes("wine")) return "/images/jacket6.jpg";
        if (c.includes("white") || c.includes("cream")) return "/images/jacket4.jpg";
        if (c.includes("green") || c.includes("olive") || c.includes("military")) return "/images/jacket1.jpg";
        if (c.includes("brown") || c.includes("tan") || c.includes("cognac")) return "/images/shirt2.jpg";
        return "/images/jacket3.jpg";
    }

    // 3. Jeans & Pants
    if (cat.includes("jean") || cat.includes("pant") || cat.includes("bottom") || cat.includes("short")) {
        if (c.includes("blue") || c.includes("indigo") || c.includes("denim")) return "/images/jeans3.jpg";
        if (c.includes("black") || c.includes("dark")) return "/images/jacket3.jpg";
        if (c.includes("white")) return "/images/jacket4.jpg";
        if (c.includes("red")) return "/images/jacket6.jpg";
        return "/images/jeans3.jpg";
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
    if (c.includes("teal") || c.includes("cyan")) return "/images/tshirt10.jpg";
    if (c.includes("blue")) return "/images/tshirt1.jpg";
    if (c.includes("black") || c.includes("dark")) return "/images/tshirt4.jpg";
    if (c.includes("red") || c.includes("maroon")) return "/images/tshirt7.jpg";
    if (c.includes("orange") || c.includes("coral") || c.includes("rust")) return "/images/shirt11.jpg";
    if (c.includes("yellow") || c.includes("gold") || c.includes("mustard")) return "/images/shirt11.jpg";
    if (c.includes("white") || c.includes("cream")) return "/images/tshirt9.jpg";
    if (c.includes("green") || c.includes("olive")) return "/images/tshirt2.jpg";
    if (c.includes("grey") || c.includes("gray")) return "/images/tshirt3.jpg";
    if (c.includes("brown") || c.includes("tan")) return "/images/shirt2.jpg";
    if (c.includes("pink") || c.includes("rose")) return "/images/shirt5.jpg";

    return "/images/tshirt4.jpg";
}

function getProductColorSwatches(product) {
    const category = String(product?.category || "").trim().toLowerCase();
    const prodName = String(product?.name || "").trim().toLowerCase();
    const isTShirt = category.includes("t-shirt") || category.includes("tshirt") || category.includes("tee") || prodName.includes("t-shirt") || prodName.includes("tshirt") || prodName.includes("tee");

    const collected = [];
    const seen = new Set();

    function addColor(name, img) {
        if (!name) return;
        const key = String(name).trim().toLowerCase();
        if (!key || seen.has(key)) return;
        seen.add(key);
        const hex = getColorHex(key);
        let photo = (img && img !== "null") ? img : getMatchingColorPhoto(category, key);
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
        if (isTShirt) {
            addColor("Black", "/images/tshirt4.jpg");
            addColor("Blue", "/images/tshirt1.jpg");
            addColor("Red", "/images/tshirt7.jpg");
            addColor("White", "/images/tshirt9.jpg");
            addColor("Green", "/images/tshirt2.jpg");
        } else if (category.includes("jacket") || category.includes("coat") || category.includes("outerwear") || category.includes("hoodie")) {
            addColor("Black", "/images/jacket3.jpg");
            addColor("Blue", "/images/jacket2.jpg");
            addColor("Red", "/images/jacket6.jpg");
            addColor("White", "/images/jacket4.jpg");
            addColor("Green", "/images/jacket1.jpg");
        } else if (category.includes("shirt")) {
            addColor("Brown", "/images/shirt2.jpg");
            addColor("Blue", "/images/tshirt1.jpg");
            addColor("Black", "/images/tshirt4.jpg");
            addColor("White", "/images/tshirt9.jpg");
        } else if (category.includes("jean") || category.includes("pant")) {
            addColor("Blue", "/images/jeans3.jpg");
            addColor("Black", "/images/jacket3.jpg");
            addColor("White", "/images/jacket4.jpg");
        } else {
            addColor("Black", "/images/tshirt4.jpg");
            addColor("Blue", "/images/tshirt1.jpg");
            addColor("Red", "/images/tshirt7.jpg");
            addColor("White", "/images/tshirt9.jpg");
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

    // 1. Update image with smooth fade
    const img = card.querySelector(".product-image img, .product-thumb-wrap img, img");
    if (img && newImageSrc) {
        img.style.transition = "opacity 0.2s ease, transform 0.25s ease";
        img.style.opacity = "0.3";
        img.style.transform = "scale(0.97)";
        setTimeout(function () {
            img.src = newImageSrc;
            img.style.opacity = "1";
            img.style.transform = "scale(1)";
        }, 130);
    }

    // 2. Active swatch state
    const swatches = card.querySelectorAll(".card-color-badge");
    swatches.forEach(function (b) { b.classList.remove("active"); });
    badgeEl.classList.add("active");

    // 3. Store selected color on card for openProduct
    card.dataset.selectedColor = colorName;
}
window.switchCardColor = switchCardColor;


// Fallback catalog used when offline or server is not running
const DEFAULT_FALLBACK_PRODUCTS = [
    {
        id: 61,
        name: "Premium Luxury T-Shirt",
        category: "T-Shirts",
        price: 499.00,
        image: "[\"/images/1791176359043-564710501.jpg\",\"/images/1791176359041-14063530.jpg\"]",
        stock: 95,
        description: "Classic luxury crewneck t-shirt crafted with premium cotton for effortless everyday comfort and style.",
        sizes: "S, M, L, XL",
        rating: 4.8,
        review_count: 24
    },
    {
        id: 62,
        name: "Designer Embroidered T-Shirt",
        category: "T-Shirts",
        price: 699.00,
        image: "[\"/images/1791176724407-974427492.jpg\",\"/images/1791176724408-30166353.jpg\"]",
        stock: 111,
        description: "Designer tailored fit t-shirt with signature embroidery, durable stitching, and breathable fabric.",
        sizes: "S, M, L, XL",
        rating: 4.9,
        review_count: 18
    },
    {
        id: 63,
        name: "Signature Streetwear Tee",
        category: "T-Shirts",
        price: 650.00,
        image: "[\"/images/1791191463668-644297752.jpg\",\"/images/1791191463667-92612588.jpg\"]",
        stock: 259,
        description: "Signature streetwear regular fit tee made from high-density pure combed cotton.",
        sizes: "M, L, XL",
        rating: 4.7,
        review_count: 32
    },
    {
        id: 64,
        name: "Casual Summer Print T-Shirt",
        category: "T-Shirts",
        price: 450.00,
        image: "[\"/images/1791196785467-40631101.jpg\",\"/images/1791196785469-199507591.jpg\"]",
        stock: 85,
        description: "Casual summer print t-shirt featuring vibrant fade-resistant graphic and soft-feel wash.",
        sizes: "S, M, L",
        rating: 4.6,
        review_count: 15
    },
    {
        id: 65,
        name: "Vintage Washed Cotton Tee",
        category: "T-Shirts",
        price: 650.00,
        image: "[\"/images/1791197044949-347337850.jpg\",\"/images/1791197044947-814647748.jpg\"]",
        stock: 120,
        description: "Vintage washed crewneck tee with distressed aesthetics and modern relaxed silhouette.",
        sizes: "M, L, XL, XXL",
        rating: 4.8,
        review_count: 19
    },
    {
        id: 66,
        name: "Heavyweight Boxy Fit Tee",
        category: "T-Shirts",
        price: 640.00,
        image: "[\"/images/1791197162506-196657701.jpg\",\"/images/1791197162507-314862158.jpeg\"]",
        stock: 90,
        description: "Heavyweight premium cotton tee with reinforced ribbing and minimal branding.",
        sizes: "S, M, L, XL",
        rating: 4.7,
        review_count: 12
    },
    {
        id: 67,
        name: "Minimalist Round Neck Tee",
        category: "T-Shirts",
        price: 450.00,
        image: "[\"/images/1791197300763-745396726.jpg\",\"/images/1791197300762-590361675.jpg\"]",
        stock: 50,
        description: "Essential minimalist round neck t-shirt designed for all-day versatile wear.",
        sizes: "S, M, L",
        rating: 4.5,
        review_count: 22
    },
    {
        id: 68,
        name: "Everyday Basic Comfort Tee",
        category: "T-Shirts",
        price: 300.00,
        image: "[\"/images/1791197538178-586495650.jpg\",\"/images/1791197538179-2266997.jpg\"]",
        stock: 200,
        description: "Everyday basic comfort t-shirt in breathable jersey knit fabric.",
        sizes: "S, M, L, XL",
        rating: 4.4,
        review_count: 40
    },
    {
        id: 69,
        name: "Athletic Performance Tee",
        category: "T-Shirts",
        price: 599.00,
        image: "[\"/images/1791197645816-437406909.jpg\",\"/images/1791197645816-828991506.jpg\"]",
        stock: 58,
        description: "Modern athletic cut performance t-shirt with moisture-wicking blend.",
        sizes: "M, L, XL",
        rating: 4.8,
        review_count: 16
    },
    {
        id: 70,
        name: "Oversized Royal Maroon Tee",
        category: "T-Shirts",
        price: 670.00,
        image: "[\"/images/1791204635675-389540369.jpg\",\"/images/1791204635673-621498492.jpg\"]",
        stock: 190,
        description: "Luxury oversized cotton t-shirt with dropped shoulders and relaxed drape.",
        sizes: "S, M, L, XL",
        rating: 4.9,
        review_count: 27
    },
    {
        id: 71,
        name: "Tailored Oxford Formal Shirt",
        category: "Shirts",
        price: 699.00,
        image: "[\"/images/1791265630554-810157541.jpg\",\"/images/1791265630553-403693365.jpg\"]",
        stock: 120,
        description: "Smart casual button-down oxford cotton shirt with tailored collar and sleek finish.",
        sizes: "S, M, L, XL, XXL",
        rating: 4.8,
        review_count: 35
    }
];

// ============================================================
// LOAD PRODUCTS FROM API
// ============================================================

async function loadProducts() {

    console.log("Loading products...");

    if (resultCount) {
        resultCount.textContent = "Loading products...";
    }

    if (productContainer) {
        productContainer.innerHTML = `
            <div class="no-products">
                <h2>Loading Products...</h2>
                <p>Please wait...</p>
            </div>
        `;
    }

    try {
        const response = await fetch("/api/products");

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        console.log("Products API Response:", data);

        if (Array.isArray(data)) {
            allProducts = data;
        } else if (Array.isArray(data.products)) {
            allProducts = data.products;
        } else if (Array.isArray(data.data)) {
            allProducts = data.data;
        } else {
            allProducts = [...DEFAULT_FALLBACK_PRODUCTS];
        }

        if (allProducts.length === 0) {
            allProducts = [...DEFAULT_FALLBACK_PRODUCTS];
        }

        console.log("All Products:", allProducts);

        const urlParams = new URLSearchParams(window.location.search);
        const selectedCategory = urlParams.get("category");
        const searchQuery = urlParams.get("search");

        if (searchQuery && searchInput) {
            searchInput.value = searchQuery;
        }

        if (selectedCategory && categoryFilter) {
            categoryFilter.value = selectedCategory.toLowerCase();
        }

        const selectedShopFilter = urlParams.get("filter");
        if (selectedShopFilter) {
            window.currentShopFilter = selectedShopFilter.toLowerCase();
        }

        applyFilters();

    } catch (error) {
        console.warn("Product loading error / offline mode, using catalog fallback:", error);

        allProducts = [...DEFAULT_FALLBACK_PRODUCTS];

        const urlParams = new URLSearchParams(window.location.search);
        const selectedCategory = urlParams.get("category");
        const searchQuery = urlParams.get("search");

        if (searchQuery && searchInput) {
            searchInput.value = searchQuery;
        }

        if (selectedCategory && categoryFilter) {
            categoryFilter.value = selectedCategory.toLowerCase();
        }

        const selectedShopFilter = urlParams.get("filter");
        if (selectedShopFilter) {
            window.currentShopFilter = selectedShopFilter.toLowerCase();
        }

        applyFilters();
    }
}


// ============================================================
// NORMALIZE CATEGORY VALUES
// ============================================================

function normalizeCategoryName(value) {

    return String(
        value || ""
    )
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

}


function categoryMatchesFilter(productCategory, selectedCategory) {

    const productKey =
        normalizeCategoryName(
            productCategory
        );

    const selectedKey =
        normalizeCategoryName(
            selectedCategory
        );

    if (
        productKey === selectedKey
    ) {

        return true;

    }

    // Distinct separation: Pants shows pants, Jeans shows jeans, combined only if pants-&-jeans
    if (selectedKey === "pants-&-jeans" || selectedKey === "pants-jeans") {
        if (productKey === "pants" || productKey === "jeans" || productKey === "pant" || productKey === "jean") {
            return true;
        }
    }

    const categoryAliases = {
        "t-shirt": "t-shirts",
        "t-shirts": "t-shirts",
        "shirt": "shirts",
        "shirts": "shirts",
        "jacket": "jackets",
        "jackets": "jackets",
        "hoodie": "hoodies",
        "hoodies": "hoodies",
        "short": "shorts",
        "shorts": "shorts",
        "shoe": "shoes",
        "shoes": "shoes",
        "accessory": "accessories",
        "accessories": "accessories",
        "pant": "pants",
        "pants": "pants",
        "jean": "jeans",
        "jeans": "jeans"
    };

    const productAlias =
        categoryAliases[productKey] ||
        productKey;

    const selectedAlias =
        categoryAliases[selectedKey] ||
        selectedKey;

    return (
        productAlias ===
        selectedAlias
    );

}


// ============================================================
// APPLY ALL FILTERS
// ============================================================

function applyFilters() {

    if (!window._isPaginating) {
        window.currentPage = 1;
    }

    let filteredProducts =
        [...allProducts];


    // ========================================================
    // SEARCH FILTER
    // ========================================================

    const searchValue =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    if (searchValue) {

        filteredProducts =
            filteredProducts.filter(
                function (product) {

                    const name =
                        String(
                            product.name || ""
                        ).toLowerCase();


                    const description =
                        String(
                            product.description || ""
                        ).toLowerCase();


                    const category =
                        String(
                            product.category || ""
                        ).toLowerCase();


                    const brand =
                        String(
                            product.brand || ""
                        ).toLowerCase();


                    return (

                        name.includes(
                            searchValue
                        )

                        ||

                        description.includes(
                            searchValue
                        )

                        ||

                        category.includes(
                            searchValue
                        )

                        ||

                        brand.includes(
                            searchValue
                        )

                    );

                }
            );

    }


    // ========================================================
    // CATEGORY FILTER
    // ========================================================

    const selectedCategory =
        categoryFilter
            ? categoryFilter.value
                .trim()
                .toLowerCase()
            : "all";


    if (
        selectedCategory &&
        selectedCategory !== "all"
    ) {

        filteredProducts =
            filteredProducts.filter(
                function (product) {

                    return categoryMatchesFilter(
                        product.category,
                        selectedCategory
                    );

                }
            );

    }


    // ========================================================
    // PRICE FILTER
    // ========================================================

    const selectedPrice =
        priceFilter
            ? priceFilter.value
            : "all";


    if (
        selectedPrice &&
        selectedPrice !== "all"
    ) {

        filteredProducts =
            filteredProducts.filter(
                function (product) {

                    const price =
                        Number(
                            product.price || 0
                        );


                    // ----------------------------------------
                    // UNDER ₹500
                    // ----------------------------------------

                    if (
                        selectedPrice === "0-500"
                    ) {

                        return price < 500;

                    }


                    // ----------------------------------------
                    // ₹500 - ₹1000
                    // ----------------------------------------

                    if (
                        selectedPrice === "500-1000"
                    ) {

                        return (
                            price >= 500 &&
                            price <= 1000
                        );

                    }


                    // ----------------------------------------
                    // ₹1000 - ₹2000
                    // ----------------------------------------

                    if (
                        selectedPrice === "1000-2000"
                    ) {

                        return (
                            price > 1000 &&
                            price <= 2000
                        );

                    }


                    // ----------------------------------------
                    // ABOVE ₹2000
                    // ----------------------------------------

                    if (
                        selectedPrice === "2000+"
                    ) {

                        return price > 2000;

                    }


                    return true;

                }
            );

    }


    // ========================================================
    // SIZE FILTER
    // ========================================================

    const selectedSize =
        sizeFilter
            ? sizeFilter.value
            : "all";


    if (
        selectedSize &&
        selectedSize !== "all"
    ) {

        filteredProducts =
            filteredProducts.filter(
                function (product) {

                    return productHasSize(
                        product,
                        selectedSize
                    );

                }
            );

    }


    // ========================================================
    // BRAND FILTER
    // ========================================================

    const selectedBrand =
        brandFilter
            ? brandFilter.value
                .trim()
                .toLowerCase()
            : "all";


    if (
        selectedBrand &&
        selectedBrand !== "all"
    ) {

        filteredProducts =
            filteredProducts.filter(
                function (product) {

                    const productBrand =
                        String(
                            product.brand || ""
                        )
                            .trim()
                            .toLowerCase();


                    return (
                        productBrand ===
                        selectedBrand
                    );

                }
            );

    }


    // ========================================================
    // SORT
    // ========================================================

    const selectedSort =
        sortFilter
            ? sortFilter.value
            : "default";


    filteredProducts =
        sortProducts(
            filteredProducts,
            selectedSort
        );


    // ========================================================
    // SHOP SUB-NAV FILTER (New Arrivals, Best Sellers, Trending, Featured, Sale)
    // ========================================================

    if (window.currentShopFilter) {
        const sf = String(window.currentShopFilter).toLowerCase();
        if (sf === "new-arrivals") {
            filteredProducts.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
        } else if (sf === "best-sellers" || sf === "trending") {
            filteredProducts.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0) || Number(b.stock || 0) - Number(a.stock || 0));
        } else if (sf === "featured") {
            const featuredList = filteredProducts.filter(p => p.featured || p.is_featured || (Number(p.rating || 0) >= 4));
            if (featuredList.length > 0) filteredProducts = featuredList;
        } else if (sf === "sale") {
            const saleList = filteredProducts.filter(p => p.old_price || p.discount || (p.price && Number(p.price) < 1500));
            if (saleList.length > 0) filteredProducts = saleList;
        }
    }


    // ========================================================
    // DISPLAY
    // ========================================================

    displayProducts(
        filteredProducts
    );

}


// ============================================================
// CHECK PRODUCT SIZE
// ============================================================

function productHasSize(
    product,
    selectedSize
) {

    const wantedSize =
        String(selectedSize)
            .trim()
            .toLowerCase();


    // --------------------------------------------------------
    // SINGLE SIZE
    // Example:
    // size: "M"
    // --------------------------------------------------------

    if (product.size) {

        const productSize =
            String(product.size)
                .trim()
                .toLowerCase();


        if (
            productSize ===
            wantedSize
        ) {

            return true;

        }

    }


    // --------------------------------------------------------
    // SIZES ARRAY
    // Example:
    // sizes: ["S", "M", "L"]
    // --------------------------------------------------------

    if (
        Array.isArray(product.sizes)
    ) {

        return product.sizes.some(
            function (size) {

                return (
                    String(size)
                        .trim()
                        .toLowerCase()
                    ===
                    wantedSize
                );

            }
        );

    }


    // --------------------------------------------------------
    // COMMA SEPARATED SIZES
    // Example:
    // sizes: "S,M,L,XL"
    // --------------------------------------------------------

    if (
        typeof product.sizes === "string"
    ) {

        const sizes =
            product.sizes
                .split(",")
                .map(
                    function (size) {

                        return String(size)
                            .trim()
                            .toLowerCase();

                    }
                );


        return sizes.includes(
            wantedSize
        );

    }


    // --------------------------------------------------------
    // SIZE VARIANTS
    // Example:
    // size_variants: ["S", "M", "L"]
    // --------------------------------------------------------

    if (
        Array.isArray(
            product.size_variants
        )
    ) {

        return product.size_variants.some(
            function (size) {

                return (
                    String(size)
                        .trim()
                        .toLowerCase()
                    ===
                    wantedSize
                );

            }
        );

    }


    return false;

}


// ============================================================
// SORT PRODUCTS
// ============================================================

function sortProducts(
    products,
    sortType
) {

    const sorted =
        [...products];


    switch (sortType) {


        // ----------------------------------------------------
        // PRICE LOW TO HIGH
        // ----------------------------------------------------

        case "price-low":

            sorted.sort(
                function (a, b) {

                    return (
                        Number(a.price || 0) -
                        Number(b.price || 0)
                    );

                }
            );

            break;


        // ----------------------------------------------------
        // PRICE HIGH TO LOW
        // ----------------------------------------------------

        case "price-high":

            sorted.sort(
                function (a, b) {

                    return (
                        Number(b.price || 0) -
                        Number(a.price || 0)
                    );

                }
            );

            break;


        // ----------------------------------------------------
        // NAME A-Z
        // ----------------------------------------------------

        case "name-az":

            sorted.sort(
                function (a, b) {

                    return String(
                        a.name || ""
                    ).localeCompare(
                        String(
                            b.name || ""
                        )
                    );

                }
            );

            break;


        // ----------------------------------------------------
        // NAME Z-A
        // ----------------------------------------------------

        case "name-za":

            sorted.sort(
                function (a, b) {

                    return String(
                        b.name || ""
                    ).localeCompare(
                        String(
                            a.name || ""
                        )
                    );

                }
            );

            break;


        // ----------------------------------------------------
        // NEWEST FIRST
        // ----------------------------------------------------

        case "newest":

            sorted.sort(
                function (a, b) {

                    const dateA =
                        new Date(
                            a.created_at || 0
                        );

                    const dateB =
                        new Date(
                            b.created_at || 0
                        );


                    return (
                        dateB - dateA
                    );

                }
            );

            break;


        // ----------------------------------------------------
        // DEFAULT
        // ----------------------------------------------------

        default:

            break;

    }


    return sorted;

}


// ============================================================
// AMAZON-STYLE PAGINATION LOGIC
// ============================================================

window.currentPage = 1;
window.productsPerPage = 8;
window.totalCatalogPages = 400;

function filterProducts() {
    window.currentPage = 1;
    applyFilters();
}
window.filterProducts = filterProducts;

function getPageProducts(products, page, pageSize) {
    if (!products || products.length === 0) return [];
    const p = Math.max(1, page || 1);
    const size = pageSize || 8;
    const start = (p - 1) * size;
    if (start < products.length) {
        return products.slice(start, start + size);
    }
    const res = [];
    for (let i = 0; i < size; i++) {
        res.push(products[(start + i) % products.length]);
    }
    return res;
}

function goToAmazonPage(pageNum) {
    const total = window.totalCatalogPages || 400;
    const target = Math.max(1, Math.min(pageNum, total));
    window.currentPage = target;

    const targetEl = document.getElementById("productContainer") || document.querySelector(".shop-main-content") || document.querySelector(".products-page");
    if (targetEl) {
        const topOffset = targetEl.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top: Math.max(0, topOffset), behavior: "smooth" });
    }

    if (window.currentFilteredProducts && window.currentFilteredProducts.length > 0) {
        displayProducts(window.currentFilteredProducts);
    } else {
        window._isPaginating = true;
        try {
            applyFilters();
        } finally {
            window._isPaginating = false;
        }
    }
}
window.goToAmazonPage = goToAmazonPage;

function renderAmazonPagination(totalItems, currentPage) {
    const wrapper = document.getElementById("amazonPaginationWrapper");
    const container = document.getElementById("amazonPaginationBar");
    if (!wrapper || !container) return;

    if (!totalItems || totalItems === 0) {
        wrapper.style.display = "none";
        return;
    }

    wrapper.style.display = "flex";
    const totalPages = window.totalCatalogPages || 400;
    const page = Math.max(1, Math.min(currentPage || 1, totalPages));

    let html = '';

    // Previous Button
    if (page > 1) {
        html += '<a href="javascript:void(0)" class="amazon-page-prev active" onclick="goToAmazonPage(' + (page - 1) + ')" aria-label="Previous Page"><span class="amazon-chevron-left">&#x2039;</span> Previous</a>';
    } else {
        html += '<span class="amazon-page-prev disabled" aria-disabled="true"><span class="amazon-chevron-left">&#x2039;</span> Previous</span>';
    }

    // Numbered links matching [1, 2, 3, ..., 400]
    let pagesToShow = [];
    if (page <= 2) {
        pagesToShow = [1, 2, 3, '...', totalPages];
    } else if (page === 3) {
        pagesToShow = [1, 2, 3, 4, '...', totalPages];
    } else if (page >= totalPages - 2) {
        pagesToShow = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
        pagesToShow = [1, '...', page - 1, page, page + 1, '...', totalPages];
    }

    pagesToShow.forEach(function (p) {
        if (p === '...') {
            html += '<span class="amazon-page-ellipsis">...</span>';
        } else if (p === page) {
            html += '<span class="amazon-page-num active" aria-current="page">' + p + '</span>';
        } else {
            html += '<a href="javascript:void(0)" class="amazon-page-num" onclick="goToAmazonPage(' + p + ')">' + p + '</a>';
        }
    });

    // Next Button
    if (page < totalPages) {
        html += '<a href="javascript:void(0)" class="amazon-page-next active" onclick="goToAmazonPage(' + (page + 1) + ')" aria-label="Next Page">Next <span class="amazon-chevron-right">&#x203A;</span></a>';
    } else {
        html += '<span class="amazon-page-next disabled" aria-disabled="true">Next <span class="amazon-chevron-right">&#x203A;</span></span>';
    }

    container.innerHTML = html;
}
window.renderAmazonPagination = renderAmazonPagination;

// ============================================================
// DISPLAY PRODUCTS
// ============================================================

function displayProducts(
    products
) {

    if (!productContainer) {

        console.error(
            "Product container not found."
        );

        return;

    }


    productContainer.innerHTML =
        "";

    window.currentFilteredProducts = products || [];


    // ========================================================
    // PRODUCT COUNT
    // ========================================================

    if (resultCount) {

        resultCount.textContent =
            `${products.length} Product${

                products.length === 1
                    ? ""
                    : "s"

            } Found`;

    }


    // ========================================================
    // NO PRODUCTS
    // ========================================================

    if (
        !Array.isArray(products) ||
        products.length === 0
    ) {

        productContainer.style.display =
            "none";


        if (noProducts) {

            noProducts.style.display =
                "block";

        }


        if (resultCount) {

            resultCount.textContent =
                "0 Products Found";

        }

        const amazonPag = document.getElementById("amazonPaginationWrapper");
        if (amazonPag) amazonPag.style.display = "none";

        return;

    }


    // ========================================================
    // SHOW PRODUCT GRID
    // ========================================================

    productContainer.style.display =
        "grid";


    if (noProducts) {

        noProducts.style.display =
            "none";

    }


    // ========================================================
    // PAGINATION SLICING & PRODUCT COUNT
    // ========================================================

    const page = window.currentPage || 1;
    const perPage = window.productsPerPage || 8;
    const pageProducts = getPageProducts(products, page, perPage);

    if (resultCount) {
        const startItem = (page - 1) * perPage + 1;
        const endItem = startItem + pageProducts.length - 1;
        const activeCategory = (window.sidebarState && window.sidebarState.category && window.sidebarState.category !== 'all')
            ? ' for "' + window.sidebarState.category + '"'
            : '';
        resultCount.textContent = startItem + '-' + endItem + ' of over 10,000 results' + activeCategory;
    }

    // ========================================================
    // CREATE PRODUCT CARDS
    // ========================================================

    pageProducts.forEach(
        function (product) {

            const productCard =
                document.createElement(
                    "div"
                );


            productCard.className =
                "product-card";


            // ------------------------------------------------
            // PRODUCT DATA
            // ------------------------------------------------

            const productId =
                Number(
                    product.id
                );


            const productName =
                product.name ||
                "Product";


            const productDescription =
                product.description ||
                "";


            const productCategory =
                product.category ||
                "General";


            const productBrand =
                product.brand ||
                "";


            const productPrice =
                Number(
                    product.display_price ??
                    product.price ?? 0
                );


            const productStock =
                Number(
                    product.stock || 0
                );


            // ------------------------------------------------
            // IMAGE
            // ------------------------------------------------

            const imagePath = normalizeProductImagePath(getProductImage(product));


            console.log(
                "Product Image:",
                {
                    name: productName,
                    databaseImage: product.image,
                    finalImage: imagePath
                }
            );

            const colorSwatchesList =
                getProductColorSwatches(product);

            let initialColor =
                colorSwatchesList.length > 0 ? colorSwatchesList[0].name : "";

            let initialImage = normalizeProductImagePath((colorSwatchesList.length > 0 && colorSwatchesList[0].image) ? colorSwatchesList[0].image : imagePath);

            let activeIdx = 0;
            if (colorSwatchesList.length > 0) {
                const matchIdx = colorSwatchesList.findIndex(function (s) {
                    return s.image && normalizeProductImagePath(s.image) === normalizeProductImagePath(imagePath);
                });
                if (matchIdx >= 0) {
                    activeIdx = matchIdx;
                    initialColor = colorSwatchesList[activeIdx].name;
                    initialImage = colorSwatchesList[activeIdx].image;
                }
            }

            productCard.dataset.productId = productId;
            if (initialColor) {
                productCard.dataset.selectedColor = initialColor;
            }

            let swatchesHtml = "";
            if (colorSwatchesList.length > 0) {
                swatchesHtml = `
                    <div class="card-color-swatches" onclick="event.stopPropagation();" title="Choose color">
                        ${colorSwatchesList.map(function (swatch, idx) {
                            return `
                                <button
                                    type="button"
                                    class="card-color-badge ${swatch.border ? 'white-swatch' : ''} ${idx === activeIdx ? 'active' : ''}"
                                    style="background-color: ${swatch.hex};"
                                    data-color="${escapeHTML(swatch.name)}"
                                    data-image="${escapeHTML(swatch.image)}"
                                    title="${escapeHTML(swatch.name)}"
                                    aria-label="${escapeHTML(swatch.name)}"
                                    onclick="switchCardColor(event, this, ${productId}, '${escapeHTML(swatch.image)}', '${escapeHTML(swatch.name)}')"
                                >
                                    <i class="fa-solid fa-check"></i>
                                </button>
                            `;
                        }).join("")}
                    </div>
                `;
            }


            // =================================================
            // CARD HTML
            // =================================================

            productCard.innerHTML = `

                <div class="product-image">

                    <img
                        src="${escapeHTML(
                            initialImage
                        )}"
                        alt="${escapeHTML(
                            productName
                        )}"
                        onclick="openProduct(${productId})"
                        style="cursor:pointer;"
                        onerror="
                            this.onerror=null;
                            this.src=normalizeProductImagePath('shirts1.jpg');
                        "
                    >

                    <!-- WISHLIST (TOP RIGHT) -->
                    <button
                        type="button"
                        class="card-wishlist-btn"
                        onclick="addToWishlist(${productId}, event)"
                        aria-label="Add to wishlist"
                        title="Add to Wishlist"
                    >
                        <i class="fa-regular fa-heart"></i>
                    </button>


                </div>


                <div class="product-info">


                    ${
                        productBrand
                            ? `

                                <p class="product-brand">

                                    ${escapeHTML(
                                        productBrand
                                    )}

                                </p>

                              `
                            : ""
                    }


                    <span class="product-category">

                        ${escapeHTML(
                            productCategory
                        )}

                    </span>


                    <h3
                        onclick="openProduct(${productId})"
                        style="cursor:pointer;"
                    >

                        ${escapeHTML(
                            productName
                        )}

                    </h3>


                    ${swatchesHtml}


                    ${
                        productDescription
                            ? `

                                <p>

                                    ${escapeHTML(
                                        productDescription
                                    )}

                                </p>

                              `
                            : ""
                    }


                    <div class="product-price">

                        ₹${productPrice.toFixed(2)}

                    </div>


                    <div class="product-stock ${productStock > 0 ? 'in-stock' : 'out-of-stock'}">

                        ${
                            productStock > 0
                                ? `<i class="fa-solid fa-check"></i> In Stock (${productStock} available)`
                                : '<i class="fa-solid fa-xmark"></i> Out of Stock'
                        }

                    </div>


                    <div class="product-actions">

                        <!-- CART (FULL WIDTH) -->

                        <button
                            type="button"
                            class="cart-button add-cart-btn ${productStock <= 0 ? 'disabled' : ''}"
                            onclick="addToCart(${productId})"
                            ${
                                productStock <= 0
                                    ? "disabled"
                                    : ""
                            }
                        >

                            <i class="fa-solid ${productStock <= 0 ? 'fa-ban' : 'fa-bag-shopping'}"></i> ${productStock <= 0 ? 'Out of Stock' : 'Add to Cart'}

                        </button>

                    </div>


                </div>

            `;


            productContainer.appendChild(
                productCard
            );

            // Refine card swatches from actual t-shirt photos
            productCard.querySelectorAll(".card-color-badge").forEach(function (btn) {
                const imgUrl = btn.dataset.image;
                if (imgUrl) {
                    extractDominantColorFromImage(imgUrl, function (exactHex) {
                        btn.style.backgroundColor = exactHex;
                    });
                }
            });

        }
    );

    // Render Amazon pagination bar
    renderAmazonPagination(products.length, window.currentPage);

}


// ============================================================
// OPEN PRODUCT DETAILS
// ============================================================

function openProduct(
    productId,
    color
) {

    let selectedColor = color;

    if (!selectedColor) {
        const card = document.querySelector(`.product-card[data-product-id="${productId}"]`);
        if (card && card.dataset.selectedColor) {
            selectedColor = card.dataset.selectedColor;
        }
    }

    const colorParam = selectedColor
        ? `&color=${encodeURIComponent(selectedColor)}`
        : "";

    window.location.href =
        `/product-details.html?id=${encodeURIComponent(
            productId
        )}${colorParam}`;

}


// ============================================================
// ADD PRODUCT TO CART
// ============================================================

function addToCart(
    productId
) {

    try {

        // ----------------------------------------------------
        // GET CART FROM LOCAL STORAGE
        // ----------------------------------------------------

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
                "Invalid cart data:",
                error
            );

            cart = [];

        }


        // ----------------------------------------------------
        // FIND PRODUCT
        // ----------------------------------------------------

        const product =
            allProducts.find(
                function (item) {

                    return (
                        Number(item.id) ===
                        Number(productId)
                    );

                }
            );


        if (!product) {

            alert(
                "Product not found."
            );

            return;

        }


        // ----------------------------------------------------
        // CHECK STOCK
        // ----------------------------------------------------

        if (
            Number(product.stock || 0) <= 0
        ) {

            alert(
                "This product is out of stock."
            );

            return;

        }


        // ----------------------------------------------------
        // FIND EXISTING PRODUCT
        // ----------------------------------------------------

        const existingProduct =
            cart.find(
                function (item) {

                    return (
                        Number(item.id) ===
                        Number(productId)
                    );

                }
            );


        if (existingProduct) {

            existingProduct.quantity =
                Number(
                    existingProduct.quantity || 0
                ) + 1;

        }

        else {

            cart.push({

                id:
                    Number(product.id),

                productId:
                    Number(product.id),

                product_id:
                    Number(product.id),

                name:
                    product.name,

                price:
                    Number(
                        product.price || 0
                    ),

                image:
                    product.image || "",

                quantity:
                    1

            });

        }


        // ----------------------------------------------------
        // SAVE CART
        // ----------------------------------------------------

        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );


        // ----------------------------------------------------
        // UPDATE CART COUNT
        // ----------------------------------------------------

        updateCartCount();


        console.log(
            "Cart updated:",
            cart
        );


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


// ============================================================
// UPDATE CART COUNT
// ============================================================

function updateCartCount() {

    const cartCountElement =
        document.getElementById(
            "cart-count"
        );


    if (!cartCountElement) {

        return;

    }


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


    cartCountElement.textContent =
        totalQuantity;

}


// ============================================================
// ADD TO WISHLIST
// ============================================================

async function addToWishlist(
    productId,
    event
) {

    if (event) {
        if (typeof event.stopPropagation === "function") event.stopPropagation();
        if (typeof event.preventDefault === "function") event.preventDefault();
    }

    // --------------------------------------------------------
    // GET USER ID
    // --------------------------------------------------------

    let userId =
        localStorage.getItem(
            "userId"
        );


    // --------------------------------------------------------
    // TRY USER OBJECT
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // LOGIN REQUIRED
    // --------------------------------------------------------

    if (!userId) {

        alert(
            "Please login to add products to your wishlist."
        );


        window.location.href =
            "/login.html";


        return;

    }


    try {

        // ----------------------------------------------------
        // WISHLIST API
        // ----------------------------------------------------

        const response =
            await fetch(
                "/api/wishlist",
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            user_id:
                                Number(
                                    userId
                                ),

                            product_id:
                                Number(
                                    productId
                                )

                        })

                }
            );


        const data =
            await response.json();


        // Helper to update button visual state
        function markCardWishlisted() {
            const card = document.querySelector(`.product-card[data-product-id="${productId}"]`);
            if (card) {
                const btn = card.querySelector(".card-wishlist-btn, .wishlist-button");
                if (btn) {
                    btn.classList.add("active", "in-wishlist");
                    const icon = btn.querySelector("i");
                    if (icon) {
                        icon.classList.remove("fa-regular");
                        icon.classList.add("fa-solid");
                    }
                }
            }
        }

        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        if (
            data.success
        ) {

            markCardWishlisted();

            alert(
                "❤️ Product added to wishlist!"
            );

            return;

        }


        // ----------------------------------------------------
        // ALREADY EXISTS
        // ----------------------------------------------------

        if (
            response.status === 409
        ) {

            markCardWishlisted();

            alert(
                "❤️ Product is already in your wishlist."
            );

            return;

        }


        // ----------------------------------------------------
        // API ERROR
        // ----------------------------------------------------

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


// ============================================================
// RESET ALL FILTERS
// ============================================================

function resetAllFilters() {

    // --------------------------------------------------------
    // SEARCH
    // --------------------------------------------------------

    if (searchInput) {

        searchInput.value =
            "";

    }


    // --------------------------------------------------------
    // CATEGORY
    // --------------------------------------------------------

    if (categoryFilter) {

        categoryFilter.value =
            "all";

    }


    // --------------------------------------------------------
    // PRICE
    // --------------------------------------------------------

    if (priceFilter) {

        priceFilter.value =
            "all";

    }


    // --------------------------------------------------------
    // SIZE
    // --------------------------------------------------------

    if (sizeFilter) {

        sizeFilter.value =
            "all";

    }


    // --------------------------------------------------------
    // BRAND
    // --------------------------------------------------------

    if (brandFilter) {

        brandFilter.value =
            "all";

    }


    // --------------------------------------------------------
    // SORT
    // --------------------------------------------------------

    if (sortFilter) {

        sortFilter.value =
            "default";

    }


    window.currentShopFilter = "";

    // --------------------------------------------------------
    // APPLY FILTERS
    // --------------------------------------------------------

    applyFilters();

}


// ============================================================
// EVENT LISTENERS
// ============================================================

// ------------------------------------------------------------
// SEARCH INPUT
// ------------------------------------------------------------

if (searchInput) {

    searchInput.addEventListener(
        "input",
        applyFilters
    );

}


// ------------------------------------------------------------
// SEARCH BUTTON
// ------------------------------------------------------------

if (searchBtn) {

    searchBtn.addEventListener(
        "click",
        applyFilters
    );

}


// ------------------------------------------------------------
// CATEGORY
// ------------------------------------------------------------

if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        applyFilters
    );

}


// ------------------------------------------------------------
// PRICE
// ------------------------------------------------------------

if (priceFilter) {

    priceFilter.addEventListener(
        "change",
        applyFilters
    );

}


// ------------------------------------------------------------
// SIZE
// ------------------------------------------------------------

if (sizeFilter) {

    sizeFilter.addEventListener(
        "change",
        applyFilters
    );

}


// ------------------------------------------------------------
// BRAND
// ------------------------------------------------------------

if (brandFilter) {

    brandFilter.addEventListener(
        "change",
        applyFilters
    );

}


// ------------------------------------------------------------
// SORT
// ------------------------------------------------------------

if (sortFilter) {

    sortFilter.addEventListener(
        "change",
        applyFilters
    );

}


// ------------------------------------------------------------
// RESET
// ------------------------------------------------------------

if (resetFilters) {

    resetFilters.addEventListener(
        "click",
        resetAllFilters
    );

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(
    value
) {

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


window.applyFilters = applyFilters;


// ============================================================
// START APPLICATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Products page initialized."
        );


        // ----------------------------------------------------
        // LOAD PRODUCTS
        // ----------------------------------------------------

        loadProducts();


        // ----------------------------------------------------
        // UPDATE CART COUNT
        // ----------------------------------------------------

        updateCartCount();

    }
);

// =========================================================
// SIZE FILTER EVENT
// =========================================================

if (sizeFilter) {

    sizeFilter.addEventListener("change", function () {

        const selectedSize = this.value;

        console.log("Selected Size:", selectedSize);

        filterProductsBySize(selectedSize);

    });

}


// =========================================================
// FILTER PRODUCTS BY SIZE
// =========================================================

function filterProductsBySize(selectedSize) {

    // Get all product cards
    const productCards =
        document.querySelectorAll(".product-card");


    productCards.forEach(card => {

        // Get product sizes from data attribute
        const sizes =
            card.dataset.sizes || "";


        // Convert:
        // "XS,S,M,L,XL"
        //
        // into:
        // ["XS", "S", "M", "L", "XL"]

        const availableSizes =
            sizes
                .split(",")
                .map(size => size.trim().toUpperCase())
                .filter(size => size !== "");


        // =================================================
        // SHOW ALL PRODUCTS
        // =================================================

        if (selectedSize === "all") {

            card.style.display = "";

            return;
        }


        // =================================================
        // CHECK SELECTED SIZE
        // =================================================

        if (availableSizes.includes(selectedSize.toUpperCase())) {

            // Product has selected size
            card.style.display = "";

        } else {

            // Product does not have selected size
            card.style.display = "none";

        }

    });

}

// ============================================================
// PRODUCT SHARE MODAL IMPLEMENTATION
// ============================================================

function openProductShareModal(productId, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }

    // Find product data from allProducts or DOM card
    let product = (allProducts || []).find(p => Number(p.id) === Number(productId)) || {};
    const card = document.querySelector(`.product-card[data-product-id="${productId}"]`);

    let productName = product.name || "";
    let productImg = "";
    let productPrice = product.price ? `₹${Number(product.price).toFixed(2)}` : "";
    let productCategory = product.category || "";
    let selectedColor = "";

    if (card) {
        if (!productName && card.querySelector("h3")) {
            productName = card.querySelector("h3").textContent.trim();
        }
        const imgEl = card.querySelector(".product-image img");
        if (imgEl && imgEl.src) {
            productImg = imgEl.src;
        }
        const priceEl = card.querySelector(".product-price");
        if (priceEl) {
            productPrice = priceEl.textContent.trim();
        }
        const catEl = card.querySelector(".product-category");
        if (catEl && !productCategory) {
            productCategory = catEl.textContent.trim();
        }
        if (card.dataset.selectedColor) {
            selectedColor = card.dataset.selectedColor;
        }
    }

    if (!productImg) {
        productImg = (typeof getProductImage === "function") 
            ? getProductImage(product) 
            : (product.image || "/images/shirts1.jpg");
    }

    if (!productName) {
        productName = "Product";
    }

    // Build reliable, absolute share link & text
    let baseUrl = window.location.origin;
    if (!baseUrl || baseUrl === "null" || window.location.protocol === "file:") {
        baseUrl = "http://localhost:5000";
    }

    let shareUrl = `${baseUrl}/product-details.html?id=${encodeURIComponent(productId || 1)}`;
    if (selectedColor) {
        shareUrl += `&color=${encodeURIComponent(selectedColor)}`;
    }

    const shareTitle = productName;
    const shareText = `Check out this ${productName} on MyStore!`;
    const priceText = productPrice ? `\n💰 Price: ${productPrice}` : '';
    const whatsappText = `🛍️ *${productName}*${priceText}\n\n👉 View & Buy here:\n${shareUrl}`;

    // Ensure modal container in document
    let modalOverlay = document.getElementById("productShareOverlay");
    if (!modalOverlay) {
        modalOverlay = document.createElement("div");
        modalOverlay.id = "productShareOverlay";
        modalOverlay.className = "product-share-overlay";
        document.body.appendChild(modalOverlay);

        // Backdrop click close
        modalOverlay.addEventListener("click", function (e) {
            if (e.target === modalOverlay) {
                closeProductShareModal();
            }
        });

        // Escape key close
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

    // Trigger animation
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
window.openProductShareModal = openProductShareModal;
window.closeProductShareModal = closeProductShareModal;
window.triggerCopyShareLink = triggerCopyShareLink;
window.triggerNativeShare = triggerNativeShare;
window.handleWhatsAppShareClick = handleWhatsAppShareClick;

