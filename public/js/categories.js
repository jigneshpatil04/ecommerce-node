
/* =====================================================
   CATEGORIES JAVASCRIPT
===================================================== */

console.log(
    "Categories JavaScript Loaded"
);


// =====================================================
// ELEMENTS
// =====================================================

const categorySearch =
    document.getElementById(
        "categorySearch"
    );


const clearSearch =
    document.getElementById(
        "clearSearch"
    );


const categoryGrid =
    document.getElementById(
        "categoryGrid"
    );


const noResults =
    document.getElementById(
        "noResults"
    );


const categoryCards =
    document.querySelectorAll(
        ".category-card"
    );


const shopButtons =
    document.querySelectorAll(
        ".shop-category-btn"
    );


// =====================================================
// SEARCH CATEGORIES
// =====================================================

function searchCategories() {

    const searchValue =
        categorySearch.value
            .trim()
            .toLowerCase();


    let visibleCategories = 0;


    categoryCards.forEach(
        function (card) {

            const category =
                card.dataset.category
                    .toLowerCase();


            if (
                category.includes(
                    searchValue
                )
            ) {

                card.style.display =
                    "";

                visibleCategories++;

            } else {

                card.style.display =
                    "none";

            }

        }
    );


    // Show no-result message.

    if (
        visibleCategories === 0
    ) {

        categoryGrid.classList.add(
            "hidden"
        );

        noResults.classList.remove(
            "hidden"
        );

    } else {

        categoryGrid.classList.remove(
            "hidden"
        );

        noResults.classList.add(
            "hidden"
        );

    }

}


// =====================================================
// SEARCH EVENT
// =====================================================

if (categorySearch) {

    categorySearch.addEventListener(
        "input",
        searchCategories
    );

}


// =====================================================
// CLEAR SEARCH
// =====================================================

if (clearSearch) {

    clearSearch.addEventListener(
        "click",
        function () {

            categorySearch.value = "";

            searchCategories();

            categorySearch.focus();

        }
    );

}


// =====================================================
// OPEN CATEGORY
// =====================================================

function openCategory(
    category
) {

    console.log(
        "Selected Category:",
        category
    );


    const categoryRoutes = {
        "T-Shirts": "t-shirts",
        Shirts: "shirts",
        Jeans: "jeans",
        Pants: "pants",
        Jackets: "jackets",
        Hoodies: "hoodies",
        Shorts: "shorts",
        Shoes: "shoes",
        Accessories: "accessories"
    };


    const route =
        categoryRoutes[category] ||
        `products.html?category=${encodeURIComponent(category)}`;


    window.location.href =
        `/${route}`;

}


// =====================================================
// CATEGORY BUTTONS
// =====================================================

shopButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                const category =
                    button.dataset.category;


                openCategory(
                    category
                );

            }
        );

    }
);


// =====================================================
// CLICK CARD
// =====================================================

categoryCards.forEach(
    function (card) {

        card.addEventListener(
            "click",
            function (event) {

                /*
                   Do not trigger twice
                   when button is clicked.
                */

                if (
                    event.target.closest(
                        ".shop-category-btn"
                    )
                ) {

                    return;

                }


                const category =
                    card.dataset.category;


                openCategory(
                    category
                );

            }
        );

    }
);


// =====================================================
// CART COUNT
// =====================================================

function updateCartCount() {

    const cartCount =
        document.getElementById(
            "cart-count"
        );


    if (!cartCount) {

        return;

    }


    const cart =
        JSON.parse(
            localStorage.getItem(
                "cart"
            )
        ) || [];


    const totalQuantity =
        cart.reduce(
            function (
                total,
                item
            ) {

                return (
                    total +
                    Number(
                        item.quantity || 0
                    )
                );

            },
            0
        );


    cartCount.textContent =
        totalQuantity;

}


// =====================================================
// MOBILE MENU
// =====================================================

const menuBtn =
    document.getElementById(
        "menuBtn"
    );


const navLinks =
    document.querySelector(
        ".nav-links"
    );


if (
    menuBtn &&
    navLinks
) {

    menuBtn.addEventListener(
        "click",
        function () {

            navLinks.classList.toggle(
                "mobile-active"
            );

        }
    );

}


// =====================================================
// USER LOGIN DISPLAY
// =====================================================

function loadUser() {

    const loginBtn =
        document.getElementById(
            "loginBtn"
        );


    const userMenu =
        document.getElementById(
            "userMenu"
        );


    const userName =
        document.getElementById(
            "userName"
        );


    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    /*
       Your login.js may save
       the user under "user".
    */

    let user = null;


    try {

        user =
            JSON.parse(
                localStorage.getItem(
                    "user"
                )
            );

    } catch (error) {

        user = null;

    }


    if (
        user &&
        user.name
    ) {

        if (loginBtn) {

            loginBtn.style.display =
                "none";

        }


        if (userMenu) {

            userMenu.style.display =
                "flex";

        }


        if (userName) {

            userName.textContent =
                user.name;

        }

    }


    // =================================================
    // LOGOUT
    // =================================================

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            function () {

                localStorage.removeItem(
                    "user"
                );


                localStorage.removeItem(
                    "token"
                );


                window.location.href =
                    "/";

            }
        );

    }

}


// =====================================================
// INITIALIZE
// =====================================================

updateCartCount();

loadUser();

