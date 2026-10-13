/**
 * GitHub Pages & Static Subfolder Runtime Compatibility Adapter
 * Automatically resolves image URLs, stylesheet paths, and intercepts static API calls
 */
(function () {
    const isGitHub = (typeof window !== "undefined") && (
        window.location.hostname.endsWith("github.io") ||
        window.location.protocol === "file:" ||
        window.location.pathname.includes("/ecommerce-node/")
    );

    if (!isGitHub) return;

    console.log("[GitHub Pages Adapter] Active on:", window.location.pathname);

    // Compute relative prefix based on depth
    const pathParts = window.location.pathname.replace(/\\/g, "/").split("/").filter(Boolean);
    const inAdmin = pathParts.includes("admin");
    const inViews = pathParts.includes("views");
    const prefix = inAdmin ? (inViews ? "../../public/" : "../public/") : (inViews ? "../public/" : "./public/");
    const rootPrefix = inAdmin ? (inViews ? "../../" : "../") : (inViews ? "../" : "./");

    window.__GH_PREFIX = prefix;
    window.__GH_ROOT_PREFIX = rootPrefix;

    function fixUrl(url) {
        if (!url || typeof url !== "string") return url;
        const trimmed = url.trim();
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
            return trimmed;
        }

        // Fix /images/...
        if (trimmed.startsWith("/images/")) {
            return prefix + trimmed.slice(1);
        }
        if (trimmed.startsWith("images/")) {
            return prefix + trimmed;
        }

        // Fix /public/...
        if (trimmed.startsWith("/public/")) {
            return rootPrefix + trimmed.slice(1);
        }

        // Fix /css/... or /js/...
        if (trimmed.startsWith("/css/")) {
            return prefix + trimmed.slice(1);
        }
        if (trimmed.startsWith("/js/")) {
            return prefix + trimmed.slice(1);
        }

        // Fix root page links e.g. /products.html, /login.html
        if (trimmed.startsWith("/") && trimmed.includes(".html")) {
            return rootPrefix + trimmed.slice(1);
        }

        return trimmed;
    }

    window.fixGitHubPagesUrl = fixUrl;

    // 1. Intercept Image prototype 'src' setter
    try {
        const originalSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "src");
        if (originalSrcDescriptor && originalSrcDescriptor.set) {
            Object.defineProperty(HTMLImageElement.prototype, "src", {
                set: function (val) {
                    const fixed = fixUrl(val);
                    return originalSrcDescriptor.set.call(this, fixed);
                },
                get: originalSrcDescriptor.get
            });
        }
    } catch (e) {
        console.warn("[GitHub Pages Adapter] Could not hook HTMLImageElement.src:", e);
    }

    // 2. Global Image error fallback
    window.addEventListener("error", function (e) {
        if (e.target && e.target.tagName === "IMG") {
            const img = e.target;
            const currentSrc = img.getAttribute("src") || "";
            if (currentSrc.includes("/images/") && !currentSrc.includes("public/images/")) {
                const filename = currentSrc.split("/").pop();
                img.src = prefix + "images/" + filename;
            } else if (!img.dataset.ghFallback) {
                img.dataset.ghFallback = "1";
                img.src = prefix + "images/tshirt1.jpg";
            }
        }
    }, true);

    // 3. Mock API responses for static deployment to prevent 404 network errors
    const originalFetch = window.fetch;
    window.fetch = function (resource, init) {
        if (typeof resource === "string") {
            if (resource.startsWith("/api/products") || resource.endsWith("/api/products")) {
                const fallbackList = (typeof DEFAULT_FALLBACK_PRODUCTS !== "undefined" && Array.isArray(DEFAULT_FALLBACK_PRODUCTS))
                    ? DEFAULT_FALLBACK_PRODUCTS
                    : [
                        { id: 61, name: "Premium Luxury T-Shirt", category: "T-Shirts", price: 499, image: prefix + "images/tshirt1.jpg", stock: 95, rating: 4.8 },
                        { id: 62, name: "Designer Embroidered T-Shirt", category: "T-Shirts", price: 699, image: prefix + "images/tshirt2.jpg", stock: 111, rating: 4.9 },
                        { id: 63, name: "Minimalist Round Neck Tee", category: "T-Shirts", price: 450, image: prefix + "images/tshirt3.jpg", stock: 50, rating: 4.5 },
                        { id: 64, name: "Athletic Performance Tee", category: "T-Shirts", price: 599, image: prefix + "images/tshirt4.jpg", stock: 58, rating: 4.8 }
                    ];

                return Promise.resolve(new Response(JSON.stringify({
                    success: true,
                    products: fallbackList
                }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" }
                }));
            }

            
            if (resource.includes("/api/orders")) {
                const demoOrderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
                return Promise.resolve(new Response(JSON.stringify({
                    success: true,
                    orderId: demoOrderId,
                    order_id: demoOrderId,
                    id: demoOrderId,
                    message: "Order placed successfully!"
                }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" }
                }));
            }
            if (resource.includes("/api/admin/dashboard")) {
                return Promise.resolve(new Response(JSON.stringify({
                    success: true,
                    data: { totalOrders: 18, totalProducts: 12, totalUsers: 25, totalRevenue: 48920 }
                }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" }
                }));
            }

            if (resource.includes("/api/admin/inventory")) {
                return Promise.resolve(new Response(JSON.stringify({
                    success: true,
                    summary: { lowStockCount: 2, outOfStockCount: 0 }
                }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" }
                }));
            }

            if (resource.includes("/api/banners")) {
                return Promise.resolve(new Response(JSON.stringify({
                    success: true,
                    banners: []
                }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" }
                }));
            }

            resource = fixUrl(resource);
        }
        return originalFetch.call(this, resource, init);
    };

    // Intercept all <a> link clicks pointing to root "/" or "/page.html"
    document.addEventListener("click", function (e) {
        const link = e.target.closest("a");
        if (link && link.getAttribute("href")) {
            const rawHref = link.getAttribute("href").trim();
            if (rawHref.startsWith("http://") || rawHref.startsWith("https://") || rawHref.startsWith("#") || rawHref.startsWith("javascript:")) {
                return;
            }
            if (rawHref.startsWith("/") && !rawHref.startsWith("//")) {
                e.preventDefault();
                const target = (rawHref === "/" || rawHref === "/index" || rawHref === "/index.html") ? "index.html" : rawHref.replace(/^\/+/, "");
                window.location.href = rootPrefix + target;
            }
        }
    }, true);

})();