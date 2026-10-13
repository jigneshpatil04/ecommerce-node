// ==========================================
// ADMIN USER MANAGEMENT
// ==========================================

console.log(
    "Admin Users JavaScript Loaded"
);


// ==========================================
// VARIABLES
// ==========================================

let users = [];


// ==========================================
// GET ELEMENTS
// ==========================================

const usersTableBody =
    document.getElementById(
        "usersTableBody"
    );

const totalUsers =
    document.getElementById(
        "totalUsers"
    );

const activeUsers =
    document.getElementById(
        "activeUsers"
    );

const newUsers =
    document.getElementById(
        "newUsers"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const searchButton =
    document.getElementById(
        "searchButton"
    );

const refreshButton =
    document.getElementById(
        "refreshButton"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

const userModal =
    document.getElementById(
        "userModal"
    );

const closeModal =
    document.getElementById(
        "closeModal"
    );

const userDetails =
    document.getElementById(
        "userDetails"
    );


// ==========================================
// LOAD USERS
// ==========================================

async function loadUsers() {

    try {

        usersTableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="loading"
                >
                    Loading users...
                </td>
            </tr>
        `;


        const response =
            await fetch(
                "/api/users"
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load users."
            );

        }


        const data =
            await response.json();


        console.log(
            "Users API Response:",
            data
        );


        // ==========================================
        // SUPPORT DIFFERENT RESPONSE FORMATS
        // ==========================================

        if (Array.isArray(data)) {

            users = data;

        }

        else if (
            Array.isArray(data.users)
        ) {

            users = data.users;

        }

        else {

            users = [];

        }


        updateStatistics();

        displayUsers(users);

    }

    catch (error) {

        console.error(
            "Load Users Error:",
            error
        );


        usersTableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="empty"
                >
                    Failed to load users.
                </td>
            </tr>
        `;

    }

}


// ==========================================
// DISPLAY USERS
// ==========================================

function displayUsers(
    userList
) {

    usersTableBody.innerHTML = "";


    if (
        userList.length === 0
    ) {

        usersTableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="empty"
                >
                    No users found.
                </td>
            </tr>
        `;

        return;

    }


    userList.forEach(
        function (user) {

            const row =
                document.createElement(
                    "tr"
                );


            const id =
                user.id || "-";


            const name =
                user.name ||
                user.username ||
                user.customer_name ||
                "Unknown";


            const email =
                user.email ||
                "-";


            const phone =
                user.phone ||
                "-";


            const createdAt =
                user.created_at
                    ? formatDate(
                        user.created_at
                    )
                    : "-";


            row.innerHTML = `

                <td>
                    #${escapeHTML(
                        String(id)
                    )}
                </td>


                <td>

                    <div class="user-name">
                        ${escapeHTML(
                            String(name)
                        )}
                    </div>

                </td>


                <td>

                    <div class="user-email">
                        ${escapeHTML(
                            String(email)
                        )}
                    </div>

                </td>


                <td>
                    ${escapeHTML(
                        String(phone)
                    )}
                </td>


                <td>
                    ${escapeHTML(
                        String(createdAt)
                    )}
                </td>


                <td>

                    <div class="action-buttons">

                        <button
                            class="view-button"
                            onclick="viewUser(${Number(id)})"
                        >
                            View
                        </button>


                        <button
                            class="delete-button"
                            onclick="deleteUser(${Number(id)})"
                        >
                            Delete
                        </button>

                    </div>

                </td>

            `;


            usersTableBody.appendChild(
                row
            );

        }
    );

}


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStatistics() {

    totalUsers.textContent =
        users.length;


    // If your users table has an active/status
    // column, this will use it.

    const active =
        users.filter(
            function (user) {

                return (
                    user.status === "active" ||
                    user.status === "Active" ||
                    user.active === 1 ||
                    user.active === true
                );

            }
        );


    activeUsers.textContent =
        active.length;


    // ==========================================
    // NEW USERS - LAST 30 DAYS
    // ==========================================

    const now =
        new Date();


    const thirtyDaysAgo =
        new Date();

    thirtyDaysAgo.setDate(
        now.getDate() - 30
    );


    const newUserCount =
        users.filter(
            function (user) {

                if (!user.created_at) {

                    return false;

                }


                const createdDate =
                    new Date(
                        user.created_at
                    );


                return (
                    createdDate >=
                    thirtyDaysAgo
                );

            }
        );


    newUsers.textContent =
        newUserCount.length;

}


// ==========================================
// SEARCH USERS
// ==========================================

function searchUsers() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    if (!search) {

        displayUsers(users);

        return;

    }


    const filteredUsers =
        users.filter(
            function (user) {

                const name =
                    String(
                        user.name ||
                        user.username ||
                        ""
                    ).toLowerCase();


                const email =
                    String(
                        user.email ||
                        ""
                    ).toLowerCase();


                const phone =
                    String(
                        user.phone ||
                        ""
                    ).toLowerCase();


                const id =
                    String(
                        user.id ||
                        ""
                    ).toLowerCase();


                return (
                    name.includes(search) ||
                    email.includes(search) ||
                    phone.includes(search) ||
                    id.includes(search)
                );

            }
        );


    displayUsers(
        filteredUsers
    );

}


// ==========================================
// VIEW USER
// ==========================================

function viewUser(userId) {

    const user =
        users.find(
            function (item) {

                return Number(
                    item.id
                ) === Number(
                    userId
                );

            }
        );


    if (!user) {

        alert(
            "User not found."
        );

        return;

    }


    const name =
        user.name ||
        user.username ||
        "Unknown";


    userDetails.innerHTML = `

        <div class="detail-row">

            <span class="detail-label">
                User ID
            </span>

            <span class="detail-value">
                #${escapeHTML(
                    String(
                        user.id || "-"
                    )
                )}
            </span>

        </div>


        <div class="detail-row">

            <span class="detail-label">
                Name
            </span>

            <span class="detail-value">
                ${escapeHTML(
                    String(name)
                )}
            </span>

        </div>


        <div class="detail-row">

            <span class="detail-label">
                Email
            </span>

            <span class="detail-value">
                ${escapeHTML(
                    String(
                        user.email || "-"
                    )
                )}
            </span>

        </div>


        <div class="detail-row">

            <span class="detail-label">
                Phone
            </span>

            <span class="detail-value">
                ${escapeHTML(
                    String(
                        user.phone || "-"
                    )
                )}
            </span>

        </div>


        <div class="detail-row">

            <span class="detail-label">
                Address
            </span>

            <span class="detail-value">
                ${escapeHTML(
                    String(
                        user.address || "-"
                    )
                )}
            </span>

        </div>


        <div class="detail-row">

            <span class="detail-label">
                Registered
            </span>

            <span class="detail-value">
                ${user.created_at
                    ? escapeHTML(
                        formatDate(
                            user.created_at
                        )
                    )
                    : "-"
                }
            </span>

        </div>

    `;


    userModal.classList.add(
        "show"
    );

}


// ==========================================
// DELETE USER
// ==========================================

async function deleteUser(
    userId
) {

    const user =
        users.find(
            function (item) {

                return Number(
                    item.id
                ) === Number(
                    userId
                );

            }
        );


    if (!user) {

        return;

    }


    const name =
        user.name ||
        user.username ||
        "this user";


    const confirmed =
        confirm(
            `Are you sure you want to delete ${name}?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/users/${userId}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to delete user."
            );

        }


        alert(
            data.message ||
            "User deleted successfully."
        );


        loadUsers();

    }

    catch (error) {

        console.error(
            "Delete User Error:",
            error
        );


        alert(
            error.message ||
            "Failed to delete user."
        );

    }

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(
    date
) {

    const d =
        new Date(date);


    if (
        Number.isNaN(
            d.getTime()
        )
    ) {

        return "-";

    }


    return d.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(
    value
) {

    return value
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================
// SEARCH EVENTS
// ==========================================

searchInput.addEventListener(
    "input",
    searchUsers
);


searchButton.addEventListener(
    "click",
    searchUsers
);


// ==========================================
// REFRESH
// ==========================================

refreshButton.addEventListener(
    "click",
    loadUsers
);


// ==========================================
// CLOSE MODAL
// ==========================================

closeModal.addEventListener(
    "click",
    function () {

        userModal.classList.remove(
            "show"
        );

    }
);


userModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            userModal
        ) {

            userModal.classList.remove(
                "show"
            );

        }

    }
);


// ==========================================
// LOGOUT
// ==========================================

logoutButton.addEventListener(
    "click",
    function () {

        localStorage.removeItem(
            "admin"
        );

        localStorage.removeItem(
            "adminToken"
        );


        window.location.href =
            "/login.html";

    }
);


// ==========================================
// INITIAL LOAD
// ==========================================

loadUsers();