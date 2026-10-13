// ============================================================
// ADMIN ORDER NOTIFICATIONS JAVASCRIPT
// Real-time Alerts, Chime, Mark As Read & Fast Dispatch Links
// ============================================================

let currentFilter = "all"; // 'all', 'unread', 'read'
let currentSearch = "";
let currentPage = 1;
let currentLimit = 15;
let audioEnabled = localStorage.getItem("adminOrderAudio") !== "false";
let previousUnreadCount = null;
let pollInterval = null;

// Helper: Escape HTML
function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
}

// Relative time formatter
function formatTimeAgo(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - d) / 1000);

    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
}

// Full date formatter
function formatFullDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
}

// Web Audio API Gentle Notification Bell Chime
function playChime() {
    if (!audioEnabled) return;
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = "sine";
        osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

        osc2.type = "sine";
        osc2.frequency.setValueAtTime(880, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.25); // D6

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(ctx.currentTime);
        osc2.start(ctx.currentTime + 0.08);

        osc1.stop(ctx.currentTime + 0.8);
        osc2.stop(ctx.currentTime + 0.8);
    } catch (e) {
        console.warn("Audio chime failed:", e);
    }
}

// Toast notification
function showToast(msg, type = "info") {
    const c = document.getElementById("notifToastContainer");
    if (!c) return;
    const t = document.createElement("div");
    t.className = `notif-toast ${type}`;
    t.innerHTML = msg;
    c.appendChild(t);
    setTimeout(() => t.remove(), 4000);
}

// ==========================================
// LOAD NOTIFICATIONS
// ==========================================
async function loadNotifications(isPolling = false) {
    const listContainer = document.getElementById("notifListContainer");
    if (!listContainer) return;

    try {
        const params = new URLSearchParams({
            filter: currentFilter,
            search: currentSearch,
            page: currentPage,
            limit: currentLimit
        });

        const res = await fetch(`/api/order-notifications?${params}`);
        const data = await res.json();

        if (!data.success) {
            listContainer.innerHTML = `<div class="notif-empty"><i class="fa-solid fa-triangle-exclamation"></i><h3>Error loading</h3><p>${escapeHtml(data.message)}</p></div>`;
            return;
        }

        // Update stats
        const s = data.stats || {};
        document.getElementById("statUnread").textContent = s.unread || 0;
        document.getElementById("statTotal").textContent = s.total || 0;
        document.getElementById("statToday").textContent = s.today || 0;
        document.getElementById("statRevenue").textContent = `₹${parseFloat(s.pendingRevenue || 0).toLocaleString('en-IN')}`;

        // Update tab badge counters
        const tabUnreadBadge = document.getElementById("tabUnreadCount");
        if (tabUnreadBadge) {
            tabUnreadBadge.textContent = s.unread || 0;
            tabUnreadBadge.style.display = s.unread > 0 ? "inline-block" : "none";
        }

        // Update sidebar badge
        updateSidebarBadge(s.unread || 0);

        // Check for new incoming order during live polling
        if (isPolling && previousUnreadCount !== null && (s.unread || 0) > previousUnreadCount) {
            playChime();
            showToast(`🔔 <strong>New Order Alert!</strong> An order was just placed!`, "alert");
        }
        previousUnreadCount = s.unread || 0;

        renderNotificationsList(data.notifications || []);
        renderPagination(data.total, data.page, data.totalPages, data.limit);

    } catch (err) {
        console.error("loadNotifications error:", err);
        if (!isPolling) {
            listContainer.innerHTML = `<div class="notif-empty"><i class="fa-solid fa-triangle-exclamation"></i><h3>Network error</h3><p>${escapeHtml(err.message)}</p></div>`;
        }
    }
}

// Update sidebar badge
function updateSidebarBadge(count) {
    const badges = document.querySelectorAll(".nav-order-badge, #orderNotifCount, #sidebarOrderNotifBadge");
    badges.forEach(b => {
        b.textContent = count > 99 ? "99+" : count;
        if (count > 0) {
            b.classList.add("has-orders");
            b.style.display = "inline-block";
        } else {
            b.classList.remove("has-orders");
            b.style.display = "none";
        }
    });
}

// Render notifications feed
function renderNotificationsList(notifications) {
    const container = document.getElementById("notifListContainer");
    if (!notifications.length) {
        container.innerHTML = `
            <div class="notif-empty">
                <i class="fa-solid fa-bell-slash"></i>
                <h3>No order notifications found</h3>
                <p>No customer orders match your current filter settings.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="notif-list">
            ${notifications.map(n => `
                <div class="notif-card ${n.is_read ? 'is-read' : 'is-unread'}" id="notif-card-${n.id}">
                    <div class="notif-icon-wrap">
                        <i class="fa-solid ${n.is_read ? 'fa-box-archive' : 'fa-box-open'}"></i>
                    </div>
                    <div class="notif-content">
                        <div class="notif-topline">
                            <div class="notif-order-title">
                                <span class="notif-order-id">Order #${n.order_id}</span>
                                ${!n.is_read ? '<span class="unread-pill"><span class="unread-pill-dot"></span> New Order</span>' : ''}
                                <span class="badge-order-status ord-${(n.order_status||'pending').toLowerCase()}">${escapeHtml(n.order_status||'pending')}</span>
                            </div>
                            <span class="notif-time" title="${formatFullDate(n.created_at)}">
                                <i class="fa-regular fa-clock"></i> ${formatTimeAgo(n.created_at)}
                            </span>
                        </div>

                        <div class="notif-details-grid">
                            <div class="notif-detail-item">
                                <i class="fa-solid fa-user"></i>
                                <strong>${escapeHtml(n.customer_name || 'Customer')}</strong>
                            </div>
                            ${n.customer_email ? `
                            <div class="notif-detail-item">
                                <i class="fa-solid fa-envelope"></i>
                                <span>${escapeHtml(n.customer_email)}</span>
                            </div>` : ''}
                            ${n.customer_phone ? `
                            <div class="notif-detail-item">
                                <i class="fa-solid fa-phone"></i>
                                <span>${escapeHtml(n.customer_phone)}</span>
                            </div>` : ''}
                            <div class="notif-detail-item">
                                <i class="fa-solid fa-indian-rupee-sign"></i>
                                <span class="notif-amount">₹${parseFloat(n.total_amount || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div class="notif-detail-item">
                                <span class="badge-pay-method">${escapeHtml(n.payment_method || 'Online')}</span>
                                <span class="badge-pay-status pay-${(n.payment_status||'pending').toLowerCase()}">${escapeHtml(n.payment_status || 'Pending')}</span>
                            </div>
                        </div>

                        <div class="notif-actions">
                            <a href="/admin/create-shipment.html" class="btn-notif-primary" title="Create dispatch shipment for this order">
                                <i class="fa-solid fa-truck-fast"></i> Create Shipment
                            </a>
                            <button type="button" class="btn-notif-action" onclick="toggleRead(${n.id}, ${n.is_read ? 0 : 1})">
                                <i class="fa-solid ${n.is_read ? 'fa-envelope' : 'fa-envelope-open'}"></i>
                                ${n.is_read ? 'Mark as Unread' : 'Mark as Read'}
                            </button>
                            <a href="/admin/shipping.html?search=${n.order_id}" class="btn-notif-action" title="View in Shipments">
                                <i class="fa-solid fa-magnifying-glass"></i> Track Order
                            </a>
                            <button type="button" class="btn-notif-danger" style="margin-left:auto;" onclick="deleteNotification(${n.id})" title="Delete alert">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join("")}
        </div>
    `;
}

// ==========================================
// ACTIONS
// ==========================================
async function toggleRead(id, newStatus) {
    try {
        const res = await fetch(`/api/order-notifications/${id}/read`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_read: newStatus })
        });
        const data = await res.json();
        if (data.success) {
            showToast(data.message, "success");
            loadNotifications();
        } else {
            showToast(data.message, "error");
        }
    } catch (err) {
        showToast("Error updating status: " + err.message, "error");
    }
}

async function markAllRead() {
    try {
        const res = await fetch("/api/order-notifications/mark-all-read", {
            method: "PUT"
        });
        const data = await res.json();
        if (data.success) {
            showToast("All order notifications marked as read", "success");
            loadNotifications();
        } else {
            showToast(data.message, "error");
        }
    } catch (err) {
        showToast("Error: " + err.message, "error");
    }
}

async function deleteNotification(id) {
    if (!confirm("Are you sure you want to remove this notification?")) return;
    try {
        const res = await fetch(`/api/order-notifications/${id}`, {
            method: "DELETE"
        });
        const data = await res.json();
        if (data.success) {
            showToast("Notification deleted", "info");
            loadNotifications();
        } else {
            showToast(data.message, "error");
        }
    } catch (err) {
        showToast("Error: " + err.message, "error");
    }
}

async function clearReadNotifications() {
    if (!confirm("Clear all read order notifications from the list?")) return;
    try {
        const res = await fetch("/api/order-notifications/clear-read", {
            method: "DELETE"
        });
        const data = await res.json();
        if (data.success) {
            showToast("Read notifications cleared", "success");
            loadNotifications();
        } else {
            showToast(data.message, "error");
        }
    } catch (err) {
        showToast("Error: " + err.message, "error");
    }
}

// Toggle audio alert chime
function toggleAudio() {
    audioEnabled = !audioEnabled;
    localStorage.setItem("adminOrderAudio", audioEnabled);
    updateAudioBtn();
    if (audioEnabled) {
        playChime();
        showToast("🔔 Order chime enabled (Test sound played)", "info");
    } else {
        showToast("🔕 Order chime muted", "info");
    }
}

function updateAudioBtn() {
    const btn = document.getElementById("audioToggleBtn");
    if (btn) {
        btn.innerHTML = audioEnabled
            ? '<i class="fa-solid fa-volume-high"></i> Sound Alert: ON'
            : '<i class="fa-solid fa-volume-xmark"></i> Sound Alert: OFF';
    }
}

// Tabs
function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll(".notif-tab-btn").forEach(b => b.classList.remove("active"));
    const activeBtn = document.getElementById(`tabBtn${filter.charAt(0).toUpperCase() + filter.slice(1)}`);
    if (activeBtn) activeBtn.classList.add("active");
    currentPage = 1;
    loadNotifications();
}

// Pagination
function renderPagination(total, page, totalPages, limit) {
    const pInfo = document.getElementById("notifPageInfo");
    const pControls = document.getElementById("notifPageControls");
    if (!pInfo || !pControls) return;

    if (!total) {
        pInfo.textContent = "Showing 0 of 0";
        pControls.innerHTML = "";
        return;
    }

    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);
    pInfo.textContent = `Showing ${start}-${end} of ${total} notifications`;

    let btns = `
        <button class="log-page-btn" onclick="changePage(${page - 1})" ${page <= 1 ? "disabled" : ""}>
            <i class="fa-solid fa-chevron-left"></i>
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
            btns += `<button class="log-page-btn ${i === page ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === page - 2 || i === page + 2) {
            btns += `<span style="color:var(--notif-muted);padding:0 4px;">...</span>`;
        }
    }

    btns += `
        <button class="log-page-btn" onclick="changePage(${page + 1})" ${page >= totalPages ? "disabled" : ""}>
            <i class="fa-solid fa-chevron-right"></i>
        </button>
    `;

    pControls.innerHTML = btns;
}

function changePage(p) {
    currentPage = p;
    loadNotifications();
}

// ==========================================
// INIT
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    updateAudioBtn();
    loadNotifications();

    // Auto poll every 8 seconds for new order alerts
    pollInterval = setInterval(() => {
        loadNotifications(true);
    }, 8000);

    // Search input
    const sInput = document.getElementById("notifSearchInput");
    if (sInput) {
        let timer = null;
        sInput.addEventListener("input", (e) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                currentSearch = e.target.value;
                currentPage = 1;
                loadNotifications();
            }, 300);
        });
    }

    // Mobile sidebar toggle
    const menuBtn = document.getElementById("menuBtn");
    if (menuBtn) {
        menuBtn.addEventListener("click", () => {
            const sb = document.getElementById("sidebar");
            if (sb) sb.classList.toggle("open");
        });
    }

    // Logout
    const logoutBtn = document.getElementById("logoutButton");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("admin");
            window.location.href = "/login.html";
        });
    }
});
