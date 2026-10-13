// ============================================================
// ADMIN ACTIVITY LOGS JS — Real-time Audit Trail & Filtering
// ============================================================

let currentView = "timeline"; // 'timeline' or 'table'
let currentPage = 1;
let currentLimit = 15;
let currentSearch = "";
let currentModule = "all";
let currentStatus = "all";
let currentDateFilter = "all";
let livePollingInterval = null;
let isLivePolling = true;

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
        second: "2-digit",
        hour12: true
    });
}

// Module badge styling class
function getModuleClass(mod) {
    const m = (mod || "").toLowerCase();
    switch (m) {
        case "products": return "mod-products";
        case "categories": return "mod-categories";
        case "inventory": return "mod-inventory";
        case "shipping": return "mod-shipping";
        case "payments": return "mod-payments";
        case "banners": return "mod-banners";
        case "users": return "mod-users";
        case "settings": return "mod-settings";
        case "auth": return "mod-auth";
        default: return "mod-settings";
    }
}

// Toast
function showToast(msg, type = "info") {
    const container = document.getElementById("logToastContainer");
    if (!container) return;
    const t = document.createElement("div");
    t.className = `log-toast ${type}`;
    t.textContent = msg;
    container.appendChild(t);
    setTimeout(() => t.remove(), 4000);
}

// ==========================================
// LOAD STATS
// ==========================================
async function loadStats() {
    try {
        const res = await fetch("/api/activity-logs/stats");
        const data = await res.json();
        if (!data.success) return;

        const s = data.stats;
        document.getElementById("statTotal").textContent = s.total || 0;
        document.getElementById("statToday").textContent = s.today || 0;
        document.getElementById("statSecurity").textContent = s.securitySettings || 0;
        document.getElementById("statOps").textContent = s.ordersOps || 0;
    } catch (err) {
        console.error("loadStats error:", err);
    }
}

// ==========================================
// LOAD ACTIVITY LOGS
// ==========================================
async function loadLogs() {
    const container = document.getElementById("logsContainer");
    if (!container) return;

    try {
        const params = new URLSearchParams({
            page: currentPage,
            limit: currentLimit,
            search: currentSearch,
            module: currentModule,
            status: currentStatus,
            date_filter: currentDateFilter
        });

        const res = await fetch(`/api/activity-logs?${params}`);
        const data = await res.json();

        if (!data.success) {
            container.innerHTML = `<div class="log-empty"><i class="fa-solid fa-triangle-exclamation"></i><h3>Error</h3><p>${escapeHtml(data.message)}</p></div>`;
            return;
        }

        renderLogs(data.logs || []);
        renderPagination(data.total, data.page, data.totalPages, data.limit);
    } catch (err) {
        console.error("loadLogs error:", err);
        container.innerHTML = `<div class="log-empty"><i class="fa-solid fa-triangle-exclamation"></i><h3>Network Error</h3><p>${escapeHtml(err.message)}</p></div>`;
    }
}

// ==========================================
// RENDER LOGS (Timeline or Table)
// ==========================================
function renderLogs(logs) {
    const container = document.getElementById("logsContainer");
    if (!logs.length) {
        container.innerHTML = `
            <div class="log-empty">
                <i class="fa-solid fa-clock-rotate-left"></i>
                <h3>No activity logs found</h3>
                <p>No actions match your current search and filter criteria.</p>
            </div>
        `;
        return;
    }

    if (currentView === "timeline") {
        renderTimelineView(logs, container);
    } else {
        renderTableView(logs, container);
    }
}

function renderTimelineView(logs, container) {
    const html = `
        <div class="log-timeline-container">
            ${logs.map(log => `
                <div class="timeline-entry">
                    <div class="timeline-badge status-${log.status || 'info'}">
                        <i class="fa-solid ${log.icon || 'fa-clock-rotate-left'}"></i>
                    </div>
                    <div class="timeline-card">
                        <div class="timeline-card-header">
                            <div class="timeline-user-meta">
                                <span class="timeline-avatar">${(log.admin_name || 'A').charAt(0).toUpperCase()}</span>
                                <span class="timeline-user-name">${escapeHtml(log.admin_name || 'Admin')}</span>
                                <span class="module-badge ${getModuleClass(log.module)}">${escapeHtml(log.module)}</span>
                                <span class="status-badge status-${log.status || 'info'}">${log.status || 'success'}</span>
                            </div>
                            <span class="timeline-time" title="${formatFullDate(log.created_at)}">
                                <i class="fa-regular fa-clock"></i> ${formatTimeAgo(log.created_at)}
                            </span>
                        </div>
                        <h4 class="timeline-action-title">
                            ${escapeHtml(log.action)}
                        </h4>
                        <div class="timeline-details-text">
                            ${escapeHtml(log.details || 'No additional details logged.')}
                        </div>
                        <div class="timeline-card-footer">
                            <span><i class="fa-solid fa-network-wired"></i> IP: <code>${escapeHtml(log.ip_address || '127.0.0.1')}</code></span>
                            <span><i class="fa-solid fa-calendar-check"></i> ${formatFullDate(log.created_at)}</span>
                        </div>
                    </div>
                </div>
            `).join("")}
        </div>
    `;
    container.innerHTML = html;
}

function renderTableView(logs, container) {
    const html = `
        <div class="log-table-card">
            <div class="log-table-wrap">
                <table class="log-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Timestamp</th>
                            <th>Admin</th>
                            <th>Module</th>
                            <th>Action</th>
                            <th>Status</th>
                            <th>Details</th>
                            <th>IP Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${logs.map(log => `
                            <tr>
                                <td style="font-weight:700;color:var(--log-primary);">#${log.id}</td>
                                <td style="white-space:nowrap;font-size:0.82rem;color:var(--log-muted);" title="${formatFullDate(log.created_at)}">
                                    ${formatTimeAgo(log.created_at)}
                                </td>
                                <td>
                                    <div style="display:flex;align-items:center;gap:6px;">
                                        <span class="timeline-avatar" style="width:20px;height:20px;font-size:0.65rem;">${(log.admin_name||'A').charAt(0)}</span>
                                        <strong>${escapeHtml(log.admin_name || 'Admin')}</strong>
                                    </div>
                                </td>
                                <td><span class="module-badge ${getModuleClass(log.module)}">${escapeHtml(log.module)}</span></td>
                                <td style="font-weight:600;color:var(--log-text);">${escapeHtml(log.action)}</td>
                                <td><span class="status-badge status-${log.status || 'info'}">${log.status || 'success'}</span></td>
                                <td style="max-width:320px;font-size:0.84rem;color:var(--log-text-body);" title="${escapeHtml(log.details)}">
                                    <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                                        ${escapeHtml(log.details || '—')}
                                    </div>
                                </td>
                                <td><code>${escapeHtml(log.ip_address || '127.0.0.1')}</code></td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    container.innerHTML = html;
}

// ==========================================
// PAGINATION
// ==========================================
function renderPagination(total, page, totalPages, limit) {
    const pInfo = document.getElementById("pageInfo");
    const pControls = document.getElementById("pageControls");
    if (!pInfo || !pControls) return;

    if (!total) {
        pInfo.textContent = "Showing 0 of 0 logs";
        pControls.innerHTML = "";
        return;
    }

    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);
    pInfo.textContent = `Showing ${start}-${end} of ${total} logs`;

    let btns = `
        <button class="log-page-btn" onclick="changePage(${page - 1})" ${page <= 1 ? "disabled" : ""}>
            <i class="fa-solid fa-chevron-left"></i>
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
            btns += `<button class="log-page-btn ${i === page ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === page - 2 || i === page + 2) {
            btns += `<span style="color:var(--log-muted);padding:0 4px;">...</span>`;
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
    loadLogs();
}

// Switch between Timeline & Table views
function switchView(view) {
    currentView = view;
    document.querySelectorAll(".view-tab-btn").forEach(b => b.classList.remove("active"));
    const activeBtn = document.getElementById(`viewBtn${view.charAt(0).toUpperCase() + view.slice(1)}`);
    if (activeBtn) activeBtn.classList.add("active");
    loadLogs();
}

// ==========================================
// EXPORT LOGS (CSV)
// ==========================================
async function exportLogs() {
    try {
        const res = await fetch("/api/activity-logs/export");
        const data = await res.json();
        if (!data.success || !data.logs.length) {
            showToast("No logs to export", "warning");
            return;
        }

        const headers = ["ID", "Timestamp", "Admin", "Module", "Action", "Status", "Details", "IP Address"];
        const rows = data.logs.map(l => [
            l.id,
            `"${formatFullDate(l.created_at)}"`,
            `"${l.admin_name || 'Admin'}"`,
            `"${l.module}"`,
            `"${(l.action || '').replace(/"/g, '""')}"`,
            `"${l.status}"`,
            `"${(l.details || '').replace(/"/g, '""')}"`,
            `"${l.ip_address || ''}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Activity_Logs_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast("Activity logs exported to CSV!", "success");
    } catch (err) {
        showToast("Export failed: " + err.message, "error");
    }
}

// ==========================================
// CLEAR LOGS MODAL
// ==========================================
function openClearModal() {
    const m = document.getElementById("clearLogsModal");
    if (m) m.classList.add("active");
}

function closeClearModal() {
    const m = document.getElementById("clearLogsModal");
    if (m) m.classList.remove("active");
}

async function confirmClearLogs() {
    const select = document.getElementById("clearOptionSelect");
    const days = select ? select.value : 0;

    try {
        const res = await fetch("/api/activity-logs/clear", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ days: parseInt(days) })
        });
        const data = await res.json();
        if (data.success) {
            showToast(data.message, "success");
            closeClearModal();
            loadStats();
            loadLogs();
        } else {
            showToast("Error: " + data.message, "error");
        }
    } catch (err) {
        showToast("Network error: " + err.message, "error");
    }
}

// ==========================================
// TOGGLE LIVE POLLING
// ==========================================
function toggleLivePolling() {
    isLivePolling = !isLivePolling;
    const btn = document.getElementById("liveToggleBtn");
    const indicator = document.getElementById("liveIndicator");

    if (isLivePolling) {
        if (indicator) indicator.style.display = "inline-flex";
        if (btn) btn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause Live';
        startPolling();
        showToast("Live polling enabled (updates every 10s)", "info");
    } else {
        if (indicator) indicator.style.display = "none";
        if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i> Resume Live';
        stopPolling();
        showToast("Live polling paused", "info");
    }
}

function startPolling() {
    if (livePollingInterval) clearInterval(livePollingInterval);
    livePollingInterval = setInterval(() => {
        loadStats();
        loadLogs();
    }, 10000);
}

function stopPolling() {
    if (livePollingInterval) clearInterval(livePollingInterval);
}

// ==========================================
// INIT & EVENT LISTENERS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    loadStats();
    loadLogs();
    startPolling();

    // Search input debounce
    const sInput = document.getElementById("logSearchInput");
    if (sInput) {
        let timeout = null;
        sInput.addEventListener("input", (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                currentSearch = e.target.value;
                currentPage = 1;
                loadLogs();
            }, 300);
        });
    }

    // Module select
    const mSelect = document.getElementById("logModuleSelect");
    if (mSelect) {
        mSelect.addEventListener("change", (e) => {
            currentModule = e.target.value;
            currentPage = 1;
            loadLogs();
        });
    }

    // Status select
    const stSelect = document.getElementById("logStatusSelect");
    if (stSelect) {
        stSelect.addEventListener("change", (e) => {
            currentStatus = e.target.value;
            currentPage = 1;
            loadLogs();
        });
    }

    // Date select
    const dSelect = document.getElementById("logDateSelect");
    if (dSelect) {
        dSelect.addEventListener("change", (e) => {
            currentDateFilter = e.target.value;
            currentPage = 1;
            loadLogs();
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
