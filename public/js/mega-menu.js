// ============================================================
// LUXURY MEGA MENU JAVASCRIPT (TANISHQ STYLE)
// Features: Interactive category & subcategory tabs with real product photos,
//           clicking tabs navigates directly to the category page,
//           clicking "Categories" opens/toggles the menu without navigating away.
// ============================================================

(function () {
    "use strict";

    function initMegaMenu() {
        const megaMenus = document.querySelectorAll('.nav-mega-menu');
        const triggerContainer = document.querySelector('.header-sub-item.mega-dropdown-trigger');
        const mainMegaMenu = document.querySelector('.nav-mega-menu');

        megaMenus.forEach(menu => {
            const tabs = menu.querySelectorAll('.mega-tab-btn');
            const panes = menu.querySelectorAll('.mega-tab-pane');
            const featuredImg = menu.querySelector('.mega-featured-img');
            const featuredTitle = menu.querySelector('.mega-featured-title');
            const featuredCard = menu.querySelector('.mega-featured-card');

            tabs.forEach(tab => {
                const switchTab = () => {
                    const targetId = tab.getAttribute('data-target');
                    if (!targetId) return;

                    // Update active tab button
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');

                    // Update active pane
                    panes.forEach(p => {
                        if (p.id === targetId) {
                            p.classList.add('active');
                        } else {
                            p.classList.remove('active');
                        }
                    });

                    // Dynamically update featured photo card if tab defines attributes
                    const featImgSrc = tab.getAttribute('data-featured-img');
                    const featTitle = tab.getAttribute('data-featured-title');
                    const featLink = tab.getAttribute('data-featured-link') || tab.getAttribute('data-link');

                    if (featImgSrc && featuredImg) {
                        featuredImg.style.opacity = '0.5';
                        setTimeout(() => {
                            featuredImg.src = featImgSrc;
                            featuredImg.style.opacity = '1';
                        }, 120);
                    }
                    if (featTitle && featuredTitle) {
                        featuredTitle.textContent = featTitle;
                    }
                    if (featLink && featuredCard) {
                        featuredCard.setAttribute('href', featLink);
                    }
                };

                // On hover: preview and switch active category tab & photo
                tab.addEventListener('mouseenter', switchTab);
                
                // On click: navigate directly to that category page!
                tab.addEventListener('click', function (e) {
                    const targetLink = tab.getAttribute('data-link') || tab.getAttribute('data-featured-link');
                    if (targetLink && targetLink !== '#') {
                        window.location.href = targetLink;
                    } else {
                        switchTab();
                    }
                });
            });
        });

        // Clicking on "Categories" in the nav bar toggles the mega menu without navigating away
        document.querySelectorAll('.mega-trigger-link, .header-sub-item.mega-dropdown-trigger > a, .header-sub-item.mega-dropdown-trigger > button').forEach(trigger => {
            trigger.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (mainMegaMenu) {
                    mainMegaMenu.classList.toggle('is-active');
                }
            });
        });

        // Close mega menu when clicking outside
        document.addEventListener('click', function (e) {
            if (mainMegaMenu && !mainMegaMenu.contains(e.target) && !e.target.closest('.mega-dropdown-trigger')) {
                mainMegaMenu.classList.remove('is-active');
            }
        });

        // Handle sub-strip hover/leave
        const subStrip = document.querySelector('.header-sub-strip');
        if (subStrip && mainMegaMenu) {
            subStrip.addEventListener('mouseleave', function (e) {
                const toElement = e.relatedTarget;
                if (!mainMegaMenu.contains(toElement) && toElement !== mainMegaMenu) {
                    mainMegaMenu.classList.remove('is-active');
                }
            });

            mainMegaMenu.addEventListener('mouseleave', function () {
                mainMegaMenu.classList.remove('is-active');
            });
        }

        // Close mega menu on Escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                document.querySelectorAll('.nav-mega-menu').forEach(menu => {
                    menu.classList.remove('is-active');
                });
            }
        });

        // Ensure all images (thumbs, banners, featured) load properly in any path context
        const inViews = window.location.pathname.includes('/views/') || 
                        window.location.href.includes('/views/');
        const publicPrefix = inViews ? '../public/' : '/';

        document.querySelectorAll('.mega-item-thumb, .mega-banner-thumb, .mega-featured-img, .category-card-img').forEach(img => {
            const src = img.getAttribute('src') || '';
            if (src.includes('images/')) {
                const filename = src.split('images/')[1];
                img.onerror = function () {
                    this.onerror = null;
                    this.src = publicPrefix + 'images/' + filename;
                };
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMegaMenu);
    } else {
        initMegaMenu();
    }
})();
