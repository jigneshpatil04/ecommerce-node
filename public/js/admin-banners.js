// ============================================================
// ADMIN BANNERS JAVASCRIPT
// Handles Upload, Edit, Schedule, Show/Hide, and Table Rendering
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    // State
    let bannersList = [];
    let currentFilter = "all";
    let searchQuery = "";
    let deleteTargetId = null;

    // DOM Elements
    const bannersTableBody = document.getElementById("bannersTableBody");
    const emptyState = document.getElementById("emptyState");
    const filterPills = document.querySelectorAll(".filter-pill");
    const searchInput = document.getElementById("searchInput");
    
    // Stats
    const statTotalBanners = document.getElementById("statTotalBanners");
    const statActiveBanners = document.getElementById("statActiveBanners");
    const statScheduledBanners = document.getElementById("statScheduledBanners");
    const statHiddenBanners = document.getElementById("statHiddenBanners");

    // Modal
    const bannerModal = document.getElementById("bannerModal");
    const bannerForm = document.getElementById("bannerForm");
    const modalTitle = document.getElementById("modalTitle");
    const modalSub = document.getElementById("modalSub");
    const saveBtnText = document.getElementById("saveBtnText");
    const openAddBannerBtn = document.getElementById("openAddBannerBtn");
    const emptyAddBtn = document.getElementById("emptyAddBtn");
    const modalCloseBtn = document.getElementById("modalCloseBtn");
    const modalCancelBtn = document.getElementById("modalCancelBtn");

    // Form inputs
    const bannerIdInput = document.getElementById("bannerId");
    const bannerPosition = document.getElementById("bannerPosition");
    const bannerStatus = document.getElementById("bannerStatus");
    const bannerTitle = document.getElementById("bannerTitle");
    const bannerBadge = document.getElementById("bannerBadge");
    const bannerSubtitle = document.getElementById("bannerSubtitle");
    const buttonText = document.getElementById("buttonText");
    const bannerLink = document.getElementById("bannerLink");
    const secondaryButtonText = document.getElementById("secondaryButtonText");
    const secondaryLink = document.getElementById("secondaryLink");
    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");
    const displayOrderInput = document.getElementById("displayOrder");
    const clearScheduleBtn = document.getElementById("clearScheduleBtn");

    // Image Upload & Preview
    const imageInput = document.getElementById("imageInput");
    const imageUrlInput = document.getElementById("imageUrlInput");
    const imagePreview = document.getElementById("imagePreview");
    const previewTitleText = document.getElementById("previewTitleText");
    const previewBadgeText = document.getElementById("previewBadgeText");
    const dropzone = document.getElementById("dropzone");
    const recDims = document.getElementById("recDims");

    // Delete Modal
    const deleteModal = document.getElementById("deleteModal");
    const deleteBannerTitle = document.getElementById("deleteBannerTitle");
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    const deleteModalCloseBtn = document.getElementById("deleteModalCloseBtn");

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
    // DATE FORMATTER HELPER
    // ============================================================
    function formatDateTime(dateStr) {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return null;
        return d.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
    }

    function toInputDateTime(dateStr) {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "";
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    // ============================================================
    // FETCH BANNERS FROM API
    // ============================================================
    async function fetchBanners() {
        try {
            const res = await fetch("/api/banners/admin");
            const data = await res.json();

            if (!data.success) {
                showToast(data.message || "Failed to load banners", "error");
                return;
            }

            bannersList = data.banners || [];

            // Update stats
            if (data.stats) {
                statTotalBanners.textContent = data.stats.total;
                statActiveBanners.textContent = data.stats.active;
                statScheduledBanners.textContent = data.stats.scheduled;
                statHiddenBanners.textContent = data.stats.hidden + data.stats.expired;
            }

            renderTable();
        } catch (error) {
            console.error("fetchBanners error:", error);
            showToast("Network error fetching banners", "error");
            bannersTableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-5 text-danger">
                        <i class="fa-solid fa-triangle-exclamation fa-2x mb-2"></i>
                        <p>Error connecting to server. Please try refreshing.</p>
                    </td>
                </tr>
            `;
        }
    }

    // ============================================================
    // RENDER TABLE
    // ============================================================
    function renderTable() {
        // Filter logic
        let filtered = bannersList.filter((b) => {
            // Position/status filter
            if (currentFilter === "hero" && b.position !== "hero") return false;
            if (currentFilter === "promo" && b.position !== "promo") return false;
            if (currentFilter === "active" && b.schedule_status !== "active") return false;
            if (currentFilter === "scheduled" && b.schedule_status !== "scheduled") return false;
            if (currentFilter === "hidden" && b.schedule_status !== "hidden" && b.schedule_status !== "expired") return false;

            // Search query filter
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchTitle = (b.title || "").toLowerCase().includes(q);
                const matchSub = (b.subtitle || "").toLowerCase().includes(q);
                const matchBadge = (b.badge || "").toLowerCase().includes(q);
                if (!matchTitle && !matchSub && !matchBadge) return false;
            }

            return true;
        });

        if (filtered.length === 0) {
            bannersTableBody.innerHTML = "";
            emptyState.style.display = "block";
            return;
        }

        emptyState.style.display = "none";

        bannersTableBody.innerHTML = filtered.map((banner) => {
            const isHero = banner.position === "hero";
            const posBadge = isHero
                ? `<span class="pos-badge pos-hero"><i class="fa-solid fa-panorama"></i> Hero Slider</span>`
                : `<span class="pos-badge pos-promo"><i class="fa-solid fa-tag"></i> Promotional</span>`;

            // Schedule Badge
            let schedBadge = "";
            let schedDetail = "";

            if (banner.schedule_status === "active") {
                schedBadge = `<span class="sched-badge sched-active"><i class="fa-solid fa-circle-check"></i> Active Now</span>`;
            } else if (banner.schedule_status === "scheduled") {
                schedBadge = `<span class="sched-badge sched-scheduled"><i class="fa-solid fa-clock"></i> Scheduled</span>`;
            } else if (banner.schedule_status === "expired") {
                schedBadge = `<span class="sched-badge sched-expired"><i class="fa-solid fa-ban"></i> Expired</span>`;
            } else {
                schedBadge = `<span class="sched-badge sched-hidden"><i class="fa-solid fa-eye-slash"></i> Hidden</span>`;
            }

            const startFormatted = formatDateTime(banner.start_date);
            const endFormatted = formatDateTime(banner.end_date);

            if (startFormatted && endFormatted) {
                schedDetail = `<div class="sched-dates-sub"><span><i class="fa-regular fa-calendar-plus text-success"></i> ${startFormatted}</span><span><i class="fa-regular fa-calendar-xmark text-danger"></i> ${endFormatted}</span></div>`;
            } else if (startFormatted) {
                schedDetail = `<div class="sched-dates-sub"><span><i class="fa-regular fa-calendar-plus text-success"></i> Starts ${startFormatted}</span></div>`;
            } else if (endFormatted) {
                schedDetail = `<div class="sched-dates-sub"><span><i class="fa-regular fa-calendar-xmark text-danger"></i> Ends ${endFormatted}</span></div>`;
            } else {
                schedDetail = `<div class="sched-dates-sub"><span class="text-muted"><i class="fa-solid fa-infinity"></i> Perpetual (Always Active)</span></div>`;
            }

            const isChecked = banner.status === "active";

            return `
                <tr data-id="${banner.id}">
                    <td>
                        <span class="order-num-pill">${banner.display_order}</span>
                    </td>
                    <td>
                        <div class="banner-thumb-wrap" onclick="window.open('${banner.image}', '_blank')" title="Click to view full image">
                            <img src="${banner.image}" alt="${escapeHtml(banner.title)}" onerror="this.src='/images/jacket1.jpg'">
                        </div>
                    </td>
                    <td>
                        <div class="banner-title-text">
                            ${banner.badge ? `<span class="banner-badge-pill">${escapeHtml(banner.badge)}</span>` : ""}
                            ${escapeHtml(banner.title)}
                        </div>
                        ${banner.subtitle ? `<p class="banner-sub-text">${escapeHtml(banner.subtitle)}</p>` : ""}
                        ${banner.link ? `<a href="${banner.link}" target="_blank" class="banner-link-hint"><i class="fa-solid fa-link"></i> ${escapeHtml(banner.button_text || "Link")}: ${escapeHtml(banner.link)}</a>` : ""}
                    </td>
                    <td>${posBadge}</td>
                    <td>
                        ${schedBadge}
                        ${schedDetail}
                    </td>
                    <td>
                        <span class="status-indicator-text ${isChecked ? 'text-success' : 'text-muted'} font-weight-bold">
                            <i class="fa-solid fa-circle fa-xs mr-1"></i> ${isChecked ? 'Visible' : 'Hidden'}
                        </span>
                    </td>
                    <td>
                        <label class="switch-wrap" title="Toggle Show / Hide on Storefront">
                            <input type="checkbox" class="status-toggle" data-id="${banner.id}" ${isChecked ? "checked" : ""}>
                            <span class="slider-switch"></span>
                        </label>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button type="button" class="action-btn edit-btn" data-id="${banner.id}" title="Edit Banner">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <a href="${banner.link || '/'}" target="_blank" class="action-btn" title="Preview link destination">
                                <i class="fa-solid fa-arrow-up-right-from-square"></i>
                            </a>
                            <button type="button" class="action-btn delete-btn" data-id="${banner.id}" data-title="${escapeHtml(banner.title)}" title="Delete Banner">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        // Attach event listeners for status switches and action buttons
        attachTableEventListeners();
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
    // ATTACH TABLE EVENT LISTENERS
    // ============================================================
    function attachTableEventListeners() {
        // Status toggle switches (Show/Hide)
        document.querySelectorAll(".status-toggle").forEach((toggle) => {
            toggle.addEventListener("change", async (e) => {
                const bannerId = e.target.getAttribute("data-id");
                try {
                    const res = await fetch(`/api/banners/${bannerId}/status`, {
                        method: "PATCH"
                    });
                    const data = await res.json();
                    if (data.success) {
                        showToast(data.message || "Status updated!");
                        fetchBanners(); // Refresh list & stats
                    } else {
                        showToast(data.message || "Failed to update status", "error");
                        e.target.checked = !e.target.checked;
                    }
                } catch (err) {
                    console.error("Toggle error:", err);
                    showToast("Error updating status", "error");
                    e.target.checked = !e.target.checked;
                }
            });
        });

        // Edit buttons
        document.querySelectorAll(".edit-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                openEditModal(id);
            });
        });

        // Delete buttons
        document.querySelectorAll(".delete-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                deleteTargetId = btn.getAttribute("data-id");
                const title = btn.getAttribute("data-title") || "this banner";
                deleteBannerTitle.textContent = `"${title}"`;
                deleteModal.style.display = "flex";
            });
        });
    }

    // ============================================================
    // FILTER PILLS & SEARCH
    // ============================================================
    filterPills.forEach((pill) => {
        pill.addEventListener("click", () => {
            filterPills.forEach((p) => p.classList.remove("active"));
            pill.classList.add("active");
            currentFilter = pill.getAttribute("data-filter");
            renderTable();
        });
    });

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value.trim();
            renderTable();
        });
    }

    // ============================================================
    // OPEN CREATE MODAL
    // ============================================================
    function openCreateModal() {
        bannerForm.reset();
        bannerIdInput.value = "";
        modalTitle.textContent = "Add New Banner";
        modalSub.textContent = "Upload and configure banner graphics, schedule, and CTA links";
        saveBtnText.textContent = "Upload & Save Banner";
        
        bannerPosition.value = "hero";
        bannerStatus.value = "active";
        displayOrderInput.value = "0";
        buttonText.value = "EXPLORE COLLECTION";
        bannerLink.value = "/products.html";
        secondaryButtonText.value = "VIEW TRENDING PICKS";
        secondaryLink.value = "#trending-section";

        imagePreview.src = "/images/jacket1.jpg";
        previewTitleText.textContent = "DEFINE YOUR STYLE";
        previewBadgeText.textContent = "NEW ARRIVAL";
        recDims.textContent = "Recommended: 1920 × 750px (Hero Slider)";

        bannerModal.style.display = "flex";
    }

    // ============================================================
    // OPEN EDIT MODAL
    // ============================================================
    async function openEditModal(id) {
        try {
            const res = await fetch(`/api/banners/${id}`);
            const data = await res.json();
            if (!data.success || !data.banner) {
                showToast("Failed to fetch banner details", "error");
                return;
            }

            const b = data.banner;
            bannerIdInput.value = b.id;
            modalTitle.textContent = "Edit Promotional Banner";
            modalSub.textContent = `Editing Banner #${b.id} — "${b.title}"`;
            saveBtnText.textContent = "Update Banner";

            bannerPosition.value = b.position || "hero";
            bannerStatus.value = b.status || "active";
            bannerTitle.value = b.title || "";
            bannerBadge.value = b.badge || "";
            bannerSubtitle.value = b.subtitle || "";
            buttonText.value = b.button_text || "";
            bannerLink.value = b.link || "";
            secondaryButtonText.value = b.secondary_button_text || "";
            secondaryLink.value = b.secondary_link || "";
            displayOrderInput.value = b.display_order || 0;

            startDateInput.value = toInputDateTime(b.start_date);
            endDateInput.value = toInputDateTime(b.end_date);

            imageUrlInput.value = b.image || "";
            imagePreview.src = b.image || "/images/jacket1.jpg";
            previewTitleText.textContent = b.title || "BANNER TITLE";
            previewBadgeText.textContent = b.badge || "FEATURED";

            recDims.textContent = b.position === "hero" 
                ? "Recommended: 1920 × 750px (Hero Slider)" 
                : "Recommended: 1200 × 500px (Promotional)";

            bannerModal.style.display = "flex";
        } catch (error) {
            console.error("openEditModal error:", error);
            showToast("Error loading banner details", "error");
        }
    }

    // Modal buttons
    if (openAddBannerBtn) openAddBannerBtn.addEventListener("click", openCreateModal);
    if (emptyAddBtn) emptyAddBtn.addEventListener("click", openCreateModal);
    if (modalCloseBtn) modalCloseBtn.addEventListener("click", () => bannerModal.style.display = "none");
    if (modalCancelBtn) modalCancelBtn.addEventListener("click", () => bannerModal.style.display = "none");

    // Close on backdrop click
    bannerModal.addEventListener("click", (e) => {
        if (e.target === bannerModal) bannerModal.style.display = "none";
    });

    // Clear schedule button
    if (clearScheduleBtn) {
        clearScheduleBtn.addEventListener("click", () => {
            startDateInput.value = "";
            endDateInput.value = "";
            showToast("Schedule cleared — banner will be perpetually active!");
        });
    }

    // Position change updates dimension hint & default CTA
    bannerPosition.addEventListener("change", () => {
        if (bannerPosition.value === "hero") {
            recDims.textContent = "Recommended: 1920 × 750px (Hero Slider)";
            if (!buttonText.value) buttonText.value = "EXPLORE COLLECTION";
            if (!bannerLink.value) bannerLink.value = "/products.html";
        } else {
            recDims.textContent = "Recommended: 1200 × 500px (Promotional)";
            if (!buttonText.value) buttonText.value = "SHOP SPECIAL OFFER";
            if (!bannerLink.value) bannerLink.value = "/products.html";
        }
    });

    // ============================================================
    // LIVE PREVIEW UPDATES
    // ============================================================
    bannerTitle.addEventListener("input", (e) => {
        previewTitleText.textContent = e.target.value.trim() || "BANNER TITLE";
    });

    bannerBadge.addEventListener("input", (e) => {
        previewBadgeText.textContent = e.target.value.trim() || "SPECIAL OFFER";
    });

    // File input preview
    imageInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                imagePreview.src = evt.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Image URL input preview
    imageUrlInput.addEventListener("input", (e) => {
        const url = e.target.value.trim();
        if (url) {
            imagePreview.src = url;
        }
    });

    // Drag and drop support
    dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("dragover");
    });

    dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            imageInput.files = e.dataTransfer.files;
            const file = e.dataTransfer.files[0];
            const reader = new FileReader();
            reader.onload = (evt) => {
                imagePreview.src = evt.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // ============================================================
    // FORM SUBMISSION (CREATE / UPDATE)
    // ============================================================
    bannerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = bannerIdInput.value;
        const formData = new FormData();

        const titleVal = bannerTitle.value.trim();
        if (!titleVal) {
            showToast("Please enter a banner title", "error");
            return;
        }

        formData.append("title", titleVal);
        formData.append("subtitle", bannerSubtitle.value.trim());
        formData.append("badge", bannerBadge.value.trim());
        formData.append("position", bannerPosition.value);
        formData.append("status", bannerStatus.value);
        formData.append("button_text", buttonText.value.trim());
        formData.append("link", bannerLink.value.trim());
        formData.append("secondary_button_text", secondaryButtonText.value.trim());
        formData.append("secondary_link", secondaryLink.value.trim());
        formData.append("start_date", startDateInput.value ? new Date(startDateInput.value).toISOString() : "");
        formData.append("end_date", endDateInput.value ? new Date(endDateInput.value).toISOString() : "");
        formData.append("display_order", displayOrderInput.value || "0");

        // Image file or URL
        if (imageInput.files && imageInput.files[0]) {
            formData.append("image", imageInput.files[0]);
        } else if (imageUrlInput.value.trim()) {
            formData.append("imageUrl", imageUrlInput.value.trim());
        } else if (!id) {
            showToast("Please upload a banner image or enter an image URL", "error");
            return;
        }

        // Show loading state
        const originalBtnText = saveBtnText.textContent;
        saveBtnText.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;
        const submitBtn = document.getElementById("saveBannerBtn");
        submitBtn.disabled = true;

        try {
            const url = id ? `/api/banners/${id}` : "/api/banners";
            const method = id ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                body: formData
            });

            const data = await res.json();

            if (data.success) {
                showToast(data.message || (id ? "Banner updated!" : "Banner created!"));
                bannerModal.style.display = "none";
                fetchBanners();
            } else {
                showToast(data.message || "Failed to save banner", "error");
            }
        } catch (error) {
            console.error("Save banner error:", error);
            showToast("Network error saving banner", "error");
        } finally {
            saveBtnText.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    // ============================================================
    // DELETE MODAL LOGIC
    // ============================================================
    if (deleteModalCloseBtn) deleteModalCloseBtn.addEventListener("click", () => deleteModal.style.display = "none");
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener("click", () => deleteModal.style.display = "none");

    deleteModal.addEventListener("click", (e) => {
        if (e.target === deleteModal) deleteModal.style.display = "none";
    });

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener("click", async () => {
            if (!deleteTargetId) return;

            confirmDeleteBtn.disabled = true;
            confirmDeleteBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Deleting...`;

            try {
                const res = await fetch(`/api/banners/${deleteTargetId}`, {
                    method: "DELETE"
                });
                const data = await res.json();

                if (data.success) {
                    showToast(data.message || "Banner deleted!");
                    deleteModal.style.display = "none";
                    deleteTargetId = null;
                    fetchBanners();
                } else {
                    showToast(data.message || "Failed to delete banner", "error");
                }
            } catch (err) {
                console.error("Delete error:", err);
                showToast("Network error deleting banner", "error");
            } finally {
                confirmDeleteBtn.disabled = false;
                confirmDeleteBtn.innerHTML = `<i class="fa-solid fa-trash"></i> Delete Banner`;
            }
        });
    }

    // ============================================================
    // INITIAL LOAD
    // ============================================================
    fetchBanners();
});
