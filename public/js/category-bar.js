// ============================================================
// HORIZONTAL NAVBAR SUB-BAR & MEGA-MENU SYSTEM
// Reference: Image 2 Luxury Mega-Menu Design (Tanishq Aesthetic)
// 1. CATEGORIES MEGA-MENU (Preserved Apparel Category Names from Image 1)
// 2. SHOP MEGA-MENU (Preserved Shop Options from Image 3)
// 3. WISHLIST SUB-NAV (My Wishlist, Wishlist History)
// Features: Top Strip with Delicate Icons + Royal Maroon Underline
//           + Left Sidebar Rounded Pill Tabs (Active Rose Pill #F8EDED)
//           + 3-Column Subcategory Grid with Circular Badges (#FAF5EE)
//           + Bottom Luxury Promo Banner Card with 3 Image Thumbs & Pill "View All"
// ============================================================

(function () {
    // ------------------------------------------------------------
    // 0. OFFLINE & SERVER RESOLVER FOR CATEGORY-BAR
    // ------------------------------------------------------------
    const isFile = window.location.protocol === "file:";
    const inViews = window.location.pathname.replace(/\\/g, "/").toLowerCase().includes("/views/");
    const publicPrefix = isFile ? (inViews ? "../public/" : "public/") : "/";
    const viewsPrefix = isFile ? (inViews ? "./" : "views/") : "/";

    // Auto-inject category-bar.css if not present
    if (!document.querySelector('link[href*="category-bar.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = isFile ? (publicPrefix + "css/category-bar.css?v=8") : "/css/category-bar.css?v=8";
        document.head.appendChild(link);
    }

    function resolveAppUrl(url) {
        if (!url) return "#";
        if (isFile) {
            let clean = url.replace(/^\//, "");
            return viewsPrefix + clean;
        }
        return url;
    }

    function resolveAppImg(img) {
        if (!img) return "";
        if (isFile) {
            let filename = img.split("/").pop();
            return publicPrefix + "images/" + filename;
        }
        return img;
    }

    // ------------------------------------------------------------
    // 1. CATEGORIES DATA & CONFIGURATION (Preserved from Image 1)
    // ------------------------------------------------------------
    const categoriesData = [
        { name: "All Categories", icon: "fa-solid fa-border-all", url: "/categories.html", key: "all" },
        { name: "T-Shirts", icon: "fa-solid fa-shirt", url: "/products.html?category=T-Shirts", key: "t-shirts" },
        { name: "Shirts", icon: "fa-solid fa-user-tie", url: "/products.html?category=Shirts", key: "shirts" },
        { name: "Jeans", icon: "fa-solid fa-tags", url: "/products.html?category=Jeans", key: "jeans" },
        { name: "Pants", icon: "fa-solid fa-layer-group", url: "/products.html?category=Pants", key: "pants" },
        { name: "Jackets", icon: "fa-solid fa-vest", url: "/products.html?category=Jackets", key: "jackets" },
        { name: "Hoodies", icon: "fa-solid fa-fire", url: "/products.html?category=Hoodies", key: "hoodies" },
        { name: "Shorts", icon: "fa-solid fa-umbrella-beach", url: "/products.html?category=Shorts", key: "shorts" },
        { name: "Shoes", icon: "fa-solid fa-shoe-prints", url: "/products.html?category=Shoes", key: "shoes" },
        { name: "Accessories", icon: "fa-solid fa-glasses", url: "/products.html?category=Accessories", key: "accessories" }
    ];

    const categoryDetails = {
        "all": {
            name: "All Categories",
            banner: {
                title: "Fashion for You — Crafted with Precision, Designed for Elegance.",
                subtitle: "Explore 3500+ Stunning Styles.",
                btnText: "View All",
                btnUrl: "/products.html",
                images: ["/images/tshirt1.jpg", "/images/jacket1.jpg", "/images/shirt2.jpg"]
            },
            subcategories: [
                { name: "All Categories", icon: "fa-solid fa-border-all", url: "/categories.html", catKey: "all" },
                { name: "T-Shirts", icon: "fa-solid fa-shirt", url: "/products.html?category=T-Shirts", catKey: "t-shirts" },
                { name: "Shirts", icon: "fa-solid fa-user-tie", url: "/products.html?category=Shirts", catKey: "shirts" },
                { name: "Jeans", icon: "fa-solid fa-tags", url: "/products.html?category=Jeans", catKey: "jeans" },
                { name: "Pants", icon: "fa-solid fa-layer-group", url: "/products.html?category=Pants", catKey: "pants" },
                { name: "Jackets", icon: "fa-solid fa-vest", url: "/products.html?category=Jackets", catKey: "jackets" },
                { name: "Hoodies", icon: "fa-solid fa-fire", url: "/products.html?category=Hoodies", catKey: "hoodies" },
                { name: "Shorts", icon: "fa-solid fa-umbrella-beach", url: "/products.html?category=Shorts", catKey: "shorts" },
                { name: "Shoes", icon: "fa-solid fa-shoe-prints", url: "/products.html?category=Shoes", catKey: "shoes" },
                { name: "Accessories", icon: "fa-solid fa-glasses", url: "/products.html?category=Accessories", catKey: "accessories" }
            ]
        },
        "t-shirts": {
            name: "T-Shirts",
            banner: {
                title: "T-Shirts for You — Crafted with Precision, Designed for Elegance.",
                subtitle: "Explore 1200+ Stunning Styles.",
                btnText: "View All",
                btnUrl: "/products.html?category=T-Shirts",
                images: ["/images/tshirt1.jpg", "/images/tshirt2.jpg", "/images/tshirt3.jpg"]
            },
            subcategories: [
                { name: "All T-Shirts", icon: "fa-solid fa-shirt", url: "/products.html?category=T-Shirts", catKey: "t-shirts" },
                { name: "Oversized Tees", icon: "fa-solid fa-expand", url: "/products.html?category=T-Shirts&search=Oversized", catKey: "t-shirts", search: "Oversized" },
                { name: "Polo T-Shirts", icon: "fa-solid fa-shirt", url: "/products.html?category=T-Shirts&search=Polo", catKey: "t-shirts", search: "Polo" },
                { name: "Graphic Tees", icon: "fa-solid fa-palette", url: "/products.html?category=T-Shirts&search=Graphic", catKey: "t-shirts", search: "Graphic" },
                { name: "Round Neck Tees", icon: "fa-solid fa-circle-notch", url: "/products.html?category=T-Shirts&search=Round", catKey: "t-shirts", search: "Round" },
                { name: "Slim Fit Tees", icon: "fa-solid fa-compress", url: "/products.html?category=T-Shirts&search=Slim", catKey: "t-shirts", search: "Slim" }
            ]
        },
        "shirts": {
            name: "Shirts",
            banner: {
                title: "Shirts for You — Crafted with Precision, Designed for Elegance.",
                subtitle: "Explore 850+ Stunning Styles.",
                btnText: "View All",
                btnUrl: "/products.html?category=Shirts",
                images: ["/images/shirt2.jpg", "/images/shirt3.jpg", "/images/shirt4.jpg"]
            },
            subcategories: [
                { name: "All Shirts", icon: "fa-solid fa-user-tie", url: "/products.html?category=Shirts", catKey: "shirts" },
                { name: "Formal Shirts", icon: "fa-solid fa-briefcase", url: "/products.html?category=Shirts&search=Formal", catKey: "shirts", search: "Formal" },
                { name: "Casual Shirts", icon: "fa-solid fa-mug-hot", url: "/products.html?category=Shirts&search=Casual", catKey: "shirts", search: "Casual" },
                { name: "Pure Linen Shirts", icon: "fa-solid fa-feather", url: "/products.html?category=Shirts&search=Linen", catKey: "shirts", search: "Linen" },
                { name: "Denim Shirts", icon: "fa-solid fa-tags", url: "/products.html?category=Shirts&search=Denim", catKey: "shirts", search: "Denim" },
                { name: "Checked & Striped", icon: "fa-solid fa-table-cells", url: "/products.html?category=Shirts&search=Checked", catKey: "shirts", search: "Checked" }
            ]
        },
        "jeans": {
            name: "Jeans",
            banner: {
                title: "Jeans for You — Crafted with Precision, Designed for Elegance.",
                subtitle: "Explore 920+ Stunning Styles.",
                btnText: "View All",
                btnUrl: "/products.html?category=Jeans",
                images: ["/images/jeans3.jpg", "/images/pants cargo.jpg", "/images/tshirt1.jpg"]
            },
            subcategories: [
                { name: "All Jeans", icon: "fa-solid fa-tags", url: "/products.html?category=Jeans", catKey: "jeans" },
                { name: "Slim Fit Jeans", icon: "fa-solid fa-arrows-left-right", url: "/products.html?category=Jeans&search=Slim", catKey: "jeans", search: "Slim" },
                { name: "Skinny Fit", icon: "fa-solid fa-compress", url: "/products.html?category=Jeans&search=Skinny", catKey: "jeans", search: "Skinny" },
                { name: "Straight Leg Denim", icon: "fa-solid fa-grip-lines-vertical", url: "/products.html?category=Jeans&search=Straight", catKey: "jeans", search: "Straight" },
                { name: "Baggy & Wide Leg", icon: "fa-solid fa-up-right-and-down-left-from-center", url: "/products.html?category=Jeans&search=Baggy", catKey: "jeans", search: "Baggy" },
                { name: "Distressed Denim", icon: "fa-solid fa-scissors", url: "/products.html?category=Jeans&search=Distressed", catKey: "jeans", search: "Distressed" }
            ]
        },
        "pants": {
            name: "Pants",
            banner: {
                title: "Pants for You — Crafted with Precision, Designed for Elegance.",
                subtitle: "Explore 650+ Stunning Styles.",
                btnText: "View All",
                btnUrl: "/products.html?category=Pants",
                images: ["/images/pants cargo.jpg", "/images/jeans3.jpg", "/images/shirt2.jpg"]
            },
            subcategories: [
                { name: "All Pants", icon: "fa-solid fa-layer-group", url: "/products.html?category=Pants", catKey: "pants" },
                { name: "Chino Trousers", icon: "fa-solid fa-person", url: "/products.html?category=Pants&search=Chino", catKey: "pants", search: "Chino" },
                { name: "Cargo Pants", icon: "fa-solid fa-box-archive", url: "/products.html?category=Pants&search=Cargo", catKey: "pants", search: "Cargo" },
                { name: "Formal Trousers", icon: "fa-solid fa-briefcase", url: "/products.html?category=Pants&search=Formal", catKey: "pants", search: "Formal" },
                { name: "Track Pants & Joggers", icon: "fa-solid fa-person-running", url: "/products.html?category=Pants&search=Track", catKey: "pants", search: "Track" },
                { name: "Cotton Casuals", icon: "fa-solid fa-wind", url: "/products.html?category=Pants&search=Cotton", catKey: "pants", search: "Cotton" }
            ]
        },
        "jackets": {
            name: "Jackets",
            banner: {
                title: "Jackets for You — Crafted with Precision, Designed for Elegance.",
                subtitle: "Explore 540+ Stunning Styles.",
                btnText: "View All",
                btnUrl: "/products.html?category=Jackets",
                images: ["/images/jacket1.jpg", "/images/jacket2.jpg", "/images/jacket3.jpg"]
            },
            subcategories: [
                { name: "All Jackets", icon: "fa-solid fa-vest", url: "/products.html?category=Jackets", catKey: "jackets" },
                { name: "Bomber Jackets", icon: "fa-solid fa-jet-fighter", url: "/products.html?category=Jackets&search=Bomber", catKey: "jackets", search: "Bomber" },
                { name: "Denim Jackets", icon: "fa-solid fa-shield-halved", url: "/products.html?category=Jackets&search=Denim", catKey: "jackets", search: "Denim" },
                { name: "Leather Jackets", icon: "fa-solid fa-motorcycle", url: "/products.html?category=Jackets&search=Leather", catKey: "jackets", search: "Leather" },
                { name: "Puffer Coats", icon: "fa-solid fa-snowflake", url: "/products.html?category=Jackets&search=Puffer", catKey: "jackets", search: "Puffer" },
                { name: "Windbreakers", icon: "fa-solid fa-wind", url: "/products.html?category=Jackets&search=Windbreaker", catKey: "jackets", search: "Windbreaker" }
            ]
        },
        "hoodies": {
            name: "Hoodies",
            banner: {
                title: "Hoodies for You — Crafted with Precision, Designed for Elegance.",
                subtitle: "Explore 780+ Stunning Styles.",
                btnText: "View All",
                btnUrl: "/products.html?category=Hoodies",
                images: ["/images/jacket4.jpg", "/images/jacket5.jpg", "/images/jacket6.jpg"]
            },
            subcategories: [
                { name: "All Hoodies", icon: "fa-solid fa-fire", url: "/products.html?category=Hoodies", catKey: "hoodies" },
                { name: "Pullover Hoodies", icon: "fa-solid fa-cloud", url: "/products.html?category=Hoodies&search=Pullover", catKey: "hoodies", search: "Pullover" },
                { name: "Zip-Up Hoodies", icon: "fa-solid fa-bars-staggered", url: "/products.html?category=Hoodies&search=Zip", catKey: "hoodies", search: "Zip" },
                { name: "Oversized Fleece", icon: "fa-solid fa-feather-pointed", url: "/products.html?category=Hoodies&search=Fleece", catKey: "hoodies", search: "Fleece" },
                { name: "Graphic Sweatshirts", icon: "fa-solid fa-palette", url: "/products.html?category=Hoodies&search=Graphic", catKey: "hoodies", search: "Graphic" },
                { name: "Minimalist Basics", icon: "fa-solid fa-minus", url: "/products.html?category=Hoodies&search=Basic", catKey: "hoodies", search: "Basic" }
            ]
        },
        "shorts": {
            name: "Shorts",
            banner: {
                title: "Shorts for You — Crafted with Precision, Designed for Elegance.",
                subtitle: "Explore 430+ Stunning Styles.",
                btnText: "View All",
                btnUrl: "/products.html?category=Shorts",
                images: ["/images/pants cargo.jpg", "/images/tshirt5.jpg", "/images/shirt6.jpg"]
            },
            subcategories: [
                { name: "All Shorts", icon: "fa-solid fa-umbrella-beach", url: "/products.html?category=Shorts", catKey: "shorts" },
                { name: "Denim Shorts", icon: "fa-solid fa-tags", url: "/products.html?category=Shorts&search=Denim", catKey: "shorts", search: "Denim" },
                { name: "Chino Walk Shorts", icon: "fa-solid fa-person-walking", url: "/products.html?category=Shorts&search=Chino", catKey: "shorts", search: "Chino" },
                { name: "Cargo Shorts", icon: "fa-solid fa-boxes-stacked", url: "/products.html?category=Shorts&search=Cargo", catKey: "shorts", search: "Cargo" },
                { name: "Sweat & Lounge Shorts", icon: "fa-solid fa-couch", url: "/products.html?category=Shorts&search=Sweat", catKey: "shorts", search: "Sweat" },
                { name: "Board & Swim Shorts", icon: "fa-solid fa-water", url: "/products.html?category=Shorts&search=Swim", catKey: "shorts", search: "Swim" }
            ]
        },
        "shoes": {
            name: "Shoes",
            banner: {
                title: "Shoes for You — Crafted with Precision, Designed for Elegance.",
                subtitle: "Explore 910+ Stunning Styles.",
                btnText: "View All",
                btnUrl: "/products.html?category=Shoes",
                images: ["/images/jacket2.jpg", "/images/shirt8.jpg", "/images/tshirt7.jpg"]
            },
            subcategories: [
                { name: "All Shoes", icon: "fa-solid fa-shoe-prints", url: "/products.html?category=Shoes", catKey: "shoes" },
                { name: "Sneakers", icon: "fa-solid fa-bolt", url: "/products.html?category=Shoes&search=Sneakers", catKey: "shoes", search: "Sneakers" },
                { name: "Formal Leather Shoes", icon: "fa-solid fa-briefcase", url: "/products.html?category=Shoes&search=Formal", catKey: "shoes", search: "Formal" },
                { name: "Running & Sports", icon: "fa-solid fa-person-running", url: "/products.html?category=Shoes&search=Running", catKey: "shoes", search: "Running" },
                { name: "Loafers & Slip-Ons", icon: "fa-solid fa-gem", url: "/products.html?category=Shoes&search=Loafers", catKey: "shoes", search: "Loafers" },
                { name: "Boots & High Tops", icon: "fa-solid fa-mountain", url: "/products.html?category=Shoes&search=Boots", catKey: "shoes", search: "Boots" }
            ]
        },
        "accessories": {
            name: "Accessories",
            banner: {
                title: "Accessories for You — Crafted with Precision, Designed for Elegance.",
                subtitle: "Explore 620+ Stunning Styles.",
                btnText: "View All",
                btnUrl: "/products.html?category=Accessories",
                images: ["/images/jacket3.jpg", "/images/shirt9.jpg", "/images/tshirt8.jpg"]
            },
            subcategories: [
                { name: "All Accessories", icon: "fa-solid fa-glasses", url: "/products.html?category=Accessories", catKey: "accessories" },
                { name: "Sunglasses", icon: "fa-solid fa-glasses", url: "/products.html?category=Accessories&search=Sunglasses", catKey: "accessories", search: "Sunglasses" },
                { name: "Leather Belts", icon: "fa-solid fa-ring", url: "/products.html?category=Accessories&search=Belts", catKey: "accessories", search: "Belts" },
                { name: "Caps & Hats", icon: "fa-solid fa-hat-cowboy-side", url: "/products.html?category=Accessories&search=Caps", catKey: "accessories", search: "Caps" },
                { name: "Wallets & Cardholders", icon: "fa-solid fa-wallet", url: "/products.html?category=Accessories&search=Wallets", catKey: "accessories", search: "Wallets" },
                { name: "Watches", icon: "fa-solid fa-clock", url: "/products.html?category=Accessories&search=Watches", catKey: "accessories", search: "Watches" }
            ]
        }
    };

    // Sidebar Filter Tabs Data for Categories
    const categorySidebarTabs = {
        "price": {
            banner: {
                title: "Prices for You — Crafted with Precision, Designed for Elegance.",
                subtitle: "Explore 3500+ Styles for Every Budget.",
                btnText: "View All Deals",
                btnUrl: "/products.html",
                images: ["/images/shirt2.jpg", "/images/tshirt1.jpg", "/images/jacket1.jpg"]
            },
            items: [
                { name: "Under ₹500", icon: "fa-solid fa-tag", url: "/products.html?price=0-500", priceKey: "0-500" },
                { name: "₹500 – ₹1000", icon: "fa-solid fa-tags", url: "/products.html?price=500-1000", priceKey: "500-1000" },
                { name: "₹1000 – ₹2000", icon: "fa-solid fa-indian-rupee-sign", url: "/products.html?price=1000-2000", priceKey: "1000-2000" },
                { name: "Above ₹2000", icon: "fa-solid fa-coins", url: "/products.html?price=2000+", priceKey: "2000+" },
                { name: "Luxury Premium", icon: "fa-solid fa-crown", url: "/products.html?price=2000+", priceKey: "2000+" }
            ]
        },
        "occasion": {
            banner: {
                title: "Outfits for You — Crafted with Precision, Designed for Elegance.",
                subtitle: "Explore 3500+ Curated Occasion Looks.",
                btnText: "View All Looks",
                btnUrl: "/products.html",
                images: ["/images/jacket2.jpg", "/images/shirt3.jpg", "/images/pants cargo.jpg"]
            },
            items: [
                { name: "Casual Everyday", icon: "fa-solid fa-mug-saucer", url: "/products.html?search=Casual", search: "Casual" },
                { name: "Office & Formal", icon: "fa-solid fa-briefcase", url: "/products.html?search=Formal", search: "Formal" },
                { name: "Party & Night Out", icon: "fa-solid fa-champagne-glasses", url: "/products.html?search=Party", search: "Party" },
                { name: "Sports & Active", icon: "fa-solid fa-person-running", url: "/products.html?search=Sports", search: "Sports" },
                { name: "Weekend Getaway", icon: "fa-solid fa-umbrella-beach", url: "/products.html?search=Weekend", search: "Weekend" },
                { name: "Festive Occasion", icon: "fa-solid fa-sparkles", url: "/products.html?search=Festive", search: "Festive" }
            ]
        },
        "gender": {
            banner: {
                title: "Wardrobe for You — Crafted with Precision, Designed for Elegance.",
                subtitle: "Explore 3500+ Styles for Everyone.",
                btnText: "Explore All",
                btnUrl: "/products.html",
                images: ["/images/tshirt2.jpg", "/images/shirt4.jpg", "/images/jacket3.jpg"]
            },
            items: [
                { name: "Men's Collection", icon: "fa-solid fa-person", url: "/products.html?search=Men", search: "Men" },
                { name: "Women's Collection", icon: "fa-solid fa-person-dress", url: "/products.html?search=Women", search: "Women" },
                { name: "Unisex Essentials", icon: "fa-solid fa-people-group", url: "/products.html?search=Unisex", search: "Unisex" },
                { name: "Teens & College", icon: "fa-solid fa-graduation-cap", url: "/products.html?search=College", search: "College" },
                { name: "Kids Collection", icon: "fa-solid fa-child-reaching", url: "/products.html?search=Kids", search: "Kids" }
            ]
        },
        "style": {
            banner: {
                title: "Silhouettes for You — Crafted with Precision, Designed for Elegance.",
                subtitle: "Find the Perfect Cut & Style.",
                btnText: "Shop All Fits",
                btnUrl: "/products.html",
                images: ["/images/jeans3.jpg", "/images/jacket1.jpg", "/images/tshirt3.jpg"]
            },
            items: [
                { name: "Slim Fit", icon: "fa-solid fa-compress", url: "/products.html?search=Slim", search: "Slim" },
                { name: "Regular Fit", icon: "fa-solid fa-check", url: "/products.html?search=Regular", search: "Regular" },
                { name: "Oversized & Baggy", icon: "fa-solid fa-expand", url: "/products.html?search=Oversized", search: "Oversized" },
                { name: "Relaxed Everyday", icon: "fa-solid fa-couch", url: "/products.html?search=Relaxed", search: "Relaxed" },
                { name: "Streetwear Trend", icon: "fa-solid fa-fire", url: "/products.html?search=Streetwear", search: "Streetwear" },
                { name: "Classic Vintage", icon: "fa-solid fa-compass", url: "/products.html?search=Vintage", search: "Vintage" }
            ]
        }
    };


    // ------------------------------------------------------------
    // 2. SHOP DATA & CONFIGURATION (Preserved from Image 3)
    // ------------------------------------------------------------
    const shopData = [
        { name: "All Products", icon: "fa-solid fa-boxes-stacked", url: "/products.html", key: "all-products" },
        { name: "New Arrivals", icon: "fa-solid fa-wand-magic-sparkles", url: "/products.html?filter=new-arrivals", key: "new-arrivals" },
        { name: "Best Sellers", icon: "fa-solid fa-fire", url: "/products.html?filter=best-sellers", key: "best-sellers" },
        { name: "Trending", icon: "fa-solid fa-arrow-trend-up", url: "/products.html?filter=trending", key: "trending" },
        { name: "Featured Products", icon: "fa-solid fa-star", url: "/products.html?filter=featured", key: "featured" },
        { name: "Sale / Offers", icon: "fa-solid fa-tag", url: "/products.html?filter=sale", key: "sale" }
    ];

    const shopDetails = {
        "all-products": {
            name: "All Products",
            banner: {
                title: "All Products for You — Crafted with Precision, Designed for Elegance.",
                subtitle: "Explore 3500+ Handpicked Styles Across All Collections.",
                btnText: "View All",
                btnUrl: "/products.html",
                images: ["/images/jacket1.jpg", "/images/shirt2.jpg", "/images/tshirt1.jpg"]
            },
            subcategories: [
                { name: "All Collections", icon: "fa-solid fa-boxes-stacked", url: "/products.html", filterKey: "all-products" },
                { name: "New Arrivals", icon: "fa-solid fa-wand-magic-sparkles", url: "/products.html?filter=new-arrivals", filterKey: "new-arrivals" },
                { name: "Best Sellers", icon: "fa-solid fa-fire", url: "/products.html?filter=best-sellers", filterKey: "best-sellers" },
                { name: "Trending Now", icon: "fa-solid fa-arrow-trend-up", url: "/products.html?filter=trending", filterKey: "trending" },
                { name: "Featured Items", icon: "fa-solid fa-star", url: "/products.html?filter=featured", filterKey: "featured" },
                { name: "Sale & Offers", icon: "fa-solid fa-tag", url: "/products.html?filter=sale", filterKey: "sale" }
            ]
        },
        "new-arrivals": {
            name: "New Arrivals",
            banner: {
                title: "New Arrivals for You — Crafted with Precision, Designed for Elegance.",
                subtitle: "Discover This Season's Freshest Fashion Drops.",
                btnText: "View All",
                btnUrl: "/products.html?filter=new-arrivals",
                images: ["/images/tshirt2.jpg", "/images/jacket2.jpg", "/images/shirt3.jpg"]
            },
            subcategories: [
                { name: "All New Arrivals", icon: "fa-solid fa-wand-magic-sparkles", url: "/products.html?filter=new-arrivals", filterKey: "new-arrivals" },
                { name: "Latest Drops", icon: "fa-solid fa-calendar-days", url: "/products.html?filter=new-arrivals&search=Latest", search: "Latest" },
                { name: "Fresh Tees", icon: "fa-solid fa-shirt", url: "/products.html?category=T-Shirts&filter=new-arrivals", catKey: "t-shirts" },
                { name: "New Denim", icon: "fa-solid fa-tags", url: "/products.html?category=Jeans&filter=new-arrivals", catKey: "jeans" },
                { name: "New Outerwear", icon: "fa-solid fa-vest", url: "/products.html?category=Jackets&filter=new-arrivals", catKey: "jackets" },
                { name: "Fresh Kicks", icon: "fa-solid fa-shoe-prints", url: "/products.html?category=Shoes&filter=new-arrivals", catKey: "shoes" }
            ]
        },
        "best-sellers": {
            name: "Best Sellers",
            banner: {
                title: "Best Sellers for You — Crafted with Precision, Designed for Elegance.",
                subtitle: "Customer Favorites & Most-Loved Wardrobe Icons.",
                btnText: "View All",
                btnUrl: "/products.html?filter=best-sellers",
                images: ["/images/shirt2.jpg", "/images/jeans3.jpg", "/images/jacket1.jpg"]
            },
            subcategories: [
                { name: "All Best Sellers", icon: "fa-solid fa-fire", url: "/products.html?filter=best-sellers", filterKey: "best-sellers" },
                { name: "Top Rated Tees", icon: "fa-solid fa-shirt", url: "/products.html?category=T-Shirts&filter=best-sellers", catKey: "t-shirts" },
                { name: "Signature Denim", icon: "fa-solid fa-tags", url: "/products.html?category=Jeans&filter=best-sellers", catKey: "jeans" },
                { name: "Iconic Shirts", icon: "fa-solid fa-user-tie", url: "/products.html?category=Shirts&filter=best-sellers", catKey: "shirts" },
                { name: "Viral Hoodies", icon: "fa-solid fa-fire", url: "/products.html?category=Hoodies&filter=best-sellers", catKey: "hoodies" },
                { name: "Popular Shoes", icon: "fa-solid fa-shoe-prints", url: "/products.html?category=Shoes&filter=best-sellers", catKey: "shoes" }
            ]
        },
        "trending": {
            name: "Trending",
            banner: {
                title: "Trending for You — Crafted with Precision, Designed for Elegance.",
                subtitle: "What's Hot & Trending in Streetwear & Classic Fashion.",
                btnText: "View All",
                btnUrl: "/products.html?filter=trending",
                images: ["/images/jacket3.jpg", "/images/tshirt3.jpg", "/images/pants cargo.jpg"]
            },
            subcategories: [
                { name: "All Trending", icon: "fa-solid fa-arrow-trend-up", url: "/products.html?filter=trending", filterKey: "trending" },
                { name: "Streetwear Trends", icon: "fa-solid fa-fire", url: "/products.html?filter=trending&search=Streetwear", search: "Streetwear" },
                { name: "Oversized Fits", icon: "fa-solid fa-expand", url: "/products.html?filter=trending&search=Oversized", search: "Oversized" },
                { name: "Cargo & Utility", icon: "fa-solid fa-box-archive", url: "/products.html?category=Pants&search=Cargo", catKey: "pants", search: "Cargo" },
                { name: "Retro Vintage", icon: "fa-solid fa-compass", url: "/products.html?filter=trending&search=Vintage", search: "Vintage" },
                { name: "Minimalist Fits", icon: "fa-solid fa-circle-check", url: "/products.html?filter=trending&search=Minimal", search: "Minimal" }
            ]
        },
        "featured": {
            name: "Featured Products",
            banner: {
                title: "Featured for You — Crafted with Precision, Designed for Elegance.",
                subtitle: "Handcrafted Pieces Selected by Our Stylists.",
                btnText: "View All",
                btnUrl: "/products.html?filter=featured",
                images: ["/images/jacket2.jpg", "/images/shirt4.jpg", "/images/tshirt4.jpg"]
            },
            subcategories: [
                { name: "All Featured", icon: "fa-solid fa-star", url: "/products.html?filter=featured", filterKey: "featured" },
                { name: "Editor's Pick", icon: "fa-solid fa-award", url: "/products.html?filter=featured&search=Editor", search: "Editor" },
                { name: "Premium Luxury", icon: "fa-solid fa-crown", url: "/products.html?filter=featured&search=Premium", search: "Premium" },
                { name: "Signature Leather", icon: "fa-solid fa-shield-halved", url: "/products.html?category=Jackets&filter=featured", catKey: "jackets" },
                { name: "Exclusive Releases", icon: "fa-solid fa-gem", url: "/products.html?filter=featured&search=Exclusive", search: "Exclusive" },
                { name: "Runway Looks", icon: "fa-solid fa-person-walking", url: "/products.html?filter=featured&search=Runway", search: "Runway" }
            ]
        },
        "sale": {
            name: "Sale / Offers",
            banner: {
                title: "Sale & Offers for You — Crafted with Precision, Designed for Elegance.",
                subtitle: "Unbeatable Discounts, Flash Deals & Value Packs.",
                btnText: "View All",
                btnUrl: "/products.html?filter=sale",
                images: ["/images/pants cargo.jpg", "/images/tshirt5.jpg", "/images/shirt6.jpg"]
            },
            subcategories: [
                { name: "All Sale Items", icon: "fa-solid fa-tag", url: "/products.html?filter=sale", filterKey: "sale" },
                { name: "Flat 40% - 50% Off", icon: "fa-solid fa-percent", url: "/products.html?filter=sale&search=Discount", search: "Discount" },
                { name: "Under ₹799 Deals", icon: "fa-solid fa-tags", url: "/products.html?price=0-500", priceKey: "0-500" },
                { name: "Buy 1 Get 1", icon: "fa-solid fa-gift", url: "/products.html?filter=sale&search=Combo", search: "Combo" },
                { name: "Clearance Outlet", icon: "fa-solid fa-fire", url: "/products.html?filter=sale&search=Clearance", search: "Clearance" },
                { name: "Coupon WELCOME10", icon: "fa-solid fa-ticket", url: "/products.html?filter=sale", filterKey: "sale" }
            ]
        }
    };

    // Sidebar Filter Tabs Data for Shop
    const shopSidebarTabs = {
        "price": {
            banner: {
                title: "Prices for You — Crafted with Precision, Designed for Elegance.",
                subtitle: "Explore 3500+ Styles for Every Budget.",
                btnText: "View All Deals",
                btnUrl: "/products.html",
                images: ["/images/shirt2.jpg", "/images/tshirt1.jpg", "/images/jacket1.jpg"]
            },
            items: [
                { name: "Under ₹500", icon: "fa-solid fa-tag", url: "/products.html?price=0-500", priceKey: "0-500" },
                { name: "₹500 – ₹1000", icon: "fa-solid fa-tags", url: "/products.html?price=500-1000", priceKey: "500-1000" },
                { name: "₹1000 – ₹2000", icon: "fa-solid fa-indian-rupee-sign", url: "/products.html?price=1000-2000", priceKey: "1000-2000" },
                { name: "Above ₹2000", icon: "fa-solid fa-coins", url: "/products.html?price=2000+", priceKey: "2000+" },
                { name: "Luxury Selection", icon: "fa-solid fa-crown", url: "/products.html?price=2000+", priceKey: "2000+" }
            ]
        },
        "occasion": {
            banner: {
                title: "Occasions for You — Crafted with Precision, Designed for Elegance.",
                subtitle: "Explore 3500+ Curated Occasion Looks.",
                btnText: "View All Looks",
                btnUrl: "/products.html",
                images: ["/images/jacket2.jpg", "/images/shirt3.jpg", "/images/pants cargo.jpg"]
            },
            items: [
                { name: "Casual Everyday", icon: "fa-solid fa-mug-saucer", url: "/products.html?search=Casual", search: "Casual" },
                { name: "Office & Formal", icon: "fa-solid fa-briefcase", url: "/products.html?search=Formal", search: "Formal" },
                { name: "Party & Night Out", icon: "fa-solid fa-champagne-glasses", url: "/products.html?search=Party", search: "Party" },
                { name: "Sports & Active", icon: "fa-solid fa-person-running", url: "/products.html?search=Sports", search: "Sports" },
                { name: "Weekend Travel", icon: "fa-solid fa-umbrella-beach", url: "/products.html?search=Weekend", search: "Weekend" },
                { name: "Festive Celebrations", icon: "fa-solid fa-sparkles", url: "/products.html?search=Festive", search: "Festive" }
            ]
        },
        "gender": {
            banner: {
                title: "Wardrobe for You — Crafted with Precision, Designed for Elegance.",
                subtitle: "Explore 3500+ Styles for Everyone.",
                btnText: "Explore All",
                btnUrl: "/products.html",
                images: ["/images/tshirt2.jpg", "/images/shirt4.jpg", "/images/jacket3.jpg"]
            },
            items: [
                { name: "Men's Collection", icon: "fa-solid fa-person", url: "/products.html?search=Men", search: "Men" },
                { name: "Women's Collection", icon: "fa-solid fa-person-dress", url: "/products.html?search=Women", search: "Women" },
                { name: "Unisex Styles", icon: "fa-solid fa-people-group", url: "/products.html?search=Unisex", search: "Unisex" },
                { name: "College & Youth", icon: "fa-solid fa-graduation-cap", url: "/products.html?search=College", search: "College" },
                { name: "Kids Fashion", icon: "fa-solid fa-child-reaching", url: "/products.html?search=Kids", search: "Kids" }
            ]
        },
        "deals": {
            banner: {
                title: "Deals for You — Crafted with Precision, Designed for Elegance.",
                subtitle: "Special Promotional Offers & Flash Discounts.",
                btnText: "Shop All Deals",
                btnUrl: "/products.html?filter=sale",
                images: ["/images/shirt5.jpg", "/images/jacket5.jpg", "/images/tshirt5.jpg"]
            },
            items: [
                { name: "Flat 50% Off", icon: "fa-solid fa-percent", url: "/products.html?filter=sale&search=Discount", search: "Discount" },
                { name: "Buy 1 Get 1", icon: "fa-solid fa-gift", url: "/products.html?filter=sale&search=Combo", search: "Combo" },
                { name: "Clearance Outlet", icon: "fa-solid fa-fire", url: "/products.html?filter=sale&search=Clearance", search: "Clearance" },
                { name: "Under ₹999 Steals", icon: "fa-solid fa-tags", url: "/products.html?price=500-1000", priceKey: "500-1000" },
                { name: "Coupon WELCOME10", icon: "fa-solid fa-ticket", url: "/products.html?filter=sale", filterKey: "sale" },
                { name: "Seasonal Flash Deals", icon: "fa-solid fa-bolt", url: "/products.html?filter=sale", filterKey: "sale" }
            ]
        }
    };


    // ------------------------------------------------------------
    // 3. WISHLIST DATA & CONFIGURATION
    // ------------------------------------------------------------
    const wishlistData = [
        { name: "My Wishlist", icon: "fa-solid fa-heart", url: "/wishlist.html", key: "my-wishlist" },
        { name: "Wishlist History", icon: "fa-solid fa-clock-rotate-left", url: "/wishlist.html?view=history", key: "wishlist-history" }
    ];


    // ------------------------------------------------------------
    // INITIALIZATION FUNCTION
    // ------------------------------------------------------------
    function initSubNavPopups() {
        const navbar = document.querySelector(".navbar");
        if (!navbar) return;

        const urlParams = new URLSearchParams(window.location.search);
        const currentCategory = (urlParams.get("category") || "").toLowerCase();
        const currentFilter = (urlParams.get("filter") || "").toLowerCase();
        const currentView = (urlParams.get("view") || "").toLowerCase();
        const isCategoriesPage = window.location.pathname.includes("categories.html");
        const isProductsPage = window.location.pathname.includes("products.html");
        const isWishlistPage = window.location.pathname.includes("wishlist.html");

        // ------------------------------------------------------------
        // CATEGORIES MEGA-MENU SETUP
        // ------------------------------------------------------------
        let activeCategoryKey = "all";
        if (currentCategory) {
            const matched = categoriesData.find(c => c.key === currentCategory || c.name.toLowerCase() === currentCategory);
            if (matched) activeCategoryKey = matched.key;
        }
        let activeCategoryTab = "category";

        function buildCatTopTrackHTML(selectedKey) {
            let html = "";
            categoriesData.forEach(function (cat) {
                const isActive = (cat.key === selectedKey);
                html += `
                    <a href="${resolveAppUrl(cat.url)}" class="cat-top-item ${isActive ? "active" : ""}" data-key="${cat.key}" data-name="${cat.name}">
                        <i class="${cat.icon}"></i>
                        <span>${cat.name}</span>
                    </a>
                `;
            });
            return html;
        }

        function buildCatGridHTML(tabType, catKey) {
            let items = [];
            if (tabType === "category") {
                const details = categoryDetails[catKey] || categoryDetails["all"];
                items = details.subcategories || [];
            } else if (categorySidebarTabs[tabType]) {
                items = categorySidebarTabs[tabType].items || [];
            }

            let html = "";
            items.forEach(function (item) {
                html += `
                    <a href="${resolveAppUrl(item.url)}" class="cat-sub-item" 
                       data-cat-key="${item.catKey || ''}" 
                       data-name="${item.name}" 
                       data-search="${item.search || ''}" 
                       data-price-key="${item.priceKey || ''}">
                        <div class="cat-sub-badge">
                            <i class="${item.icon}"></i>
                        </div>
                        <span class="cat-sub-title">${item.name}</span>
                    </a>
                `;
            });
            return html;
        }

        function getCatBannerData(tabType, catKey) {
            if (tabType === "category") {
                const details = categoryDetails[catKey] || categoryDetails["all"];
                return details.banner;
            } else if (categorySidebarTabs[tabType]) {
                return categorySidebarTabs[tabType].banner;
            }
            return categoryDetails["all"].banner;
        }

        const initialCatBanner = getCatBannerData(activeCategoryTab, activeCategoryKey);
        const catThumbsHTML = (initialCatBanner.images || []).map(img => `<img src="${resolveAppImg(img)}" alt="Preview" class="cat-promo-img" onerror="this.onerror=null;this.src='${resolveAppImg("/images/shirt2.jpg")}';">`).join("");

        const catBarHTML = `
        <div class="cat-scroll-wrapper collapsed" id="catScrollWrapper" data-popup="categories">
            <!-- 1. Top Category Navigation Strip -->
            <div class="cat-top-bar">
                <div class="cat-top-container">
                    <div class="cat-top-track" id="catTopTrack">
                        ${buildCatTopTrackHTML(activeCategoryKey)}
                    </div>
                </div>
            </div>

            <!-- 2. Category Mega-Menu Body -->
            <div class="cat-mega-panel" id="catMegaPanel">
                <div class="cat-mega-inner">
                    <!-- Left Sidebar Tabs -->
                    <div class="cat-sidebar-tabs" id="catSidebarTabs">
                        <button type="button" class="cat-sidebar-tab active" data-tab="category">Category</button>
                        <button type="button" class="cat-sidebar-tab" data-tab="price">Price</button>
                        <button type="button" class="cat-sidebar-tab" data-tab="occasion">Occasion</button>
                        <button type="button" class="cat-sidebar-tab" data-tab="gender">Gender</button>
                        <button type="button" class="cat-sidebar-tab" data-tab="style">Fit & Style</button>
                    </div>

                    <!-- Right Content Area -->
                    <div class="cat-content-area">
                        <!-- Subcategory 3-Column Grid -->
                        <div class="cat-grid-container" id="catGridContainer">
                            ${buildCatGridHTML(activeCategoryTab, activeCategoryKey)}
                        </div>

                        <!-- Bottom Promotional Banner Card -->
                        <div class="cat-promo-card" id="catPromoCard">
                            <div class="cat-promo-left">
                                <div class="cat-promo-thumbs" id="catPromoThumbs">
                                    ${catThumbsHTML}
                                </div>
                            </div>
                            <div class="cat-promo-middle">
                                <h4 class="cat-promo-title" id="catPromoTitle">${initialCatBanner.title}</h4>
                                <p class="cat-promo-subtitle" id="catPromoSubtitle">${initialCatBanner.subtitle}</p>
                            </div>
                            <div class="cat-promo-right">
                                <a href="${initialCatBanner.btnUrl}" class="cat-promo-btn" id="catPromoBtn">${initialCatBanner.btnText}</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;


        // ------------------------------------------------------------
        // SHOP MEGA-MENU SETUP (Matching Luxury Image 2 Design)
        // ------------------------------------------------------------
        let activeShopKey = "all-products";
        if (currentFilter) {
            const matched = shopData.find(s => s.key === currentFilter);
            if (matched) activeShopKey = matched.key;
        }
        let activeShopTab = "collection";

        function buildShopTopTrackHTML(selectedKey) {
            let html = "";
            shopData.forEach(function (item) {
                const isActive = (item.key === selectedKey);
                html += `
                    <a href="${resolveAppUrl(item.url)}" class="cat-top-item ${isActive ? "active" : ""}" data-key="${item.key}" data-name="${item.name}">
                        <i class="${item.icon}"></i>
                        <span>${item.name}</span>
                    </a>
                `;
            });
            return html;
        }

        function buildShopGridHTML(tabType, shopKey) {
            let items = [];
            if (tabType === "collection") {
                const details = shopDetails[shopKey] || shopDetails["all-products"];
                items = details.subcategories || [];
            } else if (shopSidebarTabs[tabType]) {
                items = shopSidebarTabs[tabType].items || [];
            }

            let html = "";
            items.forEach(function (item) {
                html += `
                    <a href="${resolveAppUrl(item.url)}" class="cat-sub-item" 
                       data-cat-key="${item.catKey || ''}" 
                       data-filter-key="${item.filterKey || ''}" 
                       data-name="${item.name}" 
                       data-search="${item.search || ''}" 
                       data-price-key="${item.priceKey || ''}">
                        <div class="cat-sub-badge">
                            <i class="${item.icon}"></i>
                        </div>
                        <span class="cat-sub-title">${item.name}</span>
                    </a>
                `;
            });
            return html;
        }

        function getShopBannerData(tabType, shopKey) {
            if (tabType === "collection") {
                const details = shopDetails[shopKey] || shopDetails["all-products"];
                return details.banner;
            } else if (shopSidebarTabs[tabType]) {
                return shopSidebarTabs[tabType].banner;
            }
            return shopDetails["all-products"].banner;
        }

        const initialShopBanner = getShopBannerData(activeShopTab, activeShopKey);
        const shopThumbsHTML = (initialShopBanner.images || []).map(img => `<img src="${resolveAppImg(img)}" alt="Preview" class="cat-promo-img" onerror="this.onerror=null;this.src='${resolveAppImg("/images/shirt2.jpg")}';">`).join("");

        const shopBarHTML = `
        <div class="cat-scroll-wrapper collapsed" id="shopScrollWrapper" data-popup="shop">
            <!-- 1. Top Shop Navigation Strip -->
            <div class="cat-top-bar">
                <div class="cat-top-container">
                    <div class="cat-top-track" id="shopTopTrack">
                        ${buildShopTopTrackHTML(activeShopKey)}
                    </div>
                </div>
            </div>

            <!-- 2. Shop Mega-Menu Body -->
            <div class="cat-mega-panel" id="shopMegaPanel">
                <div class="cat-mega-inner">
                    <!-- Left Sidebar Tabs -->
                    <div class="cat-sidebar-tabs" id="shopSidebarTabs">
                        <button type="button" class="cat-sidebar-tab active" data-tab="collection">Collection</button>
                        <button type="button" class="cat-sidebar-tab" data-tab="price">Price</button>
                        <button type="button" class="cat-sidebar-tab" data-tab="occasion">Occasion</button>
                        <button type="button" class="cat-sidebar-tab" data-tab="gender">Gender</button>
                        <button type="button" class="cat-sidebar-tab" data-tab="deals">Deals & Offers</button>
                    </div>

                    <!-- Right Content Area -->
                    <div class="cat-content-area">
                        <!-- Subcategory 3-Column Grid -->
                        <div class="cat-grid-container" id="shopGridContainer">
                            ${buildShopGridHTML(activeShopTab, activeShopKey)}
                        </div>

                        <!-- Bottom Promotional Banner Card -->
                        <div class="cat-promo-card" id="shopPromoCard">
                            <div class="cat-promo-left">
                                <div class="cat-promo-thumbs" id="shopPromoThumbs">
                                    ${shopThumbsHTML}
                                </div>
                            </div>
                            <div class="cat-promo-middle">
                                <h4 class="cat-promo-title" id="shopPromoTitle">${initialShopBanner.title}</h4>
                                <p class="cat-promo-subtitle" id="shopPromoSubtitle">${initialShopBanner.subtitle}</p>
                            </div>
                            <div class="cat-promo-right">
                                <a href="${initialShopBanner.btnUrl}" class="cat-promo-btn" id="shopPromoBtn">${initialShopBanner.btnText}</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;


        // ------------------------------------------------------------
        // WISHLIST POPUP SETUP (Single-Row Bar)
        // ------------------------------------------------------------
        let wishlistItemsHTML = "";
        wishlistData.forEach(function (item) {
            const isActive = isWishlistPage && (
                (currentView === "history" && item.key === "wishlist-history") ||
                (currentView !== "history" && item.key === "my-wishlist")
            );

            wishlistItemsHTML += `
                <a href="${resolveAppUrl(item.url)}" class="cat-scroll-item ${isActive ? "active" : ""}" data-wishlist-item="${item.name}" data-key="${item.key}">
                    <i class="${item.icon}"></i>
                    <span>${item.name}</span>
                </a>
            `;
        });

        const wishlistBarHTML = `
        <div class="cat-scroll-wrapper collapsed" id="wishlistScrollWrapper" data-popup="wishlist">
            <div class="cat-scroll-container">
                <div class="cat-scroll-track" id="wishlistScrollTrack">
                    ${wishlistItemsHTML}
                </div>
            </div>
        </div>
        `;

        // Insert into DOM after navbar
        if (!document.getElementById("catScrollWrapper")) {
            navbar.insertAdjacentHTML("afterend", catBarHTML);
        }
        if (!document.getElementById("shopScrollWrapper")) {
            navbar.insertAdjacentHTML("afterend", shopBarHTML);
        }
        if (!document.getElementById("wishlistScrollWrapper")) {
            navbar.insertAdjacentHTML("afterend", wishlistBarHTML);
        }

        const catWrapper = document.getElementById("catScrollWrapper");
        const shopWrapper = document.getElementById("shopScrollWrapper");
        const wishlistWrapper = document.getElementById("wishlistScrollWrapper");

        const catTopTrack = document.getElementById("catTopTrack");
        const shopTopTrack = document.getElementById("shopTopTrack");
        const wishlistTrack = document.getElementById("wishlistScrollTrack");

        // Keep popup tops aligned flush with navbar bottom
        function updatePositions() {
            if (!navbar) return;
            const rect = navbar.getBoundingClientRect();
            const topPx = `${Math.round(rect.bottom)}px`;
            if (catWrapper) catWrapper.style.top = topPx;
            if (shopWrapper) shopWrapper.style.top = topPx;
            if (wishlistWrapper) wishlistWrapper.style.top = topPx;
        }
        updatePositions();
        window.addEventListener("resize", updatePositions);
        window.addEventListener("scroll", updatePositions, { passive: true });

        // Wheel scroll support on horizontal tracks
        [catTopTrack, shopTopTrack, wishlistTrack].forEach(function (track) {
            if (track) {
                track.addEventListener("wheel", function (e) {
                    if (e.deltaY !== 0) {
                        e.preventDefault();
                        track.scrollLeft += e.deltaY;
                    }
                }, { passive: false });
            }
        });


        // ------------------------------------------------------------
        // CATEGORIES MEGA-MENU LOGIC & LISTENERS
        // ------------------------------------------------------------
        const catGridContainer = document.getElementById("catGridContainer");
        const catPromoTitle = document.getElementById("catPromoTitle");
        const catPromoSubtitle = document.getElementById("catPromoSubtitle");
        const catPromoBtn = document.getElementById("catPromoBtn");
        const catPromoThumbs = document.getElementById("catPromoThumbs");
        const catSidebarTabsContainer = document.getElementById("catSidebarTabs");

        function updateCatMegaContent() {
            if (catGridContainer) {
                catGridContainer.innerHTML = buildCatGridHTML(activeCategoryTab, activeCategoryKey);
                attachCatSubItemListeners();
            }

            const banner = getCatBannerData(activeCategoryTab, activeCategoryKey);
            if (banner) {
                if (catPromoTitle) catPromoTitle.textContent = banner.title;
                if (catPromoSubtitle) catPromoSubtitle.textContent = banner.subtitle;
                if (catPromoBtn) {
                    catPromoBtn.textContent = banner.btnText;
                    catPromoBtn.href = resolveAppUrl(banner.btnUrl);
                }
                if (catPromoThumbs) {
                    catPromoThumbs.innerHTML = (banner.images || []).map(img => `<img src="${resolveAppImg(img)}" alt="Preview" class="cat-promo-img" onerror="this.onerror=null;this.src='${resolveAppImg("/images/shirt2.jpg")}';">`).join("");
                }
            }
        }

        function attachCatTopTrackListeners() {
            if (!catTopTrack) return;
            const topItems = catTopTrack.querySelectorAll(".cat-top-item");
            topItems.forEach(function (item) {
                const catKey = item.getAttribute("data-key");
                const catName = item.getAttribute("data-name");

                item.addEventListener("mouseenter", function () {
                    activeCategoryKey = catKey;
                    topItems.forEach(ti => ti.classList.remove("active"));
                    item.classList.add("active");

                    if (activeCategoryTab !== "category" && catSidebarTabsContainer) {
                        activeCategoryTab = "category";
                        catSidebarTabsContainer.querySelectorAll(".cat-sidebar-tab").forEach(tb => {
                            if (tb.getAttribute("data-tab") === "category") tb.classList.add("active");
                            else tb.classList.remove("active");
                        });
                    }
                    updateCatMegaContent();
                });

                item.addEventListener("click", function (e) {
                    if (isCategoriesPage && catName !== "All Categories") {
                        const targetCard = document.querySelector(`.category-card[data-category="${catName}"]`);
                        if (targetCard) {
                            e.preventDefault();
                            targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
                            targetCard.style.outline = "2px solid #832729";
                            targetCard.style.transition = "outline 0.3s ease";
                            setTimeout(() => { targetCard.style.outline = "none"; }, 1500);
                            scheduleClose();
                            return;
                        }
                    }

                    const categoryFilter = document.getElementById("categoryFilter");
                    if (isProductsPage && categoryFilter) {
                        e.preventDefault();
                        categoryFilter.value = catKey;
                        categoryFilter.dispatchEvent(new Event("change"));

                        const newUrl = catKey === "all" ? "/products.html" : `/products.html?category=${encodeURIComponent(catName)}`;
                        window.history.pushState({ category: catKey }, "", newUrl);

                        const productContainer = document.getElementById("productContainer") || document.getElementById("product-container");
                        if (productContainer) {
                            const rect = productContainer.getBoundingClientRect();
                            if (rect.top < 0 || rect.top > window.innerHeight) {
                                window.scrollTo({ top: productContainer.offsetTop - 120, behavior: "smooth" });
                            }
                        }
                        setTimeout(scheduleClose, 300);
                        return;
                    }
                });
            });
        }
        attachCatTopTrackListeners();

        if (catSidebarTabsContainer) {
            const tabs = catSidebarTabsContainer.querySelectorAll(".cat-sidebar-tab");
            tabs.forEach(function (tab) {
                tab.addEventListener("click", function (e) {
                    e.preventDefault();
                    tabs.forEach(t => t.classList.remove("active"));
                    tab.classList.add("active");
                    activeCategoryTab = tab.getAttribute("data-tab");
                    updateCatMegaContent();
                });
            });
        }

        function attachCatSubItemListeners() {
            if (!catGridContainer) return;
            const subItems = catGridContainer.querySelectorAll(".cat-sub-item");
            subItems.forEach(function (subItem) {
                subItem.addEventListener("click", function (e) {
                    const catKey = subItem.getAttribute("data-cat-key");
                    const itemName = subItem.getAttribute("data-name");
                    const searchTerm = subItem.getAttribute("data-search");
                    const priceKey = subItem.getAttribute("data-price-key");

                    if (isProductsPage) {
                        const categoryFilter = document.getElementById("categoryFilter");
                        const searchInput = document.getElementById("searchInput");
                        const priceFilter = document.getElementById("priceFilter");

                        if (catKey && categoryFilter) {
                            e.preventDefault();
                            categoryFilter.value = catKey;
                            if (searchInput) searchInput.value = searchTerm || "";
                            categoryFilter.dispatchEvent(new Event("change"));
                            setTimeout(scheduleClose, 300);
                            return;
                        } else if (searchTerm && searchInput) {
                            e.preventDefault();
                            searchInput.value = searchTerm;
                            if (typeof window.applyFilters === "function") window.applyFilters();
                            else searchInput.dispatchEvent(new Event("input"));
                            setTimeout(scheduleClose, 300);
                            return;
                        } else if (priceKey && priceFilter) {
                            e.preventDefault();
                            priceFilter.value = priceKey;
                            priceFilter.dispatchEvent(new Event("change"));
                            setTimeout(scheduleClose, 300);
                            return;
                        }
                    }

                    if (isCategoriesPage && itemName && itemName !== "All Categories") {
                        const targetCard = document.querySelector(`.category-card[data-category="${itemName}"]`);
                        if (targetCard) {
                            e.preventDefault();
                            targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
                            targetCard.style.outline = "2px solid #832729";
                            targetCard.style.transition = "outline 0.3s ease";
                            setTimeout(() => { targetCard.style.outline = "none"; }, 1500);
                            scheduleClose();
                            return;
                        }
                    }
                });
            });
        }
        attachCatSubItemListeners();


        // ------------------------------------------------------------
        // SHOP MEGA-MENU LOGIC & LISTENERS
        // ------------------------------------------------------------
        const shopGridContainer = document.getElementById("shopGridContainer");
        const shopPromoTitle = document.getElementById("shopPromoTitle");
        const shopPromoSubtitle = document.getElementById("shopPromoSubtitle");
        const shopPromoBtn = document.getElementById("shopPromoBtn");
        const shopPromoThumbs = document.getElementById("shopPromoThumbs");
        const shopSidebarTabsContainer = document.getElementById("shopSidebarTabs");

        function updateShopMegaContent() {
            if (shopGridContainer) {
                shopGridContainer.innerHTML = buildShopGridHTML(activeShopTab, activeShopKey);
                attachShopSubItemListeners();
            }

            const banner = getShopBannerData(activeShopTab, activeShopKey);
            if (banner) {
                if (shopPromoTitle) shopPromoTitle.textContent = banner.title;
                if (shopPromoSubtitle) shopPromoSubtitle.textContent = banner.subtitle;
                if (shopPromoBtn) {
                    shopPromoBtn.textContent = banner.btnText;
                    shopPromoBtn.href = resolveAppUrl(banner.btnUrl);
                }
                if (shopPromoThumbs) {
                    shopPromoThumbs.innerHTML = (banner.images || []).map(img => `<img src="${resolveAppImg(img)}" alt="Preview" class="cat-promo-img" onerror="this.onerror=null;this.src='${resolveAppImg("/images/shirt2.jpg")}';">`).join("");
                }
            }
        }

        function attachShopTopTrackListeners() {
            if (!shopTopTrack) return;
            const topItems = shopTopTrack.querySelectorAll(".cat-top-item");
            topItems.forEach(function (item) {
                const shopKey = item.getAttribute("data-key");
                const targetUrl = item.getAttribute("href");

                item.addEventListener("mouseenter", function () {
                    activeShopKey = shopKey;
                    topItems.forEach(ti => ti.classList.remove("active"));
                    item.classList.add("active");

                    if (activeShopTab !== "collection" && shopSidebarTabsContainer) {
                        activeShopTab = "collection";
                        shopSidebarTabsContainer.querySelectorAll(".cat-sidebar-tab").forEach(tb => {
                            if (tb.getAttribute("data-tab") === "collection") tb.classList.add("active");
                            else tb.classList.remove("active");
                        });
                    }
                    updateShopMegaContent();
                });

                item.addEventListener("click", function (e) {
                    if (isProductsPage) {
                        e.preventDefault();
                        if (shopKey === "all-products") {
                            window.currentShopFilter = "";
                            const categoryFilter = document.getElementById("categoryFilter");
                            if (categoryFilter) categoryFilter.value = "all";
                            const searchInput = document.getElementById("searchInput");
                            if (searchInput) searchInput.value = "";
                        } else {
                            window.currentShopFilter = shopKey;
                        }

                        if (typeof window.applyFilters === "function") {
                            window.applyFilters();
                        } else {
                            const categoryFilter = document.getElementById("categoryFilter");
                            if (categoryFilter) categoryFilter.dispatchEvent(new Event("change"));
                        }

                        window.history.pushState({ filter: shopKey }, "", targetUrl);

                        const productContainer = document.getElementById("productContainer") || document.getElementById("product-container");
                        if (productContainer) {
                            const rect = productContainer.getBoundingClientRect();
                            if (rect.top < 0 || rect.top > window.innerHeight) {
                                window.scrollTo({ top: productContainer.offsetTop - 120, behavior: "smooth" });
                            }
                        }
                        setTimeout(scheduleClose, 300);
                        return;
                    }
                });
            });
        }
        attachShopTopTrackListeners();

        if (shopSidebarTabsContainer) {
            const tabs = shopSidebarTabsContainer.querySelectorAll(".cat-sidebar-tab");
            tabs.forEach(function (tab) {
                tab.addEventListener("click", function (e) {
                    e.preventDefault();
                    tabs.forEach(t => t.classList.remove("active"));
                    tab.classList.add("active");
                    activeShopTab = tab.getAttribute("data-tab");
                    updateShopMegaContent();
                });
            });
        }

        function attachShopSubItemListeners() {
            if (!shopGridContainer) return;
            const subItems = shopGridContainer.querySelectorAll(".cat-sub-item");
            subItems.forEach(function (subItem) {
                subItem.addEventListener("click", function (e) {
                    const filterKey = subItem.getAttribute("data-filter-key");
                    const catKey = subItem.getAttribute("data-cat-key");
                    const searchTerm = subItem.getAttribute("data-search");
                    const priceKey = subItem.getAttribute("data-price-key");
                    const targetUrl = subItem.getAttribute("href");

                    if (isProductsPage) {
                        e.preventDefault();
                        const categoryFilter = document.getElementById("categoryFilter");
                        const searchInput = document.getElementById("searchInput");
                        const priceFilter = document.getElementById("priceFilter");

                        if (filterKey) {
                            if (filterKey === "all-products") {
                                window.currentShopFilter = "";
                                if (categoryFilter) categoryFilter.value = "all";
                                if (searchInput) searchInput.value = "";
                            } else {
                                window.currentShopFilter = filterKey;
                            }
                        }
                        if (catKey && categoryFilter) {
                            categoryFilter.value = catKey;
                        }
                        if (priceKey && priceFilter) {
                            priceFilter.value = priceKey;
                        }
                        if (searchTerm && searchInput) {
                            searchInput.value = searchTerm;
                        }

                        if (typeof window.applyFilters === "function") {
                            window.applyFilters();
                        } else {
                            if (categoryFilter) categoryFilter.dispatchEvent(new Event("change"));
                            else if (searchInput) searchInput.dispatchEvent(new Event("input"));
                        }

                        window.history.pushState({}, "", targetUrl);

                        const productContainer = document.getElementById("productContainer") || document.getElementById("product-container");
                        if (productContainer) {
                            const rect = productContainer.getBoundingClientRect();
                            if (rect.top < 0 || rect.top > window.innerHeight) {
                                window.scrollTo({ top: productContainer.offsetTop - 120, behavior: "smooth" });
                            }
                        }
                        setTimeout(scheduleClose, 300);
                        return;
                    }
                });
            });
        }
        attachShopSubItemListeners();


        // ------------------------------------------------------------
        // WISHLIST CLICK LISTENERS
        // ------------------------------------------------------------
        if (wishlistWrapper) {
            const wishlistItems = wishlistWrapper.querySelectorAll(".cat-scroll-item");
            wishlistItems.forEach(function (item) {
                item.addEventListener("click", function (e) {
                    const itemKey = item.getAttribute("data-key");
                    const targetUrl = item.getAttribute("href");

                    if (isWishlistPage) {
                        e.preventDefault();
                        wishlistItems.forEach(si => si.classList.remove("active"));
                        item.classList.add("active");

                        const viewType = itemKey === "wishlist-history" ? "history" : "active";
                        if (typeof window.loadWishlistView === "function") {
                            window.loadWishlistView(viewType);
                        }

                        window.history.pushState({ view: viewType }, "", targetUrl);
                        setTimeout(scheduleClose, 300);
                        return;
                    }
                });
            });
        }


        // ------------------------------------------------------------
        // HOVER & POPUP CONTROLLER
        // ------------------------------------------------------------
        let closeTimer = null;

        const catLinks = navbar.querySelectorAll('a[href*="categories"]');
        const shopLinks = Array.from(navbar.querySelectorAll('a.nav-link')).filter(function (l) {
            const text = (l.textContent || "").trim().toLowerCase();
            const href = l.getAttribute("href") || "";
            return text.includes("shop") || href.includes("products.html");
        });
        const wishlistLinks = Array.from(navbar.querySelectorAll('a.nav-link')).filter(function (l) {
            const text = (l.textContent || "").trim().toLowerCase();
            const href = l.getAttribute("href") || "";
            return text.includes("wishlist") || href.includes("wishlist.html");
        });

        function addChevron(link) {
            if (!link.querySelector(".nav-cat-chevron")) {
                const chevron = document.createElement("i");
                chevron.className = "fa-solid fa-chevron-down nav-cat-chevron";
                link.appendChild(chevron);
            }
        }

        catLinks.forEach(addChevron);
        shopLinks.forEach(addChevron);
        wishlistLinks.forEach(addChevron);

        const configs = [
            { type: "categories", wrapper: catWrapper, links: catLinks },
            { type: "shop", wrapper: shopWrapper, links: shopLinks },
            { type: "wishlist", wrapper: wishlistWrapper, links: wishlistLinks }
        ];

        function openPopup(type) {
            clearTimeout(closeTimer);
            updatePositions();

            configs.forEach(cfg => {
                if (cfg.type === type) {
                    if (cfg.wrapper) cfg.wrapper.classList.remove("collapsed");
                    cfg.links.forEach(l => l.classList.add("cat-bar-open"));
                } else {
                    if (cfg.wrapper) cfg.wrapper.classList.add("collapsed");
                    cfg.links.forEach(l => l.classList.remove("cat-bar-open"));
                }
            });
        }

        function scheduleClose() {
            clearTimeout(closeTimer);
            closeTimer = setTimeout(function () {
                configs.forEach(cfg => {
                    if (cfg.wrapper) cfg.wrapper.classList.add("collapsed");
                    cfg.links.forEach(l => l.classList.remove("cat-bar-open"));
                });
            }, 260);
        }

        // CATEGORIES NAV LINK LISTENERS
        catLinks.forEach(function (catLink) {
            catLink.addEventListener("mouseenter", function () { openPopup("categories"); });
            catLink.addEventListener("mousemove", function () { openPopup("categories"); });
            catLink.addEventListener("mouseleave", scheduleClose);
            catLink.addEventListener("click", function (e) {
                e.preventDefault();
                if (catWrapper && catWrapper.classList.contains("collapsed")) {
                    openPopup("categories");
                } else {
                    scheduleClose();
                }
            });
        });

        // SHOP NAV LINK LISTENERS
        shopLinks.forEach(function (shopLink) {
            shopLink.addEventListener("mouseenter", function () { openPopup("shop"); });
            shopLink.addEventListener("mousemove", function () { openPopup("shop"); });
            shopLink.addEventListener("mouseleave", scheduleClose);
            shopLink.addEventListener("click", function (e) {
                e.preventDefault();
                if (shopWrapper && shopWrapper.classList.contains("collapsed")) {
                    openPopup("shop");
                } else {
                    scheduleClose();
                }
            });
        });

        // WISHLIST NAV LINK LISTENERS
        wishlistLinks.forEach(function (wLink) {
            wLink.addEventListener("mouseenter", function () { openPopup("wishlist"); });
            wLink.addEventListener("mousemove", function () { openPopup("wishlist"); });
            wLink.addEventListener("mouseleave", scheduleClose);
            wLink.addEventListener("click", function (e) {
                if (wishlistWrapper && wishlistWrapper.classList.contains("collapsed")) {
                    e.preventDefault();
                    openPopup("wishlist");
                }
            });
        });

        // KEEP OPEN ON POPUP HOVER
        if (catWrapper) {
            catWrapper.addEventListener("mouseenter", function () { openPopup("categories"); });
            catWrapper.addEventListener("mousemove", function () { openPopup("categories"); });
            catWrapper.addEventListener("mouseleave", scheduleClose);
        }

        if (shopWrapper) {
            shopWrapper.addEventListener("mouseenter", function () { openPopup("shop"); });
            shopWrapper.addEventListener("mousemove", function () { openPopup("shop"); });
            shopWrapper.addEventListener("mouseleave", scheduleClose);
        }

        if (wishlistWrapper) {
            wishlistWrapper.addEventListener("mouseenter", function () { openPopup("wishlist"); });
            wishlistWrapper.addEventListener("mousemove", function () { openPopup("wishlist"); });
            wishlistWrapper.addEventListener("mouseleave", scheduleClose);
        }

        // Synchronize category dropdown change on products.html with category horizontal top bar
        if (isProductsPage) {
            const categoryFilter = document.getElementById("categoryFilter");
            if (categoryFilter && catTopTrack) {
                const topItems = catTopTrack.querySelectorAll(".cat-top-item");
                categoryFilter.addEventListener("change", function () {
                    const currentVal = (this.value || "all").toLowerCase();
                    activeCategoryKey = currentVal;
                    topItems.forEach(function (ti) {
                        if (ti.getAttribute("data-key") === currentVal) {
                            ti.classList.add("active");
                            ti.scrollIntoView({ inline: "center", behavior: "smooth" });
                        } else {
                            ti.classList.remove("active");
                        }
                    });
                    updateCatMegaContent();
                });
            }
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initSubNavPopups);
    } else {
        initSubNavPopups();
    }
})();
