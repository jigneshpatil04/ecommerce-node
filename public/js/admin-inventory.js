// ============================================================
// ADMIN INVENTORY MANAGEMENT JAVASCRIPT
// Handles stock tracking, variant accordions, low-stock alerts,
// quick restock actions, and bulk/inline updates
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    // State
    let currentStatus = "all";
    let currentCategory = "all";
    let searchQuery = "";
    let currentThreshold = 5;
    let inventoryData = null;
    let expandedDrawerProductId = null;

    // Modal state
    let activeModalItem = null; // { type: 'product'|'variant', id, name, currentStock, img, meta }

    // DOM Elements - Header & Filter
    const thresholdInput = document.getElementById("thresholdInput");
    const refreshBtn = document.getElementById("refreshBtn");
    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");
    const logoutButton = document.getElementById("logoutButton");

    // Critical Alert Banner
    const criticalAlertBanner = document.getElementById("criticalAlertBanner");
    const alertBannerTitle = document.getElementById("alertBannerTitle");
    const alertBannerDesc = document.getElementById("alertBannerDesc");
    const btnViewLowStock = document.getElementById("btnViewLowStock");
    const btnDismissAlert = document.getElementById("btnDismissAlert");

    // Stats
    const statTotalUnits = document.getElementById("statTotalUnits");
    const statValuation = document.getElementById("statValuation");
    const statInStock = document.getElementById("statInStock");
    const statLowStock = document.getElementById("statLowStock");
    const statOutOfStock = document.getElementById("statOutOfStock");
    const statLowStockSub = document.getElementById("statLowStockSub");

    // Tab buttons & badges
    const invTabBtns = document.querySelectorAll(".inv-tab-btn");
    const badgeAll = document.getElementById("badgeAll");
    const badgeInStock = document.getElementById("badgeInStock");
    const badgeLowStock = document.getElementById("badgeLowStock");
    const badgeOutOfStock = document.getElementById("badgeOutOfStock");

    // Search & Category
    const invSearchInput = document.getElementById("invSearchInput");
    const invCategorySelect = document.getElementById("invCategorySelect");
    const inventoryTableBody = document.getElementById("inventoryTableBody");
    const tableSubtitle = document.getElementById("tableSubtitle");

    // Modal Elements
    const restockModal = document.getElementById("restockModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalItemImg = document.getElementById("modalItemImg");
    const modalItemName = document.getElementById("modalItemName");
    const modalItemMeta = document.getElementById("modalItemMeta");
    const modalExactStock = document.getElementById("modalExactStock");
    const modalSyncOption = document.getElementById("modalVariantSyncOption");
    const modalSyncVariantsCheck = document.getElementById("modalSyncVariantsCheck");
    const modalCloseBtn = document.getElementById("modalCloseBtn");
    const modalCancelBtn = document.getElementById("modalCancelBtn");
    const modalSaveBtn = document.getElementById("modalSaveBtn");
    const presetButtons = document.querySelectorAll(".btn-preset");

    // Mobile menu toggle
    if (menuBtn && sidebar) {
        menuBtn.addEventListener("click", () => sidebar.classList.toggle("open"));
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            if (confirm("Are you sure you want to log out?")) {
                localStorage.removeItem("adminToken");
                localStorage.removeItem("admin");
                window.location.href = "/login.html";
            }
        });
    }

    // ============================================================
    // TOAST NOTIFICATIONS
    // ============================================================
    function showToast(message, type = "success") {
        const container = document.getElementById("invToastContainer");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = `inv-toast ${type}`;

        const iconClass =
            type === "success"
                ? "fa-circle-check"
                : type === "warning"
                ? "fa-triangle-exclamation"
                : "fa-circle-xmark";

        toast.innerHTML = `
            <i class="fa-solid ${iconClass}" style="color: ${type === "success" ? "var(--success)" : type === "warning" ? "var(--warning)" : "var(--danger)"}; font-size: 16px;"></i>
            <span>${escapeHtml(message)}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateX(100%)";
            toast.style.transition = "all 0.3s ease";
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // ============================================================
    // 1. FETCH INVENTORY DATA
    // ============================================================
    async function fetchInventory() {
        try {
            inventoryTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
                        <i class="fa-solid fa-spinner fa-spin fa-2x mb-2" style="color: var(--primary);"></i>
                        <p style="margin: 8px 0 0 0; font-weight: 600;">Updating inventory live...</p>
                    </td>
                </tr>
            `;

            currentThreshold = parseInt(thresholdInput.value, 10) || 5;
            let url = `/api/admin/inventory?status=${currentStatus}&category=${currentCategory}&threshold=${currentThreshold}`;
            if (searchQuery.trim() !== "") {
                url += `&search=${encodeURIComponent(searchQuery.trim())}`;
            }

            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to load inventory");
            }

            inventoryData = data;
            renderOverview();
            renderCategories(data.categories || []);
            renderTable();

        } catch (error) {
            console.error("fetchInventory error:", error);
            inventoryTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: var(--danger);">
                        <i class="fa-solid fa-triangle-exclamation fa-2x mb-2"></i>
                        <p style="margin: 8px 0 0 0; font-weight: 600;">Failed to load inventory.</p>
                        <small style="color: var(--text-muted);">${escapeHtml(error.message)}</small>
                    </td>
                </tr>
            `;
            showToast("Failed to load inventory data", "error");
        }
    }

    // ============================================================
    // 2. RENDER STATS & ALERT BANNER
    // ============================================================
    function renderOverview() {
        if (!inventoryData) return;
        const sum = inventoryData.summary || {};

        statTotalUnits.textContent = Number(sum.totalUnits || 0).toLocaleString();
        statValuation.textContent = `Valuation: ₹${Number(sum.totalValuation || 0).toLocaleString()}`;
        statInStock.textContent = sum.inStockCount || 0;
        statLowStock.textContent = sum.lowStockCount || 0;
        statOutOfStock.textContent = sum.outOfStockCount || 0;
        statLowStockSub.textContent = `≤ ${currentThreshold} units remaining`;

        badgeAll.textContent = sum.totalProducts || 0;
        badgeInStock.textContent = sum.inStockCount || 0;
        badgeLowStock.textContent = sum.lowStockCount || 0;
        badgeOutOfStock.textContent = sum.outOfStockCount || 0;

        // Critical Alert Banner
        const criticalCount = (sum.lowStockCount || 0) + (sum.outOfStockCount || 0);
        if (criticalCount > 0 && criticalAlertBanner) {
            criticalAlertBanner.style.display = "flex";
            alertBannerTitle.textContent = `${criticalCount} Items Need Immediate Restocking!`;
            alertBannerDesc.textContent = `${sum.outOfStockCount || 0} product(s) are completely out of stock and ${sum.lowStockCount || 0} are critically low (≤ ${currentThreshold} units).`;
        } else if (criticalAlertBanner) {
            criticalAlertBanner.style.display = "none";
        }
    }

    // ============================================================
    // 3. RENDER CATEGORIES DROPDOWN
    // ============================================================
    function renderCategories(categories) {
        if (!invCategorySelect || invCategorySelect.children.length > 1) return;

        categories.forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat;
            opt.textContent = cat;
            invCategorySelect.appendChild(opt);
        });
    }

    // ============================================================
    // 4. RENDER INVENTORY TABLE
    // ============================================================
    function renderTable() {
        const products = inventoryData.products || [];
        tableSubtitle.textContent = `Showing ${products.length} product(s) in catalog`;

        if (products.length === 0) {
            inventoryTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
                        <i class="fa-solid fa-box-open fa-2x mb-2" style="opacity: 0.5;"></i>
                        <p style="font-weight: 600; margin: 4px 0 0 0;">No products matched your criteria.</p>
                        <small>Try selecting a different status tab or clearing your search.</small>
                    </td>
                </tr>
            `;
            return;
        }

        let html = "";
        products.forEach(p => {
            const isExpanded = expandedDrawerProductId === p.id;
            const statusClass =
                p.status === "in_stock"
                    ? "status-instock"
                    : p.status === "low_stock"
                    ? "status-lowstock"
                    : "status-outofstock";

            const statusText =
                p.status === "in_stock"
                    ? "In Stock"
                    : p.status === "low_stock"
                    ? "Low Stock"
                    : "Out of Stock";

            html += `
                <tr id="prodRow_${p.id}">
                    <!-- Product Info -->
                    <td>
                        <div class="inv-prod-cell">
                            <img src="${p.image}" class="inv-prod-img" alt="${escapeHtml(p.name)}" onerror="this.src='/images/shirt2.jpg'">
                            <div class="inv-prod-info">
                                <span class="inv-prod-name">${escapeHtml(p.name)}</span>
                                <div class="inv-prod-meta">
                                    <span>ID: #${p.id}</span>
                                    ${p.brand ? `<span>• ${escapeHtml(p.brand)}</span>` : ""}
                                </div>
                            </div>
                        </div>
                    </td>

                    <!-- Category -->
                    <td>
                        <span style="font-weight: 600; color: var(--text-muted);">${escapeHtml(p.category)}</span>
                    </td>

                    <!-- Price -->
                    <td>
                        <strong style="color: var(--dark); font-size: 14px;">₹${Number(p.price).toLocaleString()}</strong>
                    </td>

                    <!-- Available Stock -->
                    <td>
                        <div class="stock-stepper-wrap">
                            <button type="button" class="stepper-btn btn-stock-minus" data-id="${p.id}" data-type="product" title="Decrement stock">-</button>
                            <input type="number" class="stepper-input prod-stock-input" id="stockInput_${p.id}" value="${p.effective_stock}" min="0" data-orig="${p.effective_stock}">
                            <button type="button" class="stepper-btn btn-stock-plus" data-id="${p.id}" data-type="product" title="Increment stock">+</button>
                            <button type="button" class="btn-inline-save btn-save-prod" data-id="${p.id}" title="Save Stock">Save</button>
                        </div>
                    </td>

                    <!-- Status -->
                    <td>
                        <span class="status-pill ${statusClass}">
                            <span class="status-dot"></span>
                            <span>${statusText}</span>
                        </span>
                    </td>

                    <!-- Variants Breakdown Column -->
                    <td>
                        ${
                            p.has_variants
                                ? `
                            <button type="button" class="btn-toggle-variants ${isExpanded ? "open" : ""}" data-id="${p.id}">
                                <i class="fa-solid fa-chevron-down"></i>
                                <span>${p.variants_count} Size & Color Stock</span>
                            </button>
                        `
                                : `<span style="color: var(--text-muted); font-size: 12px;">Standard (No Variants)</span>`
                        }
                    </td>

                    <!-- Quick Actions -->
                    <td style="text-align: right;">
                        <button type="button" class="btn-refresh btn-open-restock" data-id="${p.id}" data-name="${escapeHtml(p.name)}" data-img="${p.image}" data-stock="${p.effective_stock}" data-has-var="${p.has_variants}">
                            <i class="fa-solid fa-plus-circle" style="color: var(--primary);"></i>
                            <span>Restock</span>
                        </button>
                    </td>
                </tr>

                <!-- Expandable Variant Drawer -->
                ${
                    p.has_variants
                        ? `
                <tr class="variants-drawer-row" id="drawerRow_${p.id}" style="${isExpanded ? "" : "display: none;"}">
                    <td colspan="7" class="variants-drawer-cell">
                        <div class="variants-drawer-content">
                            <div class="variants-drawer-header">
                                <h5 class="drawer-title">
                                    <i class="fa-solid fa-palette" style="color: var(--primary);"></i>
                                    Size & Color Breakdown for "${escapeHtml(p.name)}"
                                </h5>
                                <div class="drawer-actions">
                                    <span style="font-size: 12px; color: var(--text-muted); margin-right: 8px;">
                                        Total Variant Units: <strong>${p.total_variant_stock}</strong>
                                    </span>
                                </div>
                            </div>

                            <table class="variant-grid-table">
                                <thead>
                                    <tr>
                                        <th>Size</th>
                                        <th>Color</th>
                                        <th>Variant Image</th>
                                        <th>Stock Quantity</th>
                                        <th>Status</th>
                                        <th>Quick Add</th>
                                        <th style="text-align: right;">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${p.variants
                                        .map(v => {
                                            const vStatusClass =
                                                v.status === "in_stock"
                                                    ? "status-instock"
                                                    : v.status === "low_stock"
                                                    ? "status-lowstock"
                                                    : "status-outofstock";
                                            const vStatusText =
                                                v.status === "in_stock"
                                                    ? "In Stock"
                                                    : v.status === "low_stock"
                                                    ? "Low Stock"
                                                    : "Out of Stock";

                                            return `
                                        <tr id="varRow_${v.id}">
                                            <td>
                                                <span class="size-chip">${escapeHtml(v.size)}</span>
                                            </td>
                                            <td>
                                                <div class="color-badge">
                                                    <span class="color-swatch" style="background-color: ${getColorHex(v.color)};"></span>
                                                    <span>${escapeHtml(v.color)}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <img src="${v.image || p.image}" style="width: 32px; height: 32px; border-radius: 4px; object-fit: cover;" alt="${escapeHtml(v.color)}" onerror="this.src='/images/shirt2.jpg'">
                                            </td>
                                            <td>
                                                <div class="stock-stepper-wrap">
                                                    <button type="button" class="stepper-btn btn-var-minus" data-id="${v.id}">-</button>
                                                    <input type="number" class="stepper-input var-stock-input" id="varStockInput_${v.id}" value="${v.stock}" min="0">
                                                    <button type="button" class="stepper-btn btn-var-plus" data-id="${v.id}">+</button>
                                                </div>
                                            </td>
                                            <td>
                                                <span class="status-pill ${vStatusClass}" id="varStatusBadge_${v.id}">
                                                    <span class="status-dot"></span>
                                                    <span>${vStatusText}</span>
                                                </span>
                                            </td>
                                            <td>
                                                <div class="quick-add-pills">
                                                    <button type="button" class="pill-add btn-quick-var-add" data-id="${v.id}" data-add="5">+5</button>
                                                    <button type="button" class="pill-add btn-quick-var-add" data-id="${v.id}" data-add="10">+10</button>
                                                    <button type="button" class="pill-add btn-quick-var-add" data-id="${v.id}" data-add="25">+25</button>
                                                    <button type="button" class="pill-add btn-quick-var-add" data-id="${v.id}" data-add="50">+50</button>
                                                </div>
                                            </td>
                                            <td style="text-align: right;">
                                                <button type="button" class="btn-inline-save btn-save-var" data-id="${v.id}" data-prod-id="${p.id}">
                                                    <i class="fa-solid fa-check"></i> Save
                                                </button>
                                            </td>
                                        </tr>
                                    `;
                                        })
                                        .join("")}
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
                `
                        : ""
                }
            `;
        });

        inventoryTableBody.innerHTML = html;
        attachTableEventListeners();
    }

    // Color hex helper for swatches
    function getColorHex(colorName) {
        if (!colorName) return "#cccccc";
        const c = colorName.trim().toLowerCase();
        const map = {
            black: "#1e1e27",
            white: "#ffffff",
            red: "#ef4444",
            blue: "#3b82f6",
            navy: "#1e3a8a",
            green: "#10b981",
            yellow: "#f59e0b",
            orange: "#f97316",
            purple: "#8b5cf6",
            teal: "#14b8a6",
            grey: "#6b7280",
            gray: "#6b7280",
            pink: "#ec4899",
            maroon: "#881337",
            beige: "#f5f5dc",
            brown: "#78350f"
        };
        return map[c] || "#94a3b8";
    }

    // ============================================================
    // 5. EVENT LISTENERS FOR TABLE
    // ============================================================
    function attachTableEventListeners() {
        // Toggle Variants Accordion
        document.querySelectorAll(".btn-toggle-variants").forEach(btn => {
            btn.addEventListener("click", () => {
                const prodId = parseInt(btn.getAttribute("data-id"), 10);
                const drawerRow = document.getElementById(`drawerRow_${prodId}`);
                if (!drawerRow) return;

                const isOpen = drawerRow.style.display !== "none";
                if (isOpen) {
                    drawerRow.style.display = "none";
                    btn.classList.remove("open");
                    expandedDrawerProductId = null;
                } else {
                    // Close any other open drawer
                    document.querySelectorAll(".variants-drawer-row").forEach(r => (r.style.display = "none"));
                    document.querySelectorAll(".btn-toggle-variants").forEach(b => b.classList.remove("open"));

                    drawerRow.style.display = "table-row";
                    btn.classList.add("open");
                    expandedDrawerProductId = prodId;
                }
            });
        });

        // Product Stock Stepper Buttons
        document.querySelectorAll(".btn-stock-minus").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                const input = document.getElementById(`stockInput_${id}`);
                if (input && Number(input.value) > 0) {
                    input.value = Number(input.value) - 1;
                }
            });
        });

        document.querySelectorAll(".btn-stock-plus").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                const input = document.getElementById(`stockInput_${id}`);
                if (input) {
                    input.value = Number(input.value) + 1;
                }
            });
        });

        // Save Product Base Stock
        document.querySelectorAll(".btn-save-prod").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.getAttribute("data-id");
                const input = document.getElementById(`stockInput_${id}`);
                if (!input) return;

                const newStock = parseInt(input.value, 10);
                if (isNaN(newStock) || newStock < 0) {
                    showToast("Please enter a valid stock quantity", "error");
                    return;
                }

                try {
                    btn.disabled = true;
                    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;

                    const res = await fetch(`/api/admin/inventory/product/${id}/stock`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ stock: newStock })
                    });
                    const result = await res.json();

                    if (!result.success) {
                        throw new Error(result.message || "Failed to update stock");
                    }

                    btn.classList.add("saved");
                    btn.innerHTML = `<i class="fa-solid fa-check"></i> Saved`;
                    showToast(result.message || "Product stock updated!");

                    setTimeout(() => {
                        btn.classList.remove("saved");
                        btn.innerHTML = "Save";
                        btn.disabled = false;
                        fetchInventory();
                    }, 1200);

                } catch (err) {
                    console.error("Save prod stock error:", err);
                    showToast(err.message, "error");
                    btn.disabled = false;
                    btn.innerHTML = "Save";
                }
            });
        });

        // Variant Stepper Buttons
        document.querySelectorAll(".btn-var-minus").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                const input = document.getElementById(`varStockInput_${id}`);
                if (input && Number(input.value) > 0) {
                    input.value = Number(input.value) - 1;
                }
            });
        });

        document.querySelectorAll(".btn-var-plus").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                const input = document.getElementById(`varStockInput_${id}`);
                if (input) {
                    input.value = Number(input.value) + 1;
                }
            });
        });

        // Quick Add Pills (+5, +10, +25, +50)
        document.querySelectorAll(".btn-quick-var-add").forEach(btn => {
            btn.addEventListener("click", async () => {
                const varId = btn.getAttribute("data-id");
                const addQty = parseInt(btn.getAttribute("data-add"), 10);
                const input = document.getElementById(`varStockInput_${varId}`);

                try {
                    btn.disabled = true;
                    const res = await fetch(`/api/admin/inventory/quick-restock`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ type: "variant", id: varId, quantity: addQty })
                    });
                    const json = await res.json();

                    if (!json.success) {
                        throw new Error(json.message);
                    }

                    if (input) input.value = json.stock;
                    showToast(json.message);
                    fetchInventory();

                } catch (err) {
                    console.error("Quick add error:", err);
                    showToast(err.message, "error");
                } finally {
                    btn.disabled = false;
                }
            });
        });

        // Save Variant Stock
        document.querySelectorAll(".btn-save-var").forEach(btn => {
            btn.addEventListener("click", async () => {
                const varId = btn.getAttribute("data-id");
                const input = document.getElementById(`varStockInput_${varId}`);
                if (!input) return;

                const newStock = parseInt(input.value, 10);
                if (isNaN(newStock) || newStock < 0) {
                    showToast("Please enter a valid variant stock quantity", "error");
                    return;
                }

                try {
                    btn.disabled = true;
                    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;

                    const res = await fetch(`/api/admin/inventory/variant/${varId}/stock`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ stock: newStock, syncProductTotal: true })
                    });
                    const json = await res.json();

                    if (!json.success) {
                        throw new Error(json.message);
                    }

                    btn.classList.add("saved");
                    btn.innerHTML = `<i class="fa-solid fa-check"></i> Saved`;
                    showToast(json.message);

                    setTimeout(() => {
                        btn.classList.remove("saved");
                        btn.innerHTML = `<i class="fa-solid fa-check"></i> Save`;
                        btn.disabled = false;
                        fetchInventory();
                    }, 1200);

                } catch (err) {
                    console.error("Save variant error:", err);
                    showToast(err.message, "error");
                    btn.disabled = false;
                    btn.innerHTML = `<i class="fa-solid fa-check"></i> Save`;
                }
            });
        });

        // Open Restock Modal
        document.querySelectorAll(".btn-open-restock").forEach(btn => {
            btn.addEventListener("click", () => {
                const prodId = btn.getAttribute("data-id");
                const name = btn.getAttribute("data-name");
                const img = btn.getAttribute("data-img");
                const stock = btn.getAttribute("data-stock");
                const hasVar = btn.getAttribute("data-has-var") === "true";

                activeModalItem = {
                    type: "product",
                    id: prodId,
                    name,
                    img,
                    stock: parseInt(stock, 10) || 0,
                    hasVariants: hasVar
                };

                modalTitle.textContent = `Restock "${name}"`;
                modalItemName.textContent = name;
                modalItemImg.src = img || "/images/shirt2.jpg";
                modalItemMeta.textContent = `Product ID #${prodId} • Current Stock: ${stock} units`;
                modalExactStock.value = stock;

                if (hasVar) {
                    modalSyncOption.style.display = "block";
                } else {
                    modalSyncOption.style.display = "none";
                }

                restockModal.classList.add("active");
            });
        });
    }

    // ============================================================
    // 6. MODAL INTERACTIONS
    // ============================================================
    function closeModal() {
        restockModal.classList.remove("active");
        activeModalItem = null;
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
    if (modalCancelBtn) modalCancelBtn.addEventListener("click", closeModal);
    restockModal.addEventListener("click", (e) => {
        if (e.target === restockModal) closeModal();
    });

    // Preset buttons in modal (+5, +10, etc.)
    presetButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const add = parseInt(btn.getAttribute("data-add"), 10);
            const current = parseInt(modalExactStock.value, 10) || (activeModalItem ? activeModalItem.stock : 0);
            modalExactStock.value = current + add;
        });
    });

    // Save Restock Modal
    if (modalSaveBtn) {
        modalSaveBtn.addEventListener("click", async () => {
            if (!activeModalItem) return;

            const newStock = parseInt(modalExactStock.value, 10);
            if (isNaN(newStock) || newStock < 0) {
                showToast("Please enter a valid stock quantity", "error");
                return;
            }

            try {
                modalSaveBtn.disabled = true;
                modalSaveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;

                const syncVar = modalSyncVariantsCheck ? modalSyncVariantsCheck.checked : false;

                const res = await fetch(`/api/admin/inventory/product/${activeModalItem.id}/stock`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        stock: newStock,
                        syncVariants: activeModalItem.hasVariants && syncVar
                    })
                });

                const json = await res.json();
                if (!json.success) throw new Error(json.message);

                showToast(`Restocked ${activeModalItem.name} to ${newStock} units!`);
                closeModal();
                fetchInventory();

            } catch (err) {
                console.error("Modal save error:", err);
                showToast(err.message, "error");
            } finally {
                modalSaveBtn.disabled = false;
                modalSaveBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Save Stock`;
            }
        });
    }

    // ============================================================
    // 7. FILTERS & SEARCH
    // ============================================================
    // Tab filters
    invTabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            invTabBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentStatus = btn.getAttribute("data-status");

            // Also sync stat cards active state
            document.querySelectorAll(".inv-stat-card").forEach(c => {
                c.classList.toggle("active", c.getAttribute("data-filter") === currentStatus);
            });

            fetchInventory();
        });
    });

    // Stat cards click to filter
    document.querySelectorAll(".inv-stat-card").forEach(card => {
        card.addEventListener("click", () => {
            const filter = card.getAttribute("data-filter");
            const matchingTab = document.querySelector(`.inv-tab-btn[data-status="${filter}"]`);
            if (matchingTab) {
                matchingTab.click();
            }
        });
    });

    // Search input (debounced)
    let searchTimeout = null;
    if (invSearchInput) {
        invSearchInput.addEventListener("input", (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchQuery = e.target.value;
                fetchInventory();
            }, 300);
        });
    }

    // Category select
    if (invCategorySelect) {
        invCategorySelect.addEventListener("change", (e) => {
            currentCategory = e.target.value;
            fetchInventory();
        });
    }

    // Threshold input
    if (thresholdInput) {
        thresholdInput.addEventListener("change", () => {
            fetchInventory();
        });
    }

    // Refresh button
    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
            fetchInventory();
            showToast("Inventory refreshed!");
        });
    }

    // Alert Banner Buttons
    if (btnViewLowStock) {
        btnViewLowStock.addEventListener("click", () => {
            const lowTab = document.querySelector(`.inv-tab-btn[data-status="low_stock"]`);
            if (lowTab) lowTab.click();
        });
    }

    if (btnDismissAlert) {
        btnDismissAlert.addEventListener("click", () => {
            if (criticalAlertBanner) criticalAlertBanner.style.display = "none";
        });
    }

    // Helper: escape HTML
    function escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Initial Fetch
    fetchInventory();
});
