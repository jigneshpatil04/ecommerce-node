// ============================================================
// ADMIN SIDEBAR ORDER NOTIFICATIONS BADGE AUTO-UPDATER
// Lightweight live polling for sidebar badge across all admin pages
// ============================================================

(function() {
    async function updateOrderBadge() {
        try {
            const res = await fetch("/api/order-notifications/unread-count");
            const data = await res.json();
            if (!data.success) return;

            const count = data.count || 0;
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
        } catch (e) {
            // Silently ignore if offline
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            updateOrderBadge();
            setInterval(updateOrderBadge, 10000);
        });
    } else {
        updateOrderBadge();
        setInterval(updateOrderBadge, 10000);
    }
})();
