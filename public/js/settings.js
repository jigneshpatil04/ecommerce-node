// ==========================================
// ADMIN SETTINGS JAVASCRIPT
// ==========================================

console.log(
    "Admin Settings JavaScript Loaded"
);


// ==========================================
// GET ELEMENTS
// ==========================================

const storeSettingsForm =
    document.getElementById(
        "storeSettingsForm"
    );

const shippingSettingsForm =
    document.getElementById(
        "shippingSettingsForm"
    );

const adminAccountForm =
    document.getElementById(
        "adminAccountForm"
    );

const savePaymentButton =
    document.getElementById(
        "savePaymentButton"
    );

const storeStatus =
    document.getElementById(
        "storeStatus"
    );

const storeStatusMessage =
    document.getElementById(
        "storeStatusMessage"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


// ==========================================
// STORAGE KEY
// ==========================================

const SETTINGS_KEY =
    "adminStoreSettings";


// ==========================================
// LOAD SETTINGS
// ==========================================

function loadSettings() {

    const savedSettings =
        localStorage.getItem(
            SETTINGS_KEY
        );


    if (!savedSettings) {

        return;

    }


    try {

        const settings =
            JSON.parse(
                savedSettings
            );


        // Store

        if (settings.storeName) {

            document.getElementById(
                "storeName"
            ).value =
                settings.storeName;

        }


        if (settings.storeEmail) {

            document.getElementById(
                "storeEmail"
            ).value =
                settings.storeEmail;

        }


        if (settings.storePhone) {

            document.getElementById(
                "storePhone"
            ).value =
                settings.storePhone;

        }


        if (settings.storeAddress) {

            document.getElementById(
                "storeAddress"
            ).value =
                settings.storeAddress;

        }


        // Shipping

        if (
            settings.shippingCharge !== undefined
        ) {

            document.getElementById(
                "shippingCharge"
            ).value =
                settings.shippingCharge;

        }


        if (
            settings.freeShippingAmount !== undefined
        ) {

            document.getElementById(
                "freeShippingAmount"
            ).value =
                settings.freeShippingAmount;

        }


        // Payment

        if (
            settings.codPayment !== undefined
        ) {

            document.getElementById(
                "codPayment"
            ).checked =
                settings.codPayment;

        }


        if (
            settings.onlinePayment !== undefined
        ) {

            document.getElementById(
                "onlinePayment"
            ).checked =
                settings.onlinePayment;

        }


        if (
            settings.upiPayment !== undefined
        ) {

            document.getElementById(
                "upiPayment"
            ).checked =
                settings.upiPayment;

        }


        // Admin

        if (settings.adminName) {

            document.getElementById(
                "adminName"
            ).value =
                settings.adminName;

        }


        if (settings.adminEmail) {

            document.getElementById(
                "adminEmail"
            ).value =
                settings.adminEmail;

        }


        // Store status

        if (
            settings.storeOnline !== undefined
        ) {

            storeStatus.checked =
                settings.storeOnline;

            updateStoreStatusMessage();

        }

    }

    catch (error) {

        console.error(
            "Settings Load Error:",
            error
        );

    }

}


// ==========================================
// SAVE ALL SETTINGS
// ==========================================

function saveSettings(
    additionalSettings = {}
) {

    const currentSettings =
        localStorage.getItem(
            SETTINGS_KEY
        );


    let settings = {};


    if (currentSettings) {

        try {

            settings =
                JSON.parse(
                    currentSettings
                );

        }

        catch (error) {

            settings = {};

        }

    }


    settings = {

        ...settings,

        ...additionalSettings

    };


    localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
    );

}


// ==========================================
// STORE SETTINGS
// ==========================================

storeSettingsForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const storeName =
            document.getElementById(
                "storeName"
            ).value.trim();


        const storeEmail =
            document.getElementById(
                "storeEmail"
            ).value.trim();


        const storePhone =
            document.getElementById(
                "storePhone"
            ).value.trim();


        const storeAddress =
            document.getElementById(
                "storeAddress"
            ).value.trim();


        saveSettings({

            storeName:
                storeName,

            storeEmail:
                storeEmail,

            storePhone:
                storePhone,

            storeAddress:
                storeAddress

        });


        alert(
            "Store settings saved successfully."
        );

    }
);


// ==========================================
// SHIPPING SETTINGS
// ==========================================

shippingSettingsForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const shippingCharge =
            Number(
                document.getElementById(
                    "shippingCharge"
                ).value
            );


        const freeShippingAmount =
            Number(
                document.getElementById(
                    "freeShippingAmount"
                ).value
            );


        if (shippingCharge < 0) {

            alert(
                "Shipping charge cannot be negative."
            );

            return;

        }


        if (freeShippingAmount < 0) {

            alert(
                "Free shipping amount cannot be negative."
            );

            return;

        }


        saveSettings({

            shippingCharge:
                shippingCharge,

            freeShippingAmount:
                freeShippingAmount

        });


        alert(
            "Shipping settings saved successfully."
        );

    }
);


// ==========================================
// PAYMENT SETTINGS
// ==========================================

savePaymentButton.addEventListener(
    "click",
    function () {

        const codPayment =
            document.getElementById(
                "codPayment"
            ).checked;


        const onlinePayment =
            document.getElementById(
                "onlinePayment"
            ).checked;


        const upiPayment =
            document.getElementById(
                "upiPayment"
            ).checked;


        if (
            !codPayment &&
            !onlinePayment &&
            !upiPayment
        ) {

            alert(
                "Please select at least one payment method."
            );

            return;

        }


        saveSettings({

            codPayment:
                codPayment,

            onlinePayment:
                onlinePayment,

            upiPayment:
                upiPayment

        });


        alert(
            "Payment settings saved successfully."
        );

    }
);


// ==========================================
// ADMIN ACCOUNT
// ==========================================

adminAccountForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const adminName =
            document.getElementById(
                "adminName"
            ).value.trim();


        const adminEmail =
            document.getElementById(
                "adminEmail"
            ).value.trim();


        const adminPassword =
            document.getElementById(
                "adminPassword"
            ).value;


        if (!adminName) {

            alert(
                "Please enter admin name."
            );

            return;

        }


        if (!adminEmail) {

            alert(
                "Please enter admin email."
            );

            return;

        }


        saveSettings({

            adminName:
                adminName,

            adminEmail:
                adminEmail

        });


        /*
         * Password is intentionally not stored
         * in localStorage.
         *
         * Password changes should later be
         * connected to your backend/database.
         */

        document.getElementById(
            "adminPassword"
        ).value = "";


        alert(
            "Admin account information updated."
        );

    }
);


// ==========================================
// STORE STATUS
// ==========================================

storeStatus.addEventListener(
    "change",
    function () {

        const isOnline =
            storeStatus.checked;


        saveSettings({

            storeOnline:
                isOnline

        });


        updateStoreStatusMessage();

    }
);


// ==========================================
// UPDATE STORE STATUS MESSAGE
// ==========================================

function updateStoreStatusMessage() {

    if (
        storeStatus.checked
    ) {

        storeStatusMessage.textContent =
            "Store is currently online.";

        storeStatusMessage.style.background =
            "#ecfdf5";

        storeStatusMessage.style.color =
            "#047857";

    }

    else {

        storeStatusMessage.textContent =
            "Store is currently offline.";

        storeStatusMessage.style.background =
            "#fef2f2";

        storeStatusMessage.style.color =
            "#b91c1c";

    }

}


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

loadSettings();