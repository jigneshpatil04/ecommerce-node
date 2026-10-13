// ==========================================
// ADMIN PAYMENTS & REFUNDS JAVASCRIPT
// ==========================================

"use strict";

let currentPage = 1;
const LIMIT = 15;
let currentTab = "all";
let currentMethod = "all";
let currentStatus = "all";
let currentDateRange = "all";
let currentSearch = "";
let currentCustomStart = "";
let currentCustomEnd = "";
let selectedPaymentData = null;

document.addEventListener("DOMContentLoaded", () => {
    loadStats();
    loadPayments();

    // Date range dropdown toggle for custom date
    const dateFilter = document.getElementById("dateFilter");
    if (dateFilter) {
        dateFilter.addEventListener("change", (e) => {
            const customGroup = document.getElementById("customDateGroup");
            if (e.target.value === "custom") {
                customGroup.style.display = "flex";
            } else {
                customGroup.style.display = "none";
            }
        });
    }

    // Search input debounce
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener("input", () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                currentSearch = searchInput.value.trim();
                currentPage = 1;
                if (currentTab === "refunds") loadRefunds();
                else loadPayments();
            }, 350);
        });
    }
});

// ==========================================
// 1. LOAD KPI STATS & DAILY CHART
// ==========================================
async function loadStats() {
    try {
        const res = await fetch("/api/payments/stats");
        const data = await res.json();
        if (!data.success) return;

        const s = data.stats;
        document.getElementById("statRevenue").textContent = `₹${s.totalRevenue.toLocaleString("en-IN")}`;
        document.getElementById("statTxnCount").textContent = `${s.successfulCount} successful transactions`;
        document.getElementById("statOnline").textContent = `₹${s.onlineRevenue.toLocaleString("en-IN")}`;
        document.getElementById("statCOD").textContent = `₹${s.codRevenue.toLocaleString("en-IN")}`;
        document.getElementById("statRefunds").textContent = `₹${s.refundTotal.toLocaleString("en-IN")}`;
        document.getElementById("statRefundCount").textContent = `${s.refundedCount} refund requests`;

        // Update Tab Badges
        document.getElementById("tabBadgeAll").textContent = s.totalTransactions;
        document.getElementById("tabBadgeSuccess").textContent = s.successfulCount;
        document.getElementById("tabBadgePending").textContent = s.pendingCount;
        document.getElementById("tabBadgeFailed").textContent = s.failedCount;
        document.getElementById("tabBadgeRefunds").textContent = s.refundedCount;

        // Update Method Distribution Progress Bar
        const collectedTotal = s.onlineRevenue + s.codRevenue;
        if (collectedTotal > 0) {
            const onlinePct = Math.round((s.onlineRevenue / collectedTotal) * 100);
            const codPct = 100 - onlinePct;
            document.getElementById("barOnlineTxt").textContent = `₹${s.onlineRevenue.toLocaleString("en-IN")} (${onlinePct}%)`;
            document.getElementById("barOnlineProgress").style.width = `${onlinePct}%`;
            document.getElementById("barCODTxt").textContent = `₹${s.codRevenue.toLocaleString("en-IN")} (${codPct}%)`;
            document.getElementById("barCODProgress").style.width = `${codPct}%`;
        }

        // Render Bar Chart (Last 7 days)
        renderBarChart(data.dailyTrends || []);

    } catch (err) {
        console.error("loadStats error:", err);
    }
}

function renderBarChart(trends) {
    const container = document.getElementById("barChartContainer");
    if (!container) return;

    if (!trends || trends.length === 0) {
        container.innerHTML = `
            <div style="width:100%;text-align:center;color:#94a3b8;font-size:0.85rem;margin:auto;">
                <i class="fa-solid fa-chart-simple"></i> No revenue recorded in the last 7 days.
            </div>`;
        return;
    }

    const maxVal = Math.max(...trends.map(t => parseFloat(t.successful_amount || 0)), 1);

    container.innerHTML = trends.map(t => {
        const amount = parseFloat(t.successful_amount || 0);
        const heightPct = Math.max(Math.round((amount / maxVal) * 100), 5);
        return `
            <div class="chart-bar-group" title="${t.day_label}: ₹${amount.toLocaleString('en-IN')}">
                <span style="font-size:0.7rem;color:#10b981;font-weight:700;">₹${amount > 0 ? (amount >= 1000 ? (amount/1000).toFixed(1) + 'k' : amount) : '0'}</span>
                <div class="chart-bar-track">
                    <div class="chart-bar-fill" style="height: ${heightPct}%;"></div>
                </div>
                <span class="chart-bar-label">${t.day_label}</span>
            </div>
        `;
    }).join("");
}

// ==========================================
// 2. LOAD PAYMENTS TABLE
// ==========================================
async function loadPayments() {
    const tbody = document.getElementById("paymentsTableBody");
    const pTable = document.getElementById("paymentsTable");
    const rTable = document.getElementById("refundsTable");

    pTable.style.display = "table";
    rTable.style.display = "none";

    tbody.innerHTML = `<tr><td colspan="8"><div class="ship-loading"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading transactions...</div></td></tr>`;

    try {
        let url = `/api/payments?page=${currentPage}&limit=${LIMIT}`;
        if (currentSearch) url += `&search=${encodeURIComponent(currentSearch)}`;
        if (currentMethod !== "all") url += `&method=${currentMethod}`;

        // Status from tab or dropdown
        const statusParam = (currentTab !== "all" && currentTab !== "refunds") ? currentTab : currentStatus;
        if (statusParam !== "all") url += `&status=${statusParam}`;

        if (currentDateRange !== "all") {
            url += `&dateRange=${currentDateRange}`;
            if (currentDateRange === "custom" && currentCustomStart && currentCustomEnd) {
                url += `&startDate=${currentCustomStart}&endDate=${currentCustomEnd}`;
            }
        }

        const res = await fetch(url);
        const data = await res.json();
        if (!data.success) {
            tbody.innerHTML = `<tr><td colspan="8"><div class="ship-empty"><i class="fa-solid fa-triangle-exclamation"></i><p>${data.message}</p></div></td></tr>`;
            return;
        }

        renderPaymentsTable(data.payments);
        renderPagination(data.total, data.page, data.limit);

    } catch (err) {
        console.error("loadPayments error:", err);
        tbody.innerHTML = `<tr><td colspan="8"><div class="ship-empty"><i class="fa-solid fa-triangle-exclamation"></i><p>Failed to load data: ${err.message}</p></div></td></tr>`;
    }
}

function renderPaymentsTable(payments) {
    const tbody = document.getElementById("paymentsTableBody");
    if (!payments || payments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8"><div class="ship-empty"><i class="fa-solid fa-receipt"></i><p>No payment transactions found matching your criteria.</p></div></td></tr>`;
        return;
    }

    tbody.innerHTML = payments.map(p => {
        const badgeCls = `badge-${p.status.toLowerCase()}`;
        const methodCls = p.payment_method.toLowerCase() === 'cod' ? 'cod' : 'online';
        const methodIcon = p.payment_method.toLowerCase() === 'cod' ? 'fa-hand-holding-dollar' : 'fa-credit-card';
        const formattedDate = new Date(p.payment_date).toLocaleDateString("en-IN", {
            day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
        });

        return `
            <tr>
                <td class="pay-code">${p.payment_id}</td>
                <td><a href="/admin/shipping.html?search=${p.order_id}" style="color:#6366f1;font-weight:600;text-decoration:none;">#${p.order_id}</a></td>
                <td>
                    <div style="font-weight:700;color:#0f172a;">${p.customer_name || 'Customer'}</div>
                    <small style="color:#94a3b8;">${p.customer_email || ''}</small>
                </td>
                <td style="font-weight:800;color:#0f172a;">₹${parseFloat(p.amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                <td>
                    <span class="method-tag ${methodCls}">
                        <i class="fa-solid ${methodIcon}"></i> ${p.payment_method}
                    </span>
                </td>
                <td>
                    <span class="pay-badge ${badgeCls}">
                        <i class="fa-solid ${getStatusIcon(p.status)}"></i> ${p.status}
                    </span>
                </td>
                <td style="color:#64748b;font-size:0.84rem;font-weight:500;">${formattedDate}</td>
                <td style="text-align:right;">
                    <div class="ship-actions" style="justify-content:flex-end;">
                        <button onclick="viewPaymentDetails('${p.payment_id}')" title="View Details">
                            <i class="fa-solid fa-eye"></i> View
                        </button>
                        ${(p.payment_method === 'COD' && p.status === 'Pending') ? `
                            <button onclick="markPaymentPaid('${p.payment_id}')" style="border-color:#10b981;color:#10b981;" title="Mark Paid">
                                <i class="fa-solid fa-check"></i> Paid
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

function getStatusIcon(status) {
    if (status === 'Successful') return 'fa-circle-check';
    if (status === 'Pending') return 'fa-clock';
    if (status === 'Failed') return 'fa-circle-xmark';
    if (status === 'Refunded') return 'fa-rotate-left';
    return 'fa-circle';
}

// ==========================================
// 3. LOAD REFUNDS TABLE
// ==========================================
async function loadRefunds() {
    const tbody = document.getElementById("refundsTableBody");
    const pTable = document.getElementById("paymentsTable");
    const rTable = document.getElementById("refundsTable");

    pTable.style.display = "none";
    rTable.style.display = "table";

    tbody.innerHTML = `<tr><td colspan="8"><div class="ship-loading"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading refund requests...</div></td></tr>`;

    try {
        const res = await fetch("/api/payments/refunds");
        const data = await res.json();
        if (!data.success || !data.refunds || data.refunds.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8"><div class="ship-empty"><i class="fa-solid fa-rotate-left"></i><p>No refund requests recorded.</p></div></td></tr>`;
            return;
        }

        tbody.innerHTML = data.refunds.map(r => {
            const badgeCls = r.status === 'Completed' ? 'badge-successful' : (r.status === 'Rejected' ? 'badge-failed' : 'badge-pending');
            return `
                <tr>
                    <td style="font-family:monospace;font-weight:700;color:#ef4444;">${r.refund_id}</td>
                    <td class="pay-code">${r.payment_id || '—'}</td>
                    <td><a href="/admin/shipping.html?search=${r.order_id}" style="color:#6366f1;font-weight:600;text-decoration:none;">#${r.order_id}</a></td>
                    <td style="font-weight:700;color:#0f172a;">${r.customer_name || 'Customer'}</td>
                    <td style="font-weight:700;color:#ef4444;">₹${parseFloat(r.amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    <td style="color:#94a3b8;font-size:0.85rem;max-width:180px;">${r.reason || 'Return/Cancel'}</td>
                    <td>
                        <span class="pay-badge ${badgeCls}">${r.status}</span>
                    </td>
                    <td style="text-align:right;">
                        <div class="ship-actions" style="justify-content:flex-end;">
                            ${r.status === 'Pending' ? `
                                <button onclick="updateRefund('${r.refund_id}', 'Completed')" style="border-color:#10b981;color:#10b981;" title="Approve & Complete">
                                    <i class="fa-solid fa-check"></i> Approve
                                </button>
                                <button onclick="updateRefund('${r.refund_id}', 'Rejected')" class="del-btn" title="Reject">
                                    <i class="fa-solid fa-xmark"></i> Reject
                                </button>
                            ` : `
                                <span style="font-size:0.8rem;color:#94a3b8;">${r.status}</span>
                            `}
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        // Hide pagination for full refunds list
        document.getElementById("paginationBar").style.display = "none";

    } catch (err) {
        console.error("loadRefunds error:", err);
        tbody.innerHTML = `<tr><td colspan="8"><div class="ship-empty"><i class="fa-solid fa-triangle-exclamation"></i><p>Error loading refunds: ${err.message}</p></div></td></tr>`;
    }
}

async function updateRefund(refundId, status) {
    if (!confirm(`Are you sure you want to change refund status to "${status}"?`)) return;
    try {
        const res = await fetch(`/api/payments/refunds/${refundId}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        });
        const data = await res.json();
        if (data.success) {
            showToast(`✅ Refund status updated to ${status}`, "success");
            loadRefunds();
            loadStats();
        } else {
            showToast(`❌ ${data.message}`, "error");
        }
    } catch (err) {
        showToast(`❌ Error: ${err.message}`, "error");
    }
}

// ==========================================
// 4. VIEW PAYMENT DETAILS MODAL
// ==========================================
async function viewPaymentDetails(paymentId) {
    try {
        const res = await fetch(`/api/payments/${paymentId}`);
        const data = await res.json();
        if (!data.success) {
            showToast("Failed to fetch payment details", "error");
            return;
        }

        const p = data.payment;
        selectedPaymentData = p;

        const modalBody = document.getElementById("modalBody");
        const formattedDate = new Date(p.payment_date).toLocaleString("en-IN", {
            dateStyle: "medium", timeStyle: "short"
        });

        modalBody.innerHTML = `
            <div class="pay-detail-grid">
                <div class="pay-detail-item">
                    <span class="lbl">Payment ID</span>
                    <span class="val" style="font-family:monospace;color:#10b981;font-weight:700;">${p.payment_id}</span>
                </div>
                <div class="pay-detail-item">
                    <span class="lbl">Order ID</span>
                    <span class="val"><a href="/admin/shipping.html?search=${p.order_id}" style="color:#6366f1;text-decoration:none;">#${p.order_id}</a></span>
                </div>
                <div class="pay-detail-item full">
                    <span class="lbl">Customer</span>
                    <span class="val">${p.customer_name || 'Customer'}<br><small style="color:#94a3b8;">${p.customer_email || ''} ${p.customer_phone ? '• ' + p.customer_phone : ''}</small></span>
                </div>
                <div class="pay-detail-item">
                    <span class="lbl">Amount</span>
                    <span class="val" style="font-size:1.25rem;font-weight:800;color:#0f172a;">₹${parseFloat(p.amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </div>
                <div class="pay-detail-item">
                    <span class="lbl">Payment Method</span>
                    <span class="val"><span class="method-tag ${p.payment_method.toLowerCase() === 'cod' ? 'cod' : 'online'}">${p.payment_method}</span></span>
                </div>
                <div class="pay-detail-item">
                    <span class="lbl">Payment Status</span>
                    <span class="val"><span class="pay-badge badge-${p.status.toLowerCase()}">${p.status}</span></span>
                </div>
                <div class="pay-detail-item">
                    <span class="lbl">Transaction ID</span>
                    <span class="val" style="font-family:monospace;color:#94a3b8;">${p.transaction_id || 'N/A'}</span>
                </div>
                <div class="pay-detail-item full">
                    <span class="lbl">Payment Date</span>
                    <span class="val">${formattedDate}</span>
                </div>
                ${p.failure_reason ? `
                <div class="pay-detail-item full" style="background:rgba(239,68,68,0.1);padding:10px;border-radius:8px;">
                    <span class="lbl" style="color:#ef4444;">Failure Reason</span>
                    <span class="val" style="color:#fca5a5;">${p.failure_reason}</span>
                </div>` : ''}
            </div>
        `;

        // COD Action
        const codWrapper = document.getElementById("codActionWrapper");
        if (p.payment_method === 'COD' && p.status === 'Pending') {
            codWrapper.innerHTML = `
                <button class="btn-primary" onclick="markPaymentPaid('${p.payment_id}')" style="background:#10b981;">
                    <i class="fa-solid fa-check"></i> Mark as Paid (Delivery Completed)
                </button>
            `;
        } else {
            codWrapper.innerHTML = '';
        }

        // Setup initiate refund button
        const btnRefund = document.getElementById("btnInitiateRefund");
        if (p.status === 'Successful') {
            btnRefund.style.display = "inline-flex";
            btnRefund.onclick = () => openInitiateRefundModal(p);
        } else {
            btnRefund.style.display = "none";
        }

        document.getElementById("payDetailModal").classList.add("active");

    } catch (err) {
        console.error("viewPaymentDetails error:", err);
    }
}

function closePayModal() {
    document.getElementById("payDetailModal").classList.remove("active");
}

async function markPaymentPaid(paymentId) {
    if (!confirm(`Mark payment ${paymentId} as Paid / Successful?`)) return;
    try {
        const res = await fetch(`/api/payments/${paymentId}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "Successful" })
        });
        const data = await res.json();
        if (data.success) {
            showToast("✅ Payment marked as Successful", "success");
            closePayModal();
            loadStats();
            loadPayments();
        } else {
            showToast(`❌ ${data.message}`, "error");
        }
    } catch (err) {
        showToast(`❌ Error: ${err.message}`, "error");
    }
}

// ==========================================
// 5. INITIATE REFUND MODAL
// ==========================================
function openInitiateRefundModal(payment) {
    closePayModal();
    const body = document.getElementById("refundModalBody");
    body.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:12px;">
            <p style="color:#94a3b8;font-size:0.85rem;margin:0;">
                Initiate a refund for order <strong>#${payment.order_id}</strong> (${payment.customer_name}).
            </p>
            <div class="form-group">
                <label>Refund Amount (₹)</label>
                <input type="number" id="refundAmountInput" value="${payment.amount}" max="${payment.amount}" min="1" step="0.01" style="background:#ffffff;border:1.5px solid #e2e8f0;color:#0f172a;padding:10px 14px;border-radius:8px;width:100%;box-sizing:border-box;font-weight:600;">
            </div>
            <div class="form-group">
                <label>Reason for Refund</label>
                <textarea id="refundReasonInput" placeholder="e.g. Product returned, Customer cancellation..." style="background:#ffffff;border:1.5px solid #e2e8f0;color:#0f172a;padding:10px 14px;border-radius:8px;width:100%;box-sizing:border-box;min-height:70px;font-weight:500;"></textarea>
            </div>
            <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:10px;">
                <button class="btn-secondary" onclick="closeRefundModal()">Cancel</button>
                <button class="btn-primary" onclick="submitRefund('${payment.payment_id}', ${payment.order_id})" style="background:#ef4444;">
                    <i class="fa-solid fa-rotate-left"></i> Submit Refund
                </button>
            </div>
        </div>
    `;
    document.getElementById("refundActionModal").classList.add("active");
}

function closeRefundModal() {
    document.getElementById("refundActionModal").classList.remove("active");
}

async function submitRefund(paymentId, orderId) {
    const amount = document.getElementById("refundAmountInput").value;
    const reason = document.getElementById("refundReasonInput").value;

    if (!amount || amount <= 0) {
        showToast("Enter a valid refund amount", "error");
        return;
    }

    try {
        const res = await fetch("/api/payments/refunds", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payment_id: paymentId, order_id: orderId, amount, reason })
        });
        const data = await res.json();
        if (data.success) {
            showToast("✅ Refund request submitted successfully", "success");
            closeRefundModal();
            loadStats();
            switchTab("refunds");
        } else {
            showToast(`❌ ${data.message}`, "error");
        }
    } catch (err) {
        showToast(`❌ Error: ${err.message}`, "error");
    }
}

// ==========================================
// 6. TAB & FILTER CONTROLS
// ==========================================
function switchTab(tab) {
    currentTab = tab;
    currentPage = 1;

    document.querySelectorAll(".pay-tab").forEach(b => {
        b.classList.remove("active");
        if (b.dataset.tab === tab) b.classList.add("active");
    });

    if (tab === "refunds") {
        loadRefunds();
    } else {
        loadPayments();
    }
}

function filterByMethod(method) {
    currentMethod = method;
    document.getElementById("methodFilter").value = method;
    currentPage = 1;
    switchTab("all");
}

function applyFilters() {
    currentMethod = document.getElementById("methodFilter").value;
    currentStatus = document.getElementById("statusFilter").value;
    currentDateRange = document.getElementById("dateFilter").value;
    currentCustomStart = document.getElementById("startDateInput").value;
    currentCustomEnd = document.getElementById("endDateInput").value;
    currentPage = 1;

    if (currentTab === "refunds") loadRefunds();
    else loadPayments();
}

function resetFilters() {
    document.getElementById("searchInput").value = "";
    document.getElementById("methodFilter").value = "all";
    document.getElementById("statusFilter").value = "all";
    document.getElementById("dateFilter").value = "all";
    document.getElementById("customDateGroup").style.display = "none";
    document.getElementById("startDateInput").value = "";
    document.getElementById("endDateInput").value = "";

    currentSearch = "";
    currentMethod = "all";
    currentStatus = "all";
    currentDateRange = "all";
    currentCustomStart = "";
    currentCustomEnd = "";
    currentPage = 1;

    if (currentTab === "refunds") loadRefunds();
    else loadPayments();
}

// ==========================================
// 7. PAGINATION
// ==========================================
function renderPagination(total, page, limit) {
    const bar = document.getElementById("paginationBar");
    const pageInfo = document.getElementById("pageInfo");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    if (!bar) return;
    const totalPages = Math.ceil(total / limit);

    if (total === 0 || totalPages <= 1) {
        bar.style.display = "none";
        return;
    }

    bar.style.display = "flex";
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);
    pageInfo.textContent = `Showing ${start}–${end} of ${total} transactions`;
    prevBtn.disabled = page <= 1;
    nextBtn.disabled = page >= totalPages;
}

function changePage(delta) {
    currentPage += delta;
    loadPayments();
}

// ==========================================
// 8. EXPORT (Excel CSV / PDF Printable)
// ==========================================
async function exportData(format) {
    try {
        let url = `/api/payments/export?method=${currentMethod}&status=${currentStatus}&dateRange=${currentDateRange}`;
        if (currentDateRange === "custom" && currentCustomStart && currentCustomEnd) {
            url += `&startDate=${currentCustomStart}&endDate=${currentCustomEnd}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        if (!data.success || !data.records || data.records.length === 0) {
            showToast("No records available to export", "info");
            return;
        }

        if (format === 'excel') {
            // CSV Export
            const headers = ["Payment ID", "Order ID", "Customer", "Email", "Amount", "Method", "Status", "Transaction ID", "Date"];
            const csvRows = [headers.join(",")];

            data.records.forEach(r => {
                const row = [
                    r.payment_id,
                    `#${r.order_id}`,
                    `"${(r.customer_name || '').replace(/"/g, '""')}"`,
                    `"${(r.customer_email || '').replace(/"/g, '""')}"`,
                    r.amount,
                    r.payment_method,
                    r.status,
                    r.transaction_id || 'N/A',
                    `"${new Date(r.payment_date).toISOString()}"`
                ];
                csvRows.push(row.join(","));
            });

            const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `Payment_Report_${new Date().toISOString().split("T")[0]}.csv`;
            link.click();
            showToast("📥 Exported Excel/CSV successfully!", "success");

        } else if (format === 'pdf') {
            // PDF Print View
            const printWin = window.open("", "_blank");
            const rowsHtml = data.records.map(r => `
                <tr>
                    <td style="padding:8px;border:1px solid #ddd;">${r.payment_id}</td>
                    <td style="padding:8px;border:1px solid #ddd;">#${r.order_id}</td>
                    <td style="padding:8px;border:1px solid #ddd;">${r.customer_name}</td>
                    <td style="padding:8px;border:1px solid #ddd;">₹${parseFloat(r.amount).toLocaleString('en-IN')}</td>
                    <td style="padding:8px;border:1px solid #ddd;">${r.payment_method}</td>
                    <td style="padding:8px;border:1px solid #ddd;">${r.status}</td>
                    <td style="padding:8px;border:1px solid #ddd;">${new Date(r.payment_date).toLocaleDateString()}</td>
                </tr>
            `).join("");

            printWin.document.write(`
                <html>
                <head>
                    <title>Payment Transactions Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h2 { margin-bottom: 4px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                        th { background: #f4f4f4; padding: 10px; border: 1px solid #ddd; text-align: left; }
                    </style>
                </head>
                <body>
                    <h2>Payment Report</h2>
                    <p style="color:#666;">Generated on: ${new Date().toLocaleString('en-IN')}</p>
                    <p>Total Transactions: ${data.records.length}</p>
                    <table>
                        <thead>
                            <tr><th>Payment ID</th><th>Order ID</th><th>Customer</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr>
                        </thead>
                        <tbody>${rowsHtml}</tbody>
                    </table>
                    <script>window.onload = function() { window.print(); };<\/script>
                </body>
                </html>
            `);
            printWin.document.close();
            showToast("📄 PDF Print Report generated", "success");
        }

    } catch (err) {
        showToast(`Export error: ${err.message}`, "error");
    }
}

// Toast helper
function showToast(msg, type = "info") {
    const c = document.getElementById("payToastContainer");
    if (!c) return;
    const t = document.createElement("div");
    t.className = `ship-toast ${type}`;
    t.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info')}"></i> ${msg}`;
    c.appendChild(t);
    setTimeout(() => {
        t.style.opacity = "0";
        setTimeout(() => t.remove(), 300);
    }, 4000);
}
