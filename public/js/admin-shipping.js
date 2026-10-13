// ==========================================
// ADMIN SHIPPING JS
// All Shipments page logic
// ==========================================

"use strict";

// ---- State ----
let currentPage = 1;
let totalShipments = 0;
let currentStatus = "all";
let currentSearch = "";
let activeShipmentId = null;
const LIMIT = 15;

// ---- Init ----
document.addEventListener("DOMContentLoaded", () => {
    // Check URL params for pre-filter
    const params = new URLSearchParams(window.location.search);
    if (params.get("status")) {
        currentStatus = params.get("status");
        const statusSel = document.getElementById("statusFilter");
        if (statusSel) statusSel.value = currentStatus;

        // Highlight the matching stat card
        document.querySelectorAll(".ship-stat-card").forEach(c => {
            c.classList.remove("active");
            if (c.dataset.filter === currentStatus) c.classList.add("active");
        });
    }

    loadShipments();

    // Search input debounce
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        let debounce;
        searchInput.addEventListener("input", () => {
            clearTimeout(debounce);
            debounce = setTimeout(() => {
                currentSearch = searchInput.value.trim();
                currentPage = 1;
                loadShipments();
            }, 400);
        });
    }

    // Status filter
    const statusFilter = document.getElementById("statusFilter");
    if (statusFilter) {
        statusFilter.addEventListener("change", () => {
            currentStatus = statusFilter.value;
            currentPage = 1;
            loadShipments();
        });
    }

    // Refresh
    const refreshBtn = document.getElementById("refreshBtn");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => loadShipments());
    }

    // Stat card clicks
    document.querySelectorAll(".ship-stat-card").forEach(card => {
        card.addEventListener("click", () => {
            document.querySelectorAll(".ship-stat-card").forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            currentStatus = card.dataset.filter || "all";
            const statusSel = document.getElementById("statusFilter");
            if (statusSel) statusSel.value = currentStatus;
            currentPage = 1;
            loadShipments();
        });
    });
});


// ---- Load Shipments ----
async function loadShipments() {
    const tbody = document.getElementById("shipTableBody");
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="7"><div class="ship-loading"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading…</div></td></tr>`;
    }

    try {
        let url = `/api/shipments?page=${currentPage}&limit=${LIMIT}`;
        if (currentStatus && currentStatus !== "all") url += `&status=${currentStatus}`;
        if (currentSearch) url += `&search=${encodeURIComponent(currentSearch)}`;

        const r = await fetch(url);
        const data = await r.json();

        if (!data.success) {
            if (tbody) tbody.innerHTML = `<tr><td colspan="7"><div class="ship-empty"><i class="fa-solid fa-triangle-exclamation"></i><p>${data.message}</p></div></td></tr>`;
            return;
        }

        totalShipments = data.total;
        updateStatCards(data.summary);
        window.currentLoadedShipments = data.shipments;
        renderTable(data.shipments);
        renderPagination(data.total, data.page, LIMIT);

    } catch (e) {
        console.error("loadShipments error:", e);
        if (tbody) tbody.innerHTML = `<tr><td colspan="7"><div class="ship-empty"><i class="fa-solid fa-triangle-exclamation"></i><p>Network error: ${e.message}</p></div></td></tr>`;
    }
}


// ---- Render table ----
function renderTable(shipments) {
    const tbody = document.getElementById("shipTableBody");
    if (!tbody) return;

    if (!shipments || !shipments.length) {
        tbody.innerHTML = `
            <tr><td colspan="7">
                <div class="ship-empty">
                    <i class="fa-solid fa-truck"></i>
                    <p>No shipments found.</p>
                </div>
            </td></tr>`;
        return;
    }

    tbody.innerHTML = shipments.map(s => {
        const badgeCls = getBadgeClass(s.shipping_status);
        const statusLabel = s.shipping_status.replace("_", " ");
        const address = (s.address || "—").substring(0, 30) + (s.address && s.address.length > 30 ? "…" : "");

        return `
        <tr>
            <td class="order-id-cell">#${s.order_id}</td>
            <td>${s.customer_name || "—"}</td>
            <td title="${s.address || ""}">${address}</td>
            <td>${s.courier_name || "—"}</td>
            <td style="font-family:monospace;color:#94a3b8;">${s.tracking_number || "—"}</td>
            <td>
                <span class="ship-badge ${badgeCls}">
                    <i class="fa-solid ${getStatusIcon(s.shipping_status)}"></i>
                    ${statusLabel}
                </span>
            </td>
            <td>
                <div class="ship-actions">
                    <button onclick="openDetail(${s.id})" title="View Details">
                        <i class="fa-solid fa-eye"></i> View
                    </button>
                    <button onclick="printShipmentLabel(${s.id})" style="border-color:#6366f1;color:#6366f1;" title="Print Shipping Label">
                        <i class="fa-solid fa-print"></i> Print
                    </button>
                    <button onclick="viewTrackingPage(${s.id})" title="Tracking Page">
                        <i class="fa-solid fa-route"></i>
                    </button>
                    <button class="del-btn" onclick="deleteShipment(${s.id})" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join("");
}


// ---- Badge helpers ----
function getBadgeClass(status) {
    const m = {
        Pending: "badge-pending",
        Processing: "badge-processing",
        Shipped: "badge-shipped",
        In_Transit: "badge-in_transit",
        Delivered: "badge-delivered"
    };
    return m[status] || "badge-pending";
}

function getStatusIcon(status) {
    const m = {
        Pending: "fa-clock",
        Processing: "fa-gears",
        Shipped: "fa-paper-plane",
        In_Transit: "fa-truck-fast",
        Delivered: "fa-circle-check"
    };
    return m[status] || "fa-circle";
}


// ---- Stat cards update ----
function updateStatCards(summary) {
    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val ?? 0;
    };
    set("cntAll", summary.All || 0);
    set("cntPending", summary.Pending || 0);
    set("cntProcessing", summary.Processing || 0);
    set("cntShipped", summary.Shipped || 0);
    set("cntTransit", summary.In_Transit || 0);
    set("cntDelivered", summary.Delivered || 0);
}


// ---- Pagination ----
function renderPagination(total, page, limit) {
    const bar = document.getElementById("paginationBar");
    const pageInfo = document.getElementById("pageInfo");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    if (!bar) return;

    const totalPages = Math.ceil(total / limit);

    if (total === 0) {
        bar.style.display = "none";
        return;
    }

    bar.style.display = "flex";
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);
    if (pageInfo) pageInfo.textContent = `Showing ${start}–${end} of ${total}`;
    if (prevBtn) prevBtn.disabled = page <= 1;
    if (nextBtn) nextBtn.disabled = page >= totalPages;
}

function changePage(dir) {
    currentPage += dir;
    loadShipments();
}


// ---- Open Detail Modal ----
async function openDetail(id) {
    activeShipmentId = id;
    const modal = document.getElementById("detailModal");
    if (modal) modal.classList.add("active");

    const content = document.getElementById("modalContent");
    const timeline = document.getElementById("modalTimeline");
    if (content) content.innerHTML = `<div class="ship-loading"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading…</div>`;
    if (timeline) timeline.innerHTML = "";

    try {
        const r = await fetch(`/api/shipments/${id}`);
        const data = await r.json();
        if (!data.success) {
            if (content) content.innerHTML = `<p style="color:#ef4444;">${data.message}</p>`;
            return;
        }

        const s = data.shipment;
        window.activeShipmentData = s;

        // Set status dropdown
        const statusSel = document.getElementById("newStatusSelect");
        if (statusSel) statusSel.value = s.shipping_status;

        if (content) {
            content.innerHTML = `
                <div class="detail-row"><span class="label">Order ID</span><span class="value">#${s.order_id}</span></div>
                <div class="detail-row"><span class="label">Customer</span><span class="value">${s.customer_name || "—"}</span></div>
                <div class="detail-row"><span class="label">Address</span><span class="value">${s.address || "—"}</span></div>
                <div class="detail-row"><span class="label">Phone</span><span class="value">${s.phone || "—"}</span></div>
                <div class="detail-row"><span class="label">Courier</span><span class="value">${s.courier_name || "—"}</span></div>
                <div class="detail-row"><span class="label">Tracking #</span><span class="value" style="font-family:monospace;color:#6366f1;">${s.tracking_number || "—"}</span></div>
                <div class="detail-row"><span class="label">Shipping Date</span><span class="value">${s.shipping_date ? new Date(s.shipping_date).toLocaleDateString("en-IN") : "—"}</span></div>
                <div class="detail-row"><span class="label">Expected Delivery</span><span class="value">${s.expected_delivery ? new Date(s.expected_delivery).toLocaleDateString("en-IN") : "—"}</span></div>
                <div class="detail-row"><span class="label">Status</span>
                    <span class="ship-badge ${getBadgeClass(s.shipping_status)}">${s.shipping_status.replace("_", " ")}</span>
                </div>
            `;
        }

        // Timeline
        const statusOrder = ["Pending", "Processing", "Shipped", "In_Transit", "Delivered"];
        const currentIdx = statusOrder.indexOf(s.shipping_status);
        const timelineItems = [
            { label: "Order Confirmed", icon: "fa-check-circle", completed: true },
            { label: "Shipment Created", icon: "fa-box", completed: currentIdx >= 0 },
            { label: "Processing", icon: "fa-gears", completed: currentIdx >= 1 },
            { label: "Picked Up / Shipped", icon: "fa-truck-fast", completed: currentIdx >= 2 },
            { label: "In Transit", icon: "fa-route", completed: currentIdx >= 3 },
            { label: "Out for Delivery", icon: "fa-truck-ramp-box", completed: currentIdx >= 4 },
            { label: "Delivered", icon: "fa-circle-check", completed: currentIdx >= 4 }
        ];

        if (timeline) {
            timeline.innerHTML = timelineItems.map(item => `
                <div class="timeline-item ${item.completed ? "completed" : ""}">
                    <div class="tl-icon"><i class="fa-solid ${item.icon}"></i></div>
                    <div class="tl-content">
                        <div class="tl-label">${item.label}</div>
                        <div class="tl-date">${item.completed ? "✓ Completed" : "○ Pending"}</div>
                    </div>
                </div>
            `).join("");
        }

    } catch (e) {
        if (content) content.innerHTML = `<p style="color:#ef4444;">Error: ${e.message}</p>`;
    }
}


// ---- Save status change from modal ----
async function saveStatusChange() {
    if (!activeShipmentId) return;
    const newStatus = document.getElementById("newStatusSelect").value;

    try {
        const r = await fetch(`/api/shipments/${activeShipmentId}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ shipping_status: newStatus })
        });
        const data = await r.json();
        if (data.success) {
            showToast(`✅ Status updated to ${newStatus.replace("_", " ")}`, "success");
            if (data.notification) {
                showToast(data.notification, "info");
            }
            closeModal();
            loadShipments();
        } else {
            showToast("❌ " + data.message, "error");
        }
    } catch (e) {
        showToast("❌ Network error: " + e.message, "error");
    }
}


// ---- Delete shipment ----
async function deleteShipment(id) {
    if (!confirm("Are you sure you want to delete this shipment?")) return;
    try {
        const r = await fetch(`/api/shipments/${id}`, { method: "DELETE" });
        const data = await r.json();
        if (data.success) {
            showToast("🗑️ Shipment deleted", "success");
            loadShipments();
        } else {
            showToast("❌ " + data.message, "error");
        }
    } catch (e) {
        showToast("❌ " + e.message, "error");
    }
}


// ---- View tracking detail page ----
function viewTrackingPage(id) {
    window.location.href = `/admin/shipment-detail.html?id=${id}`;
}


// ---- Modal close ----
function closeModal() {
    const modal = document.getElementById("detailModal");
    if (modal) modal.classList.remove("active");
    activeShipmentId = null;
}

// Close on overlay click
document.addEventListener("click", (e) => {
    const overlay = document.getElementById("detailModal");
    if (overlay && e.target === overlay) closeModal();
});


// ---- Toast ----
function showToast(msg, type = "info") {
    const c = document.getElementById("shipToastContainer");
    if (!c) return;
    const t = document.createElement("div");
    t.className = `ship-toast ${type}`;
    t.innerHTML = `<i class="fa-solid ${type === "success" ? "fa-check-circle" : type === "error" ? "fa-circle-exclamation" : "fa-circle-info"}"></i> ${msg}`;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 300); }, 4000);
}


// ==========================================
// PRINTING FUNCTIONS
// ==========================================

async function printShipmentLabel(id) {
    if (!id) return;
    try {
        // Check if already in currentLoadedShipments
        const cached = (window.currentLoadedShipments || []).find(x => x.id == id);
        if (cached && cached.phone) {
            openPrintLabelWindow(cached);
            return;
        }

        const res = await fetch(`/api/shipments/${id}`);
        const data = await res.json();
        if (!data.success || !data.shipment) {
            showToast("Failed to fetch shipment details for printing", "error");
            return;
        }
        openPrintLabelWindow(data.shipment);
    } catch (e) {
        showToast("Error generating shipping label: " + e.message, "error");
    }
}

function printCurrentModalShipment() {
    if (window.activeShipmentData) {
        openPrintLabelWindow(window.activeShipmentData);
    } else if (activeShipmentId) {
        printShipmentLabel(activeShipmentId);
    }
}

function openPrintLabelWindow(s) {
    if (!s) return;
    const printWin = window.open("", "_blank", "width=850,height=700");
    if (!printWin) {
        alert("Please allow popups to print shipping labels");
        return;
    }

    const shipDate = s.shipping_date ? new Date(s.shipping_date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' });
    const expDelivery = s.expected_delivery ? new Date(s.expected_delivery).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' }) : "3 - 5 Days";
    const statusText = (s.shipping_status || "Shipped").replace("_", " ");
    const courier = s.courier_name || "Express Courier Service";
    const trackingNo = s.tracking_number || ("TRK" + (s.order_id || "1000") + Date.now().toString().slice(-4));

    printWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Shipping Label - Order #${s.order_id}</title>
            <style>
                @page { size: A5 landscape; margin: 8mm; }
                * { box-sizing: border-box; }
                body {
                    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
                    margin: 0;
                    padding: 15px;
                    color: #0f172a;
                    background: #ffffff;
                }
                .label-container {
                    border: 2.5px solid #000;
                    border-radius: 8px;
                    padding: 18px 22px;
                    max-width: 720px;
                    margin: 0 auto;
                }
                .top-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 2px solid #000;
                    padding-bottom: 12px;
                    margin-bottom: 14px;
                }
                .brand-title {
                    font-size: 24px;
                    font-weight: 900;
                    letter-spacing: -0.5px;
                }
                .brand-title span { color: #fe4c50; }
                .carrier-pill {
                    background: #000;
                    color: #fff;
                    font-size: 15px;
                    font-weight: 800;
                    padding: 6px 16px;
                    border-radius: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .barcode-wrap {
                    text-align: center;
                    margin: 10px 0 16px;
                    padding-bottom: 14px;
                    border-bottom: 1.5px dashed #475569;
                }
                .barcode-stripes {
                    height: 48px;
                    width: 75%;
                    margin: 0 auto 6px;
                    background: repeating-linear-gradient(90deg, #000 0px, #000 3px, #fff 3px, #fff 5px, #000 5px, #000 9px, #fff 9px, #fff 11px, #000 11px, #000 14px, #fff 14px, #fff 18px);
                }
                .tracking-code {
                    font-family: 'Courier New', monospace;
                    font-size: 19px;
                    font-weight: 800;
                    letter-spacing: 3px;
                }
                .address-layout {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    border-bottom: 2px solid #000;
                    padding-bottom: 14px;
                    margin-bottom: 14px;
                }
                .addr-col h4 {
                    margin: 0 0 6px 0;
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                    color: #64748b;
                    letter-spacing: 0.5px;
                }
                .addr-col .cust-name {
                    font-size: 17px;
                    font-weight: 800;
                    margin-bottom: 4px;
                    color: #0f172a;
                }
                .addr-col .cust-text {
                    font-size: 13.5px;
                    line-height: 1.45;
                    color: #334155;
                }
                .meta-summary {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 10px;
                    margin-bottom: 12px;
                }
                .meta-cell {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    padding: 8px 10px;
                }
                .meta-cell .meta-k {
                    font-size: 10px;
                    text-transform: uppercase;
                    font-weight: 700;
                    color: #64748b;
                }
                .meta-cell .meta-v {
                    font-size: 13px;
                    font-weight: 800;
                    color: #0f172a;
                    margin-top: 3px;
                }
                .cut-footer {
                    margin-top: 14px;
                    border-top: 1px dashed #94a3b8;
                    padding-top: 8px;
                    text-align: center;
                    font-size: 11px;
                    color: #64748b;
                    font-weight: 600;
                }
                .print-controls {
                    text-align: center;
                    margin-bottom: 14px;
                }
                .btn-print-now {
                    background: #6366f1;
                    color: #fff;
                    border: none;
                    padding: 8px 18px;
                    border-radius: 6px;
                    font-weight: 700;
                    font-size: 14px;
                    cursor: pointer;
                }
                @media print {
                    .print-controls { display: none !important; }
                    body { padding: 0; }
                }
            </style>
        </head>
        <body>
            <div class="print-controls">
                <button class="btn-print-now" onclick="window.print()">🖨️ Print Shipping Label</button>
            </div>
            <div class="label-container">
                <div class="top-bar">
                    <div class="brand-title">MY<span>STORE</span> LOGISTICS</div>
                    <div class="carrier-pill">${courier}</div>
                </div>

                <div class="barcode-wrap">
                    <div class="barcode-stripes"></div>
                    <div class="tracking-code">${trackingNo}</div>
                </div>

                <div class="address-layout">
                    <div class="addr-col">
                        <h4>SHIP FROM (RETURN SENDER):</h4>
                        <div class="cust-name">MyStore Central Hub</div>
                        <div class="cust-text">
                            Plot 42, Logistic Logistics Park, MIDC<br>
                            Mumbai, Maharashtra - 400001<br>
                            Phone: +91 98765 43210<br>
                            GSTIN: 27AABCS1429B1Z
                        </div>
                    </div>
                    <div class="addr-col">
                        <h4>SHIP TO (DELIVERY ADDRESS):</h4>
                        <div class="cust-name">${s.customer_name || "Customer"}</div>
                        <div class="cust-text">
                            ${s.address || "Delivery Address"}<br>
                            ${s.city || ""} ${s.state || ""} ${s.pincode ? "- " + s.pincode : ""}<br>
                            <strong>Phone:</strong> ${s.phone || "—"}<br>
                            <strong>Email:</strong> ${s.email || "—"}
                        </div>
                    </div>
                </div>

                <div class="meta-summary">
                    <div class="meta-cell">
                        <div class="meta-k">ORDER ID</div>
                        <div class="meta-v">#${s.order_id}</div>
                    </div>
                    <div class="meta-cell">
                        <div class="meta-k">SHIP DATE</div>
                        <div class="meta-v">${shipDate}</div>
                    </div>
                    <div class="meta-cell">
                        <div class="meta-k">EXPECTED DELIVERY</div>
                        <div class="meta-v">${expDelivery}</div>
                    </div>
                    <div class="meta-cell">
                        <div class="meta-k">PACKAGE STATUS</div>
                        <div class="meta-v">${statusText}</div>
                    </div>
                </div>

                <div class="cut-footer">
                    ✂ Cut along dashed line and affix securely to the exterior package of Order #${s.order_id}
                </div>
            </div>
            <script>
                window.onload = function() {
                    setTimeout(() => window.print(), 350);
                };
            <\/script>
        </body>
        </html>
    `);
    printWin.document.close();
}

function printShipmentsReport() {
    const list = window.currentLoadedShipments || [];
    if (!list.length) {
        showToast("No shipments to print in current view", "info");
        return;
    }

    const printWin = window.open("", "_blank", "width=900,height=700");
    if (!printWin) {
        alert("Please allow popups to print report");
        return;
    }

    const rows = list.map(s => `
        <tr>
            <td style="font-weight:700;">#${s.order_id}</td>
            <td>${s.customer_name || '—'}</td>
            <td>${s.address || '—'}</td>
            <td>${s.courier_name || '—'}</td>
            <td style="font-family:monospace;">${s.tracking_number || '—'}</td>
            <td><strong>${(s.shipping_status || 'Pending').replace('_', ' ')}</strong></td>
            <td>${s.shipping_date ? new Date(s.shipping_date).toLocaleDateString('en-IN') : '—'}</td>
        </tr>
    `).join("");

    printWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Shipments Dispatch Summary</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 25px; color: #111; }
                h2 { margin: 0 0 4px; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
                th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
                td { border: 1px solid #e2e8f0; padding: 9px; }
                tr:nth-child(even) { background: #f8fafc; }
            </style>
        </head>
        <body>
            <h2>MyStore - Shipments Dispatch Summary</h2>
            <p style="color:#64748b;margin:0 0 15px;">Generated on: ${new Date().toLocaleString('en-IN')} | Total Records: ${list.length}</p>
            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Address</th>
                        <th>Courier</th>
                        <th>Tracking ID</th>
                        <th>Status</th>
                        <th>Ship Date</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
            <script>
                window.onload = function() {
                    window.print();
                };
            <\/script>
        </body>
        </html>
    `);
    printWin.document.close();
}
