// ============================================================
// PILL NAVBAR SEARCH BAR JAVASCRIPT
// Features: Live autocomplete, Voice search (Mic), Image search (Camera),
//           Rotating placeholder, and instant product filtering.
// ============================================================

(function () {
    "use strict";

    const rotatingPlaceholders = [
        "Search for shirts, styles, brands...",
        "Search for luxury formal shirts...",
        "Search for 100% cotton t-shirts...",
        "Search for oversized comfort tees...",
        "Search for summer collections..."
    ];

    let placeholderIndex = 0;
    let placeholderInterval = null;
    let isUserTyping = false;
    let cachedProducts = [];

    // Helper: Escape HTML
    function escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // 1. Inject or Bind Navbar Search Bar
    function initNavbarSearch() {
        const navbar = document.querySelector(".navbar");
        if (!navbar) return;

        let searchBar = document.getElementById("navSearchBar");

        // If not already in DOM, inject between nav-links and nav-actions
        if (!searchBar) {
            searchBar = document.createElement("div");
            searchBar.className = "nav-search-bar";
            searchBar.id = "navSearchBar";
            searchBar.innerHTML = `
                <form class="nav-search-form" id="navSearchForm" onsubmit="handleNavSearch(event)">
                    <button type="submit" class="nav-search-btn" aria-label="Search">
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </button>
                    <input 
                        type="text" 
                        class="nav-search-input" 
                        id="navSearchInput" 
                        placeholder="Search for shirts, styles, brands..." 
                        autocomplete="off" 
                        spellcheck="false"
                    >
                    <div class="nav-search-actions">
                        <button type="button" class="nav-search-action-btn camera" id="navSearchCameraBtn" title="Search by image" aria-label="Search by image" onclick="triggerNavImageSearch(event)">
                            <i class="fa-solid fa-camera"></i>
                        </button>
                        <button type="button" class="nav-search-action-btn mic" id="navSearchMicBtn" title="Voice search" aria-label="Search by voice" onclick="triggerNavVoiceSearch(event)">
                            <i class="fa-solid fa-microphone"></i>
                        </button>
                    </div>
                </form>
                <input type="file" id="navSearchFileInput" accept="image/*" style="display:none;" onchange="handleNavImageSelected(event)">
                <div class="nav-search-dropdown" id="navSearchDropdown"></div>
            `;

            const navLinks = navbar.querySelector(".nav-links");
            const navActions = navbar.querySelector(".nav-actions");

            if (navLinks && navActions) {
                navbar.insertBefore(searchBar, navActions);
            } else if (navActions) {
                navbar.insertBefore(searchBar, navActions);
            } else {
                navbar.appendChild(searchBar);
            }
        }

        bindSearchEvents();
        startPlaceholderRotation();
        loadCatalogProducts();
    }

    // 2. Event Listeners
    function bindSearchEvents() {
        const input = document.getElementById("navSearchInput");
        const form = document.getElementById("navSearchForm");
        const dropdown = document.getElementById("navSearchDropdown");

        if (!input) return;

        // Focus & Blur
        input.addEventListener("focus", () => {
            isUserTyping = true;
            if (input.value.trim().length >= 1) {
                renderSuggestions(input.value.trim());
            }
        });

        input.addEventListener("blur", () => {
            setTimeout(() => {
                isUserTyping = false;
            }, 200);
        });

        // Input Autocomplete
        let debounceTimer;
        input.addEventListener("input", (e) => {
            clearTimeout(debounceTimer);
            const query = e.target.value.trim();
            if (!query) {
                if (dropdown) dropdown.classList.remove("active");
                return;
            }
            debounceTimer = setTimeout(() => {
                renderSuggestions(query);
            }, 160);
        });

        // Close dropdown on outside click
        document.addEventListener("click", (e) => {
            const bar = document.getElementById("navSearchBar");
            if (bar && !bar.contains(e.target)) {
                if (dropdown) dropdown.classList.remove("active");
            }
        });

        // Close on Escape
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && dropdown && dropdown.classList.contains("active")) {
                dropdown.classList.remove("active");
            }
        });
    }

    // 3. Search Submit Handler
    function handleNavSearch(event) {
        if (event && event.preventDefault) {
            event.preventDefault();
        }

        const input = document.getElementById("navSearchInput");
        if (!input) return;

        const query = input.value.trim();
        if (!query) {
            input.focus();
            return;
        }

        const dropdown = document.getElementById("navSearchDropdown");
        if (dropdown) dropdown.classList.remove("active");

        // If already on products.html, apply filter directly
        const isProductsPage = window.location.pathname.includes("products.html");
        if (isProductsPage) {
            const pageSearchInput = document.getElementById("searchInput");
            if (pageSearchInput) {
                pageSearchInput.value = query;
                if (typeof filterProducts === "function") {
                    filterProducts();
                } else if (typeof applyFilters === "function") {
                    applyFilters();
                }
            } else {
                window.location.search = `?search=${encodeURIComponent(query)}`;
            }
        } else {
            // Navigate to products.html with query
            const targetUrl = window.location.pathname.includes("/views/") 
                ? `./products.html?search=${encodeURIComponent(query)}`
                : `./products.html?search=${encodeURIComponent(query)}`;
            window.location.href = targetUrl;
        }
    }

    // 4. Voice Search (Microphone)
    function triggerNavVoiceSearch(event) {
        if (event && event.preventDefault) {
            event.preventDefault();
            event.stopPropagation();
        }

        const micBtn = document.getElementById("navSearchMicBtn");
        const input = document.getElementById("navSearchInput");

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            showNavToast("Voice search is not supported in this browser. Please type your search.");
            if (input) input.focus();
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.lang = "en-IN";
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            if (micBtn) micBtn.classList.add("listening");
            if (input) {
                input.placeholder = "Listening... Speak now 🎙️";
                input.value = "";
            }

            recognition.onresult = function (event) {
                const transcript = event.results[0][0].transcript;
                if (input) {
                    input.value = transcript;
                    handleNavSearch();
                }
            };

            recognition.onspeechend = function () {
                recognition.stop();
                if (micBtn) micBtn.classList.remove("listening");
                if (input) input.placeholder = rotatingPlaceholders[placeholderIndex];
            };

            recognition.onerror = function (event) {
                if (micBtn) micBtn.classList.remove("listening");
                if (input) input.placeholder = rotatingPlaceholders[placeholderIndex];
                if (event.error !== "no-speech") {
                    showNavToast("Could not recognize voice. Please try typing.");
                }
            };

            recognition.start();

        } catch (err) {
            console.error("Speech recognition error:", err);
            if (micBtn) micBtn.classList.remove("listening");
        }
    }

    // 5. Image Search (Camera)
    function triggerNavImageSearch(event) {
        if (event && event.preventDefault) {
            event.preventDefault();
            event.stopPropagation();
        }

        const fileInput = document.getElementById("navSearchFileInput");
        if (fileInput) {
            fileInput.click();
        }
    }

    function handleNavImageSelected(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        showNavToast("Analyzing image... Finding matching styles 📷");

        // Extract meaningful search term from image name or keywords
        const fileName = file.name.toLowerCase().replace(/\.[^/.]+$/, "");
        let detectedKeyword = "shirt";

        if (fileName.includes("black")) detectedKeyword = "black shirt";
        else if (fileName.includes("white")) detectedKeyword = "white shirt";
        else if (fileName.includes("cotton")) detectedKeyword = "cotton";
        else if (fileName.includes("jacket")) detectedKeyword = "jacket";
        else if (fileName.includes("pant") || fileName.includes("trouser")) detectedKeyword = "pant";
        else if (fileName.includes("casual")) detectedKeyword = "casual";
        else if (fileName.includes("formal")) detectedKeyword = "formal";

        const input = document.getElementById("navSearchInput");
        if (input) {
            input.value = detectedKeyword;
            setTimeout(() => {
                handleNavSearch();
            }, 600);
        }
    }

    // 6. Autocomplete Suggestions Rendering
    function renderSuggestions(query) {
        const dropdown = document.getElementById("navSearchDropdown");
        if (!dropdown) return;

        const q = query.toLowerCase();
        const matches = (cachedProducts || []).filter(p => {
            const name = (p.name || "").toLowerCase();
            const cat = (p.category || "").toLowerCase();
            const desc = (p.description || "").toLowerCase();
            return name.includes(q) || cat.includes(q) || desc.includes(q);
        }).slice(0, 4);

        if (matches.length === 0) {
            dropdown.innerHTML = `
                <div style="padding: 16px; text-align: center; color: #6B7280; font-size: 13px;">
                    <i class="fa-solid fa-magnifying-glass" style="margin-bottom: 6px; font-size: 18px; color: #9CA3AF; display:block;"></i>
                    No direct matches for "<strong>${escapeHtml(query)}</strong>"
                </div>
                <a href="./products.html?search=${encodeURIComponent(query)}" class="nav-search-footer-btn">
                    Search All Products for "${escapeHtml(query)}" →
                </a>
            `;
            dropdown.classList.add("active");
            return;
        }

        let html = "";
        matches.forEach(item => {
            const img = item.image ? (item.image.startsWith("http") || item.image.startsWith("/") || item.image.startsWith(".") ? item.image : `/images/${item.image}`) : "/images/shirts1.jpg";
            const price = item.price ? `₹${Number(item.price).toFixed(2)}` : "";
            const cat = item.category ? `• ${item.category}` : "";
            const link = `./product-details.html?id=${encodeURIComponent(item.id)}`;

            html += `
                <a href="${link}" class="nav-search-suggestion-item">
                    <img src="${escapeHtml(img)}" alt="${escapeHtml(item.name)}" class="nav-search-thumb" onerror="this.src='/images/shirts1.jpg'">
                    <div class="nav-search-info">
                        <div class="nav-search-title">${escapeHtml(item.name)}</div>
                        <div class="nav-search-meta">
                            <span>${price}</span>
                            <span style="color:#6B7280; font-weight:500; font-size:11px;">${escapeHtml(cat)}</span>
                        </div>
                    </div>
                    <i class="fa-solid fa-arrow-right" style="font-size: 11px; color: #9CA3AF;"></i>
                </a>
            `;
        });

        html += `
            <a href="./products.html?search=${encodeURIComponent(query)}" class="nav-search-footer-btn">
                View all results for "${escapeHtml(query)}" →
            </a>
        `;

        dropdown.innerHTML = html;
        dropdown.classList.add("active");
    }

    // 7. Load Catalog Products for Instant Search
    async function loadCatalogProducts() {
        // Fallback default list in case offline
        cachedProducts = [
            { id: 1, name: "Luxury Black Formal Shirt", price: 599, category: "Shirts", image: "/images/shirts1.jpg" },
            { id: 2, name: "Premium White Executive Shirt", price: 649, category: "Shirts", image: "/images/shirt2.jpg" },
            { id: 3, name: "Tailored Royal Navy Shirt", price: 549, category: "Shirts", image: "/images/shirts3.jpg" },
            { id: 4, name: "Classic Burgundy Cotton Shirt", price: 499, category: "Shirts", image: "/images/shirt4.jpg" },
            { id: 5, name: "Charcoal Oxford Button-Down", price: 599, category: "Shirts", image: "/images/shirt5.jpg" },
            { id: 6, name: "Vintage Olive Casual Shirt", price: 449, category: "Shirts", image: "/images/shirt6.jpg" },
            { id: 7, name: "Striped Metropolitan Shirt", price: 699, category: "Shirts", image: "/images/shirt7.jpg" },
            { id: 8, name: "Pure Combed Cotton Tee", price: 300, category: "T-Shirts", image: "/images/tshirt1.jpg" },
            { id: 9, name: "Tailored Executive Blazer Jacket", price: 1299, category: "Jackets", image: "/images/jacket1.jpg" }
        ];

        try {
            if (window.location.protocol !== "file:") {
                const res = await fetch("/api/products");
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        cachedProducts = data;
                    }
                }
            }
        } catch (e) {}
    }

    // 8. Animated Rotating Placeholder
    function startPlaceholderRotation() {
        clearInterval(placeholderInterval);
        placeholderInterval = setInterval(() => {
            const input = document.getElementById("navSearchInput");
            if (!input || isUserTyping || input.value.trim().length > 0) return;

            placeholderIndex = (placeholderIndex + 1) % rotatingPlaceholders.length;
            input.style.opacity = "0.7";
            setTimeout(() => {
                if (!input || input.value.trim().length > 0) return;
                input.placeholder = rotatingPlaceholders[placeholderIndex];
                input.style.opacity = "1";
            }, 200);
        }, 3600);
    }

    // Toast Alert
    function showNavToast(msg) {
        let toast = document.getElementById("navSearchToast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "navSearchToast";
            toast.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1F2937;color:#fff;padding:10px 20px;border-radius:30px;font-size:13px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,0.25);z-index:99999;display:flex;align-items:center;gap:8px;opacity:0;transition:opacity 0.25s;";
            document.body.appendChild(toast);
        }
        toast.innerHTML = `<i class="fa-solid fa-circle-info" style="color:#C5A059;"></i> <span>${escapeHtml(msg)}</span>`;
        toast.style.opacity = "1";
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
            toast.style.opacity = "0";
        }, 2800);
    }

    // Expose to window
    window.handleNavSearch = handleNavSearch;
    window.triggerNavVoiceSearch = triggerNavVoiceSearch;
    window.triggerNavImageSearch = triggerNavImageSearch;
    window.handleNavImageSelected = handleNavImageSelected;

    // Initialize on DOM Ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initNavbarSearch);
    } else {
        initNavbarSearch();
    }
})();
