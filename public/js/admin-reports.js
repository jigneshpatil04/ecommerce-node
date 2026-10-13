// ============================================================
// ADMIN REPORTS & ANALYTICS JAVASCRIPT
// Handles Daily, Weekly, Monthly Sales, Top Products,
// Cancelled Orders, Chart.js Visualizations & Excel/PDF Exports
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    // State
    let currentPeriod = "all";
    let currentMetric = "revenue"; // 'revenue' or 'orders'
    let currentData = null;
    let salesChartInstance = null;
    let categoryChartInstance = null;
    let logSearchQuery = "";

    // DOM Elements - KPIs
    const kpiRevenue = document.getElementById("kpiRevenue");
    const kpiDeliveredRevenue = document.getElementById("kpiDeliveredRevenue");
    const kpiInProgressRevenue = document.getElementById("kpiInProgressRevenue");
    const kpiOrders = document.getElementById("kpiOrders");
    const kpiAOV = document.getElementById("kpiAOV");
    const kpiUnits = document.getElementById("kpiUnits");
    const kpiCancelledOrders = document.getElementById("kpiCancelledOrders");
    const kpiCancelledLoss = document.getElementById("kpiCancelledLoss");
    const kpiCancelRate = document.getElementById("kpiCancelRate");

    // Controls
    const timeframePills = document.querySelectorAll(".timeframe-pill");
    const customRangeWrap = document.getElementById("customRangeWrap");
    const customStartDate = document.getElementById("customStartDate");
    const customEndDate = document.getElementById("customEndDate");
    const applyRangeBtn = document.getElementById("applyRangeBtn");
    const refreshBtn = document.getElementById("refreshBtn");
    const trendSubtitle = document.getElementById("trendSubtitle");
    const chartToggleBtns = document.querySelectorAll(".chart-toggle-btn");

    // Tables
    const topProductsBody = document.getElementById("topProductsBody");
    const topProductsCount = document.getElementById("topProductsCount");
    const cancelledOrdersBody = document.getElementById("cancelledOrdersBody");
    const cancelledOrdersBadge = document.getElementById("cancelledOrdersBadge");
    const ordersLogBody = document.getElementById("ordersLogBody");
    const logSearchInput = document.getElementById("logSearchInput");
    const categoryLegendList = document.getElementById("categoryLegendList");

    // Export buttons
    const exportExcelBtn = document.getElementById("exportExcelBtn");
    const exportPdfBtn = document.getElementById("exportPdfBtn");

    // Mobile menu & logout
    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");
    const logoutButton = document.getElementById("logoutButton");

    if (menuBtn && sidebar) {
        menuBtn.addEventListener("click", () => sidebar.classList.toggle("open"));
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            localStorage.removeItem("adminLoggedIn");
            window.location.href = "./login.html";
        });
    }

    // ============================================================
    // TOAST NOTIFICATIONS
    // ============================================================
    function showToast(message, type = "success") {
        const container = document.getElementById("toastContainer");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = `admin-toast ${type === "error" ? "toast-error" : "toast-success"}`;
        toast.innerHTML = `
            <i class="fa-solid ${type === "error" ? "fa-circle-exclamation text-danger" : "fa-circle-check text-success"}"></i>
            <span>${message}</span>
        `;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(15px)";
            setTimeout(() => toast.remove(), 250);
        }, 3000);
    }

    // ============================================================
    // FORMATTING HELPERS
    // ============================================================
    function formatCurrency(val) {
        const num = Number(val || 0);
        return "₹" + num.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function formatNumber(val) {
        return Number(val || 0).toLocaleString("en-IN");
    }

    function formatDate(dateStr) {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "-";
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });
    }

    function escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // ============================================================
    // FETCH ANALYTICS DATA
    // ============================================================
    async function fetchAnalytics() {
        let url = `/api/admin/reports/analytics?period=${currentPeriod}`;
        if (currentPeriod === "custom") {
            const start = customStartDate.value;
            const end = customEndDate.value;
            if (!start || !end) {
                showToast("Please choose both start and end dates", "error");
                return;
            }
            url += `&startDate=${start}&endDate=${end}`;
        }

        try {
            if (refreshBtn) refreshBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;

            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
                showToast(data.message || "Failed to load report data", "error");
                return;
            }

            currentData = data;
            renderAll();
            showToast("Report metrics updated!");
        } catch (error) {
            console.error("fetchAnalytics error:", error);
            showToast("Error connecting to analytics server", "error");
        } finally {
            if (refreshBtn) refreshBtn.innerHTML = `<i class="fa-solid fa-rotate"></i>`;
        }
    }

    // ============================================================
    // RENDER ALL SECTIONS
    // ============================================================
    function renderAll() {
        if (!currentData) return;

        renderKPIs();
        renderTrendChart();
        renderCategoryChart();
        renderTopProducts();
        renderCancelledOrders();
        renderOrdersLog();
    }

    // ============================================================
    // 1. RENDER KPIS
    // ============================================================
    function renderKPIs() {
        const sum = currentData.summary || {};
        kpiRevenue.textContent = formatCurrency(sum.totalRevenue);
        kpiDeliveredRevenue.textContent = formatCurrency(sum.deliveredRevenue);
        kpiInProgressRevenue.textContent = formatCurrency(sum.inProgressRevenue);

        kpiOrders.textContent = formatNumber(sum.totalOrders);
        kpiAOV.textContent = formatCurrency(sum.averageOrderValue);
        kpiUnits.textContent = formatNumber(sum.totalUnitsSold);

        kpiCancelledOrders.textContent = formatNumber(sum.cancelledOrders);
        kpiCancelledLoss.textContent = formatCurrency(sum.cancelledRevenue);
        kpiCancelRate.textContent = `${sum.cancellationRate}%`;

        // Update subtitle text based on period
        const periodLabels = {
            today: "Viewing today's hourly sales breakdown",
            this_week: "Viewing this week's daily sales breakdown",
            this_month: "Viewing this month's daily sales breakdown",
            this_year: "Viewing this year's monthly revenue trend",
            custom: "Viewing custom timeframe sales",
            all: "Viewing all-time sales metrics"
        };
        trendSubtitle.textContent = periodLabels[currentPeriod] || "Sales performance across time";
    }

    // ============================================================
    // 2. RENDER TREND CHART (Chart.js)
    // ============================================================
    function renderTrendChart() {
        const ctx = document.getElementById("salesTrendChart");
        if (!ctx) return;

        const trend = currentData.salesTrend || [];
        const labels = trend.map((t) => t.label);
        const dataValues = trend.map((t) =>
            currentMetric === "revenue" ? t.revenue : t.orders
        );

        if (salesChartInstance) {
            salesChartInstance.destroy();
        }

        const isRevenue = currentMetric === "revenue";

        salesChartInstance = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels.length ? labels : ["No Data"],
                datasets: [
                    {
                        label: isRevenue ? "Revenue (₹)" : "Orders Placed",
                        data: dataValues.length ? dataValues : [0],
                        borderColor: isRevenue ? "#fe4c50" : "#3b82f6",
                        backgroundColor: isRevenue ? "rgba(254, 76, 80, 0.12)" : "rgba(59, 130, 246, 0.12)",
                        borderWidth: 3,
                        fill: true,
                        tension: 0.35,
                        pointBackgroundColor: isRevenue ? "#fe4c50" : "#3b82f6",
                        pointBorderColor: "#ffffff",
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: "#1e1e27",
                        titleFont: { family: "Inter", size: 13, weight: "700" },
                        bodyFont: { family: "Inter", size: 12 },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: (context) => {
                                const val = context.parsed.y;
                                return isRevenue
                                    ? ` Revenue: ₹${val.toLocaleString("en-IN")}`
                                    : ` Orders: ${val}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { family: "Inter", size: 11 }, color: "#64748b" }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: "#f1f5f9" },
                        ticks: {
                            font: { family: "Inter", size: 11 },
                            color: "#64748b",
                            callback: (val) =>
                                isRevenue
                                    ? `₹${val >= 1000 ? (val / 1000).toFixed(0) + "k" : val}`
                                    : val
                        }
                    }
                }
            }
        });
    }

    // ============================================================
    // 3. RENDER CATEGORY DOUGHNUT CHART
    // ============================================================
    function renderCategoryChart() {
        const ctx = document.getElementById("categoryChart");
        if (!ctx) return;

        const catData = currentData.categorySales || [];
        const labels = catData.map((c) => c.category);
        const values = catData.map((c) => c.revenue);
        const palette = ["#fe4c50", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];

        if (categoryChartInstance) {
            categoryChartInstance.destroy();
        }

        const totalCatRev = values.reduce((a, b) => a + b, 0);

        if (labels.length === 0 || totalCatRev === 0) {
            categoryChartInstance = new Chart(ctx, {
                type: "doughnut",
                data: {
                    labels: ["No Sales Recorded"],
                    datasets: [{ data: [1], backgroundColor: ["#e2e8f0"] }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                }
            });
            categoryLegendList.innerHTML = `<p class="text-muted text-center py-2 text-sm">No category sales in this period.</p>`;
            return;
        }

        categoryChartInstance = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels,
                datasets: [
                    {
                        data: values,
                        backgroundColor: palette.slice(0, labels.length),
                        borderWidth: 2,
                        borderColor: "#ffffff"
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "68%",
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: "#1e1e27",
                        callbacks: {
                            label: (context) => {
                                const val = context.parsed;
                                const pct = totalCatRev > 0 ? Math.round((val / totalCatRev) * 100) : 0;
                                return ` ${context.label}: ₹${val.toLocaleString("en-IN")} (${pct}%)`;
                            }
                        }
                    }
                }
            }
        });

        // Render legend list below
        categoryLegendList.innerHTML = catData
            .map((cat, i) => {
                const color = palette[i % palette.length];
                const pct = totalCatRev > 0 ? Math.round((cat.revenue / totalCatRev) * 100) : 0;
                return `
                    <div class="category-legend-item">
                        <div class="category-legend-left">
                            <span class="cat-color-dot" style="background-color: ${color};"></span>
                            <span>${escapeHtml(cat.category)}</span>
                        </div>
                        <div>
                            <strong>${formatCurrency(cat.revenue)}</strong>
                            <span class="text-muted ml-1">(${pct}%)</span>
                        </div>
                    </div>
                `;
            })
            .join("");
    }

    // ============================================================
    // 4. RENDER TOP SELLING PRODUCTS
    // ============================================================
    function renderTopProducts() {
        const top = currentData.topProducts || [];
        topProductsCount.textContent = `${top.length} Products`;

        if (top.length === 0) {
            topProductsBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-5 text-muted">
                        <i class="fa-regular fa-box-open fa-2x mb-2"></i>
                        <p>No product sales recorded in this timeframe.</p>
                    </td>
                </tr>
            `;
            return;
        }

        topProductsBody.innerHTML = top
            .map((p, idx) => {
                const rank = idx + 1;
                const rankClass = rank === 1 ? "rank-1" : rank === 2 ? "rank-2" : rank === 3 ? "rank-3" : "";
                return `
                    <tr>
                        <td>
                            <span class="rank-pill ${rankClass}">${rank}</span>
                        </td>
                        <td>
                            <div class="prod-meta-cell">
                                <img src="${p.image}" class="prod-meta-img" alt="${escapeHtml(p.product_name)}" onerror="this.src='/images/shirt2.jpg'">
                                <div class="prod-meta-info">
                                    <span class="prod-meta-title">${escapeHtml(p.product_name)}</span>
                                    <span class="prod-meta-price">${formatCurrency(p.current_price)}</span>
                                </div>
                            </div>
                        </td>
                        <td>
                            <span class="badge-pill bg-primary-soft text-primary font-weight-bold">${escapeHtml(p.category || "General")}</span>
                        </td>
                        <td style="text-align: right; font-weight: 800; font-size: 14px;">
                            ${formatNumber(p.units_sold)} pcs
                        </td>
                        <td style="text-align: right; font-weight: 800; color: #1e1e27; font-size: 14px;">
                            ${formatCurrency(p.total_revenue)}
                        </td>
                    </tr>
                `;
            })
            .join("");
    }

    // ============================================================
    // 5. RENDER CANCELLED ORDERS
    // ============================================================
    function renderCancelledOrders() {
        const cancelled = currentData.cancelledOrdersList || [];
        cancelledOrdersBadge.textContent = `${cancelled.length} Cancelled`;

        if (cancelled.length === 0) {
            cancelledOrdersBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-5 text-success">
                        <i class="fa-solid fa-circle-check fa-2x mb-2"></i>
                        <p>Great news! Zero cancelled orders in this timeframe.</p>
                    </td>
                </tr>
            `;
            return;
        }

        cancelledOrdersBody.innerHTML = cancelled
            .map((o) => `
                <tr>
                    <td>
                        <strong class="text-danger">#${o.id}</strong>
                        <div class="text-muted" style="font-size: 11px;">${formatDate(o.created_at)}</div>
                    </td>
                    <td>
                        <div style="font-weight: 700; color: #1e1e27;">${escapeHtml(o.customer_name)}</div>
                        <div class="text-muted" style="font-size: 11.5px;">${escapeHtml(o.phone || o.email)}</div>
                    </td>
                    <td>
                        <div style="font-size: 12.5px; max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(o.items_summary || '')}">
                            ${escapeHtml(o.items_summary || "Order items")}
                        </div>
                    </td>
                    <td>
                        <span class="badge-pill bg-light text-dark font-weight-bold">${escapeHtml(o.payment_method || 'Online')}</span>
                    </td>
                    <td style="text-align: right; font-weight: 800; color: #ef4444; font-size: 14px;">
                        ${formatCurrency(o.total)}
                    </td>
                </tr>
            `)
            .join("");
    }

    // ============================================================
    // 6. RENDER RECENT ORDERS LOG
    // ============================================================
    function renderOrdersLog() {
        if (!ordersLogBody) return;
        let orders = currentData.recentOrders || [];

        if (logSearchQuery) {
            const q = logSearchQuery.toLowerCase();
            orders = orders.filter((o) => {
                const matchId = String(o.id).includes(q);
                const matchName = (o.customer_name || "").toLowerCase().includes(q);
                const matchEmail = (o.email || "").toLowerCase().includes(q);
                const matchStatus = (o.status || "").toLowerCase().includes(q);
                return matchId || matchName || matchEmail || matchStatus;
            });
        }

        if (orders.length === 0) {
            ordersLogBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-5 text-muted">
                        <i class="fa-regular fa-clipboard-list fa-2x mb-2"></i>
                        <p>No orders found matching your filter criteria.</p>
                    </td>
                </tr>
            `;
            return;
        }

        ordersLogBody.innerHTML = orders
            .map((o) => {
                const s = (o.status || "Pending").toLowerCase();
                let statusBadge = `<span class="order-status-badge status-pending">Pending</span>`;
                if (s === "delivered" || s === "completed") {
                    statusBadge = `<span class="order-status-badge status-delivered">Delivered</span>`;
                } else if (s === "cancelled") {
                    statusBadge = `<span class="order-status-badge status-cancelled">Cancelled</span>`;
                } else if (s === "processing" || s === "shipped") {
                    statusBadge = `<span class="order-status-badge status-processing">${escapeHtml(o.status)}</span>`;
                }

                return `
                    <tr>
                        <td><strong>#${o.id}</strong></td>
                        <td>${formatDate(o.created_at)}</td>
                        <td><strong>${escapeHtml(o.customer_name)}</strong></td>
                        <td class="text-muted">${escapeHtml(o.email)}</td>
                        <td>${o.items_count} items</td>
                        <td><span class="badge-pill bg-light font-weight-bold">${escapeHtml(o.payment_method)}</span></td>
                        <td>${statusBadge}</td>
                        <td style="text-align: right; font-weight: 800; font-size: 14px;">${formatCurrency(o.total)}</td>
                    </tr>
                `;
            })
            .join("");
    }

    // ============================================================
    // TIMEFRAME PILL HANDLERS
    // ============================================================
    timeframePills.forEach((pill) => {
        pill.addEventListener("click", () => {
            timeframePills.forEach((p) => p.classList.remove("active"));
            pill.classList.add("active");
            currentPeriod = pill.getAttribute("data-period");

            if (currentPeriod === "custom") {
                customRangeWrap.style.display = "flex";
            } else {
                customRangeWrap.style.display = "none";
                fetchAnalytics();
            }
        });
    });

    if (applyRangeBtn) {
        applyRangeBtn.addEventListener("click", () => {
            if (!customStartDate.value || !customEndDate.value) {
                showToast("Please choose both start and end dates", "error");
                return;
            }
            fetchAnalytics();
        });
    }

    if (refreshBtn) {
        refreshBtn.addEventListener("click", fetchAnalytics);
    }

    // Chart metric toggle
    chartToggleBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            chartToggleBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            currentMetric = btn.getAttribute("data-metric");
            renderTrendChart();
        });
    });

    // Orders log search input
    if (logSearchInput) {
        logSearchInput.addEventListener("input", (e) => {
            logSearchQuery = e.target.value.trim();
            renderOrdersLog();
        });
    }

    // ============================================================
    // EXPORT TO EXCEL (.xlsx / .csv)
    // ============================================================
    exportExcelBtn.addEventListener("click", async () => {
        try {
            exportExcelBtn.disabled = true;
            exportExcelBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Exporting...`;

            // Fetch detailed export dataset
            let exportUrl = `/api/admin/reports/export-data?period=${currentPeriod}`;
            if (currentPeriod === "custom") {
                exportUrl += `&startDate=${customStartDate.value}&endDate=${customEndDate.value}`;
            }

            const res = await fetch(exportUrl);
            const json = await res.json();
            const exportRows = json.data || [];

            if (window.XLSX && currentData) {
                // Multi-sheet workbook via SheetJS
                const wb = XLSX.utils.book_new();

                // Sheet 1: Executive KPI Summary
                const summaryData = [
                    ["MYSTORE SALES & PERFORMANCE REPORT"],
                    ["Report Period", currentPeriod.toUpperCase()],
                    ["Generated On", new Date().toLocaleString()],
                    [],
                    ["Metric", "Value"],
                    ["Total Revenue", currentData.summary.totalRevenue],
                    ["Total Orders", currentData.summary.totalOrders],
                    ["Units Sold", currentData.summary.totalUnitsSold],
                    ["Average Order Value (AOV)", currentData.summary.averageOrderValue],
                    ["Delivered Revenue", currentData.summary.deliveredRevenue],
                    ["In-Progress Revenue", currentData.summary.inProgressRevenue],
                    ["Cancelled Orders", currentData.summary.cancelledOrders],
                    ["Cancelled Revenue Loss", currentData.summary.cancelledRevenue],
                    ["Cancellation Rate", `${currentData.summary.cancellationRate}%`]
                ];
                const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
                XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

                // Sheet 2: Top Selling Products
                const topProds = (currentData.topProducts || []).map((p, i) => ({
                    Rank: i + 1,
                    "Product ID": p.product_id,
                    "Product Name": p.product_name,
                    Category: p.category,
                    Price: p.current_price,
                    "Units Sold": p.units_sold,
                    "Total Revenue": p.total_revenue,
                    "Orders Count": p.orders_count
                }));
                const wsTop = XLSX.utils.json_to_sheet(topProds);
                XLSX.utils.book_append_sheet(wb, wsTop, "Top Products");

                // Sheet 3: Cancelled Orders Audit
                const cancList = (currentData.cancelledOrdersList || []).map((c) => ({
                    "Order ID": c.id,
                    "Customer Name": c.customer_name,
                    Email: c.email,
                    Phone: c.phone,
                    "Items Summary": c.items_summary,
                    "Payment Method": c.payment_method,
                    "Lost Revenue": c.total,
                    "Date Cancelled": c.created_at
                }));
                const wsCanc = XLSX.utils.json_to_sheet(cancList);
                XLSX.utils.book_append_sheet(wb, wsCanc, "Cancelled Orders");

                // Sheet 4: Detailed Order Items Log
                const wsDetailed = XLSX.utils.json_to_sheet(exportRows);
                XLSX.utils.book_append_sheet(wb, wsDetailed, "Detailed Orders");

                // Save XLSX file
                const fileName = `MyStore_Report_${currentPeriod}_${new Date().toISOString().slice(0, 10)}.xlsx`;
                XLSX.writeFile(wb, fileName);
                showToast(`Excel spreadsheet downloaded: ${fileName}`);
            } else {
                // Fallback to CSV
                exportToCsv(exportRows);
            }
        } catch (err) {
            console.error("Export Excel error:", err);
            showToast("Failed to generate Excel file", "error");
        } finally {
            exportExcelBtn.disabled = false;
            exportExcelBtn.innerHTML = `<i class="fa-solid fa-file-excel"></i> Export Excel`;
        }
    });

    function exportToCsv(rows) {
        if (!rows || !rows.length) {
            showToast("No data available to export", "error");
            return;
        }
        const headers = Object.keys(rows[0]);
        const csvRows = [headers.join(",")];

        for (const row of rows) {
            const values = headers.map((header) => {
                const escaped = ("" + (row[header] || "")).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(","));
        }

        const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `MyStore_Report_${currentPeriod}_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast("CSV report downloaded!");
    }

    // ============================================================
    // EXPORT TO PDF
    // ============================================================
    exportPdfBtn.addEventListener("click", () => {
        if (!currentData) {
            showToast("No data to export", "error");
            return;
        }

        const sum = currentData.summary || {};
        document.getElementById("pdfPeriodLabel").textContent = currentPeriod.toUpperCase();
        document.getElementById("pdfGeneratedAt").textContent = new Date().toLocaleString();
        document.getElementById("pdfRevenue").textContent = formatCurrency(sum.totalRevenue);
        document.getElementById("pdfOrders").textContent = formatNumber(sum.totalOrders);
        document.getElementById("pdfUnits").textContent = formatNumber(sum.totalUnitsSold);
        document.getElementById("pdfCancelled").textContent = `${formatNumber(sum.cancelledOrders)} (${formatCurrency(sum.cancelledRevenue)})`;

        // Populate Top Products table
        const top = currentData.topProducts || [];
        document.getElementById("pdfTopProductsBody").innerHTML = top
            .map((p, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td><strong>${escapeHtml(p.product_name)}</strong></td>
                    <td>${escapeHtml(p.category)}</td>
                    <td style="text-align: right;">${p.units_sold}</td>
                    <td style="text-align: right; font-weight: 700;">${formatCurrency(p.total_revenue)}</td>
                </tr>
            `)
            .join("");

        // Populate Cancelled Orders table
        const canc = currentData.cancelledOrdersList || [];
        document.getElementById("pdfCancelledBody").innerHTML = canc.length
            ? canc
                  .map((c) => `
                <tr>
                    <td>#${c.id}</td>
                    <td>${escapeHtml(c.customer_name)}</td>
                    <td>${formatDate(c.created_at)}</td>
                    <td>${escapeHtml(c.payment_method)}</td>
                    <td style="text-align: right; color: #dc2626; font-weight: 700;">${formatCurrency(c.total)}</td>
                </tr>
            `)
                  .join("")
            : `<tr><td colspan="5" style="text-align:center; color:#059669;">Zero cancelled orders</td></tr>`;

        // Trigger native browser print-to-PDF
        window.print();
        showToast("PDF report preview opened! You can save as PDF.");
    });

    // Initial Load
    fetchAnalytics();
});
