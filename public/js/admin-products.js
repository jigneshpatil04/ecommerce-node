
// =========================================================
// SQUAD FASHION - ADMIN PRODUCTS JAVASCRIPT
// =========================================================

console.log("Admin Products JavaScript Loaded");


// =========================================================
// DOM READY
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // ELEMENTS
    // =====================================================

    const productForm =
        document.getElementById("productForm");

    const categorySelect =
        document.getElementById("category");

    const adminColorPhotoMatchContainer =
        document.getElementById("adminColorPhotoMatchContainer");

    const priceInput =
        document.getElementById("price");

    const basePriceDisplay =
        document.getElementById("variantBasePrice");

    const sizePriceContainer =
        document.getElementById("sizePriceContainer");

    const variantPreview =
        document.getElementById("variantPreview");

    const colorStockContainer =
        document.getElementById("colorStockContainer");

    const productImages =
        document.getElementById("productImages");

    const chooseImagesBtn =
        document.getElementById("chooseImagesBtn");

    const openAiStudioBtn =
        document.getElementById("openAiStudioBtn");

    const aiStudioModal =
        document.getElementById("aiStudioModal");

    const closeAiStudioModalBtn =
        document.getElementById("closeAiStudioModalBtn");

    const aiModalCloseBottomBtn =
        document.getElementById("aiModalCloseBottomBtn");

    const aiUploadDropZone =
        document.getElementById("aiUploadDropZone");

    const aiSourceFileInput =
        document.getElementById("aiSourceFileInput");

    const aiExistingPhotosRow =
        document.getElementById("aiExistingPhotosRow");

    const aiExistingPhotosList =
        document.getElementById("aiExistingPhotosList");

    const aiStylePresets =
        document.getElementById("aiStylePresets");

    const aiCustomPrompt =
        document.getElementById("aiCustomPrompt");

    const aiPreviewComparisonArea =
        document.getElementById("aiPreviewComparisonArea");

    const aiSourcePreviewImg =
        document.getElementById("aiSourcePreviewImg");

    const aiResultPreviewImg =
        document.getElementById("aiResultPreviewImg");

    const aiGeneratingOverlay =
        document.getElementById("aiGeneratingOverlay");

    const aiStatusMessage =
        document.getElementById("aiStatusMessage");

    const startAiGenerateBtn =
        document.getElementById("startAiGenerateBtn");

    const aiApplyToProductBtn =
        document.getElementById("aiApplyToProductBtn");

    const imageUploadArea =
        document.getElementById("imageUploadArea");

    const imagePreview =
        document.getElementById("imagePreview");

    const variantImages =
        document.getElementById("variantImages");

    const chooseVariantImagesBtn =
        document.getElementById("chooseVariantImagesBtn");

    const variantImageUploadArea =
        document.getElementById("variantImageUploadArea");

    const variantImagePreview =
        document.getElementById("variantImagePreview");

    const resetBtn =
        document.getElementById("resetProductBtn");

    const productsContainer =
        document.getElementById("productsContainer");

    const refreshProductsBtn =
        document.getElementById("refreshProductsBtn");

    const saveProductBtn =
        document.getElementById("saveProductBtn");

    const productMessage =
        document.getElementById("productMessage");

    const menuBtn =
        document.getElementById("menuBtn");

    const sidebar =
        document.querySelector(".sidebar");

    const productsToggle =
        document.getElementById("productsToggle");

    const productsMenu =
        document.querySelector(".products-menu");

    const logoutButton =
        document.getElementById("logoutButton");

    // Variant Edit Modal Elements
    const variantEditModal =
        document.getElementById("variantEditModal");

    const modalTitle =
        document.getElementById("modalTitle");

    const modalSubtitle =
        document.getElementById("modalSubtitle");

    const modalIconBox =
        document.getElementById("modalIconBox");

    const closeVariantModalBtn =
        document.getElementById("closeVariantModalBtn");

    const modalInputLabel =
        document.getElementById("modalInputLabel");

    const modalNewOptionInput =
        document.getElementById("modalNewOptionInput");

    const modalAddOptionBtn =
        document.getElementById("modalAddOptionBtn");

    const modalOptionCount =
        document.getElementById("modalOptionCount");

    const modalOptionsList =
        document.getElementById("modalOptionsList");

    const modalPresetsSection =
        document.getElementById("modalPresetsSection");

    const modalPresetsList =
        document.getElementById("modalPresetsList");

    const modalCancelBtn =
        document.getElementById("modalCancelBtn");

    const modalSaveBtn =
        document.getElementById("modalSaveBtn");


    // =====================================================
    // VARIABLES
    // =====================================================

    let activeModalGroup = null;

    let activeModalInputName = null;

    let modalCurrentValues = [];

        const COLOR_MAP = {
        'black': '#181818', 'white': '#ffffff', 'off white': '#faf9f6', 'ivory': '#fffff0', 'cream': '#fffdd0',
        'blue': '#2563eb', 'light blue': '#38bdf8', 'sky blue': '#0ea5e9', 'baby blue': '#89cff0', 'royal blue': '#1d4ed8',
        'navy': '#1e3a8a', 'midnight blue': '#191970', 'cobalt blue': '#0047ab', 'indigo': '#4b0082', 'turquoise': '#40e0d0',
        'teal': '#0d9488', 'cyan': '#06b6d4', 'aqua': '#00ffff', 'powder blue': '#b0e0e6', 'steel blue': '#4682b4',
        'red': '#dc2626', 'crimson': '#990000', 'scarlet': '#ff2400', 'ruby': '#e0115f', 'cherry': '#d2042d',
        'wine': '#722f37', 'burgundy': '#800020', 'maroon': '#832729', 'brick red': '#cb4154', 'rust': '#c2410c',
        'coral': '#f97316', 'terracotta': '#e2725b', 'green': '#16a34a', 'dark green': '#14532d', 'forest green': '#228b22',
        'emerald': '#059669', 'olive': '#65a30d', 'olive green': '#556b2f', 'military green': '#4b5320', 'army green': '#454b1b',
        'sage': '#84a98c', 'mint': '#6ee7b7', 'lime green': '#84cc16', 'sea green': '#2e8b57', 'pistachio': '#93c572',
        'moss green': '#8a9a5b', 'pine green': '#01796f', 'jade': '#00a86b', 'yellow': '#eab308', 'mustard': '#d97706',
        'lemon yellow': '#fef08a', 'gold': '#ffd700', 'ochre': '#cc7722', 'amber': '#f59e0b', 'honey': '#eb9605',
        'orange': '#ea580c', 'peach': '#fb923c', 'tangerine': '#f28500', 'burnt orange': '#cc5500', 'apricot': '#fbceb1',
        'copper': '#b87333', 'bronze': '#cd7f32', 'pink': '#ec4899', 'baby pink': '#f472b6', 'rose pink': '#fb7185',
        'blush pink': '#fce7f3', 'dusty pink': '#dcae96', 'hot pink': '#db2777', 'magenta': '#ff00ff', 'fuchsia': '#c026d3',
        'salmon': '#fa8072', 'coral pink': '#f88379', 'purple': '#9333ea', 'lavender': '#a855f7', 'lilac': '#c8a2c8',
        'violet': '#7c3aed', 'plum': '#8b5cf6', 'mauve': '#e0b0ff', 'eggplant': '#614051', 'grape': '#6f2da8',
        'brown': '#78350f', 'chocolate': '#7b3f00', 'coffee': '#6f4e37', 'tan': '#d2b48c', 'camel': '#c19a6b',
        'beige': '#d4b996', 'khaki': '#c3b091', 'sand': '#c2b280', 'caramel': '#af6e4d', 'chestnut': '#954535',
        'grey': '#64748b', 'light grey': '#cbd5e1', 'dark grey': '#475569', 'charcoal': '#334155', 'slate grey': '#708090',
        'ash grey': '#b2beb5', 'silver': '#c0c0c0', 'smoke grey': '#848884', 'taupe': '#483c32',
        'multicolor': 'linear-gradient(135deg, #f43f5e, #eab308, #10b981, #3b82f6)'
    };

    const variantPresets = {
        sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL", "Free Size"],
        colors: ["Black", "White", "Off White", "Blue", "Light Blue", "Sky Blue", "Navy", "Red", "Maroon", "Green", "Olive", "Teal", "Sage", "Mint", "Yellow", "Mustard", "Orange", "Rust", "Peach", "Pink", "Purple", "Lavender", "Brown", "Beige", "Grey", "Charcoal"]
    };

    let selectedProductImages = [];

    let selectedVariantImages = [];

    let variantImageDataByColor = {};

    let variantImageFilesByColor = {};

    let variantColorStocks = {};

    let currentProductId = null;

    const MAX_IMAGES = 30;

    const variantColorOrder = [
        "Black",
        "White",
        "Blue",
        "Red"
    ];


    // =====================================================
    // DEFAULT SIZE EXTRA PRICES
    // =====================================================

    const defaultSizePrices = {
        S: 0,
        M: 50,
        L: 100,
        XL: 150,
        XXL: 200
    };


    // =====================================================
    // HELPER - MESSAGE
    // =====================================================

    function showMessage(message, type = "") {

        if (!productMessage) {
            return;
        }

        productMessage.textContent = message;

        productMessage.className =
            "product-message";

        if (type) {
            productMessage.classList.add(type);
        }
    }


    // =====================================================
    // GET BASE PRICE
    // =====================================================

    function getBasePrice() {

        return Number(
            priceInput?.value
        ) || 0;

    }


    // =====================================================
    // UPDATE BASE PRICE
    // =====================================================

    function updateBasePrice() {

        const price =
            getBasePrice();

        if (basePriceDisplay) {

            basePriceDisplay.textContent =
                price.toFixed(2);

        }

        updateSizePriceCards();

    }


    // =====================================================
    // GET SELECTED SIZES
    // =====================================================

    function getSelectedSizes() {

        return Array.from(
            document.querySelectorAll(
                'input[name="sizes"]:checked'
            )
        ).map(
            input => input.value
        );

    }


    // =====================================================
    // GET SELECTED COLORS
    // =====================================================

    function getSelectedColors() {

        return Array.from(
            document.querySelectorAll(
                'input[name="colors"]:checked'
            )
        ).map(
            input => input.value
        );

    }


    // =====================================================
    // ADD SINGLE EDIT / DELETE BUTTONS FOR EACH GROUP
    // =====================================================

    function renderVariantGroupOptions(group, inputName, values, selectedValues) {

        const optionsContainer =
            group.querySelector(
                ".variant-options"
            );

        if (!optionsContainer) {
            return;
        }

        optionsContainer.innerHTML =
            values.map(function (value) {

                const checked =
                    selectedValues.includes(value)
                        ? "checked"
                        : "";

                const colorKey = value.toLowerCase().trim();
                const colorClass = inputName === "colors"
                    ? ` color-${colorKey.replace(/[^a-z0-9]/g, '')}`
                    : "";
                const hex = (inputName === "colors" && typeof COLOR_MAP !== "undefined" && COLOR_MAP[colorKey]) ? COLOR_MAP[colorKey] : "";
                const isWhite = colorKey === "white" || colorKey === "ivory" || colorKey === "off white";
                const swatchStyle = hex ? ` style="--swatch-color: ${hex};${isWhite ? ' border-color: #cbd5e1;' : ''}"` : "";

                return `
                    <label class="variant-option${colorClass}"${swatchStyle}>
                        <input
                            type="checkbox"
                            name="${inputName}"
                            value="${escapeHTML(value)}"
                            ${checked}
                        >
                        <span>
                            ${escapeHTML(value)}
                        </span>
                    </label>
                `;

            }).join("");


        bindVariantInputEvents();

    }


    // =====================================================
    // VARIANT EDIT MODAL CONTROLLER
    // =====================================================

    function openVariantEditModal(inputName, group) {
        if (!variantEditModal) return;

        activeModalGroup = group;
        activeModalInputName = inputName;

        const currentInputs = Array.from(
            group.querySelectorAll(`input[name="${inputName}"]`)
        );
        modalCurrentValues = currentInputs
            .map(function (input) { return input.value.trim(); })
            .filter(Boolean);

        if (inputName === "sizes") {
            if (modalTitle) modalTitle.textContent = "Edit Available Sizes";
            if (modalSubtitle) modalSubtitle.textContent = "Customize size options, add new sizes, or pick from presets";
            if (modalIconBox) modalIconBox.innerHTML = '<i class="fa-solid fa-ruler-combined"></i>';
            if (modalInputLabel) modalInputLabel.textContent = "Add New Size Option";
            if (modalNewOptionInput) {
                modalNewOptionInput.placeholder = "e.g. S, M, L, XL or custom size";
                modalNewOptionInput.value = "";
            }
        } else {
            if (modalTitle) modalTitle.textContent = "Edit Available Colors";
            if (modalSubtitle) modalSubtitle.textContent = "Customize color options, add new colors, or pick from presets";
            if (modalIconBox) modalIconBox.innerHTML = '<i class="fa-solid fa-palette"></i>';
            if (modalInputLabel) modalInputLabel.textContent = "Add New Color Option";
            if (modalNewOptionInput) {
                modalNewOptionInput.placeholder = "e.g. Black, White, Maroon, Navy or custom color";
                modalNewOptionInput.value = "";
            }
        }

        renderModalChips();
        renderModalPresets(inputName);

        variantEditModal.style.display = "flex";
        setTimeout(function () {
            if (modalNewOptionInput) {
                modalNewOptionInput.focus();
            }
        }, 100);
    }

    function closeVariantEditModal() {
        if (!variantEditModal) return;
        variantEditModal.style.display = "none";
        activeModalGroup = null;
        activeModalInputName = null;
        modalCurrentValues = [];
    }

    function renderModalChips() {
        if (!modalOptionsList) return;

        if (modalOptionCount) {
            modalOptionCount.textContent = modalCurrentValues.length;
        }

        if (modalCurrentValues.length === 0) {
            modalOptionsList.innerHTML = '<div style="color: #8f90a6; font-size: 13px; padding: 12px; font-style: italic; width: 100%; text-align: center;">No options added yet. Type an option name above or select a preset below.</div>';
            return;
        }

        modalOptionsList.innerHTML = modalCurrentValues.map(function (val, idx) {
            let swatchHtml = "";
            if (activeModalInputName === "colors") {
                const cKey = val.toLowerCase().trim();
                const hex = (typeof COLOR_MAP !== "undefined" && COLOR_MAP[cKey]) ? COLOR_MAP[cKey] : '#832729';
                const isLight = cKey === 'white' || cKey === 'ivory' || cKey === 'off white';
                swatchHtml = `<span class="modal-chip-swatch" style="background: ${hex};${isLight ? ' border: 1px solid #cbd5e1;' : ''}"></span>`;
            }
            return `
                <div class="modal-chip">
                    ${swatchHtml}
                    <span class="modal-chip-text">${escapeHTML(val)}</span>
                    <button type="button" class="modal-chip-remove" data-index="${idx}" title="Remove ${escapeHTML(val)}">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            `;
        }).join("");
    }

    function renderModalPresets(inputName) {
        if (!modalPresetsList) return;
        const presets = variantPresets[inputName] || [];

        modalPresetsList.innerHTML = presets.map(function (preset) {
            const alreadyExists = modalCurrentValues.some(function (v) {
                return v.toLowerCase() === preset.toLowerCase();
            });
            return `
                <button type="button" class="modal-preset-btn ${alreadyExists ? 'active' : ''}" data-value="${escapeHTML(preset)}">
                    ${alreadyExists ? '✓' : '+'} ${escapeHTML(preset)}
                </button>
            `;
        }).join("");
    }

    function addOptionsToModal(rawInput) {
        if (!rawInput || !rawInput.trim()) return;

        const parts = rawInput.split(/[,\n]/).map(function (s) { return s.trim(); }).filter(Boolean);
        let addedCount = 0;

        parts.forEach(function (part) {
            const exists = modalCurrentValues.some(function (v) {
                return v.toLowerCase() === part.toLowerCase();
            });
            if (!exists) {
                modalCurrentValues.push(part);
                addedCount++;
            }
        });

        if (addedCount > 0) {
            renderModalChips();
            if (activeModalInputName) {
                renderModalPresets(activeModalInputName);
            }
        }
    }

    // Modal Event Listeners
    if (modalAddOptionBtn && modalNewOptionInput) {
        modalAddOptionBtn.addEventListener("click", function () {
            addOptionsToModal(modalNewOptionInput.value);
            modalNewOptionInput.value = "";
            modalNewOptionInput.focus();
        });
    }

    if (modalNewOptionInput) {
        modalNewOptionInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                addOptionsToModal(this.value);
                this.value = "";
            }
        });
    }

    if (modalOptionsList) {
        modalOptionsList.addEventListener("click", function (e) {
            const removeBtn = e.target.closest(".modal-chip-remove");
            if (!removeBtn) return;
            const index = Number(removeBtn.dataset.index);
            if (!isNaN(index) && index >= 0 && index < modalCurrentValues.length) {
                modalCurrentValues.splice(index, 1);
                renderModalChips();
                if (activeModalInputName) {
                    renderModalPresets(activeModalInputName);
                }
            }
        });
    }

    if (modalPresetsList) {
        modalPresetsList.addEventListener("click", function (e) {
            const presetBtn = e.target.closest(".modal-preset-btn");
            if (!presetBtn) return;
            const value = presetBtn.dataset.value;
            if (!value) return;

            const existsIndex = modalCurrentValues.findIndex(function (v) {
                return v.toLowerCase() === value.toLowerCase();
            });

            if (existsIndex >= 0) {
                modalCurrentValues.splice(existsIndex, 1);
            } else {
                modalCurrentValues.push(value);
            }

            renderModalChips();
            if (activeModalInputName) {
                renderModalPresets(activeModalInputName);
            }
        });
    }

    if (closeVariantModalBtn) {
        closeVariantModalBtn.addEventListener("click", closeVariantEditModal);
    }

    if (modalCancelBtn) {
        modalCancelBtn.addEventListener("click", closeVariantEditModal);
    }

    if (variantEditModal) {
        variantEditModal.addEventListener("click", function (e) {
            if (e.target === variantEditModal) {
                closeVariantEditModal();
            }
        });
    }

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && variantEditModal && variantEditModal.style.display === "flex") {
            closeVariantEditModal();
        }
    });

    if (modalSaveBtn) {
        modalSaveBtn.addEventListener("click", function () {
            if (!activeModalGroup || !activeModalInputName) {
                closeVariantEditModal();
                return;
            }

            if (modalCurrentValues.length === 0) {
                alert("Please add at least one option before saving.");
                return;
            }

            const previouslyChecked = Array.from(
                activeModalGroup.querySelectorAll(`input[name="${activeModalInputName}"]:checked`)
            ).map(function (input) { return input.value; });

            const preservedChecked = previouslyChecked.filter(function (v) {
                return modalCurrentValues.includes(v);
            });
            const finalChecked = preservedChecked;

            renderVariantGroupOptions(
                activeModalGroup,
                activeModalInputName,
                modalCurrentValues,
                finalChecked
            );

            if (activeModalInputName === "sizes") {
                updateSizePriceCards();
            }

            if (activeModalInputName === "colors") {
                updateColorStockControls();
                updateAutoColorPhotoPreview();
            }

            updateVariantPreview();
            closeVariantEditModal();
        });
    }


    function enhanceVariantOptions() {

        document
            .querySelectorAll(
                ".variant-group"
            )
            .forEach(function (group) {

                if (
                    group.dataset.actionsEnhanced === "true"
                ) {
                    return;
                }

                const sizeInputs =
                    group.querySelectorAll(
                        'input[name="sizes"]'
                    );

                const colorInputs =
                    group.querySelectorAll(
                        'input[name="colors"]'
                    );

                if (
                    sizeInputs.length === 0 &&
                    colorInputs.length === 0
                ) {
                    return;
                }

                const label =
                    group.querySelector(
                        ".variant-label"
                    );

                if (!label) {
                    return;
                }


                const actions =
                    document.createElement(
                        "div"
                    );

                actions.className =
                    "variant-group-actions";

                const editButton =
                    document.createElement(
                        "button"
                    );

                editButton.type = "button";
                editButton.className =
                    "variant-group-action-btn variant-group-edit-btn";
                editButton.textContent = "Edit";
                editButton.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit';

                const deleteButton =
                    document.createElement(
                        "button"
                    );

                deleteButton.type = "button";
                deleteButton.className =
                    "variant-group-action-btn variant-group-delete-btn";
                deleteButton.textContent = "Delete";
                deleteButton.innerHTML = '<i class="fa-solid fa-trash-can"></i> Delete';

                actions.appendChild(
                    editButton
                );

                actions.appendChild(
                    deleteButton
                );

                label.insertAdjacentElement(
                    "afterend",
                    actions
                );

                group.dataset.actionsEnhanced = "true";

                editButton.addEventListener(
                    "click",
                    function () {

                        const inputName =
                            group.querySelector(
                                'input[name="sizes"]'
                            )
                                ? "sizes"
                                : "colors";

                        openVariantEditModal(inputName, group);

                    }
                );

                deleteButton.addEventListener(
                    "click",
                    function () {

                        const inputName =
                            group.querySelector(
                                'input[name="sizes"]'
                            )
                                ? "sizes"
                                : "colors";

                        const confirmDelete =
                            window.confirm(
                                `Delete all ${inputName}?`
                            );

                        if (!confirmDelete) {
                            return;
                        }

                        const optionsContainer =
                            group.querySelector(
                                ".variant-options"
                            );

                        if (optionsContainer) {
                            optionsContainer.innerHTML = "";
                        }

                        if (inputName === "sizes") {
                            updateSizePriceCards();
                        }

                        if (inputName === "colors") {
                            updateColorStockControls();
                            updateAutoColorPhotoPreview();
                        }

                        updateVariantPreview();

                    }
                );

            });

    }


    // =====================================================
    // GET STOCK FOR A SPECIFIC COLOR
    // =====================================================

    function getVariantStockForColor(color) {

        if (
            variantColorStocks[color] !== undefined
            && variantColorStocks[color] !== null
            && variantColorStocks[color] !== ""
        ) {

            return Number(
                variantColorStocks[color]
            ) || 0;

        }

        return 0;

    }


    // =====================================================
    // CATEGORY & MATCHED PHOTO HELPERS
    // =====================================================

    let currentPreviewCategory = null;

    function getSelectedCategory() {
        if (currentPreviewCategory) {
            return currentPreviewCategory;
        }
        if (categorySelect && categorySelect.value) {
            return categorySelect.value.trim();
        }
        const el = document.getElementById("category");
        if (el && el.value) {
            return el.value.trim();
        }
        const nameEl = document.getElementById("name");
        if (nameEl && nameEl.value) {
            const n = nameEl.value.toLowerCase();
            if (n.includes("t-shirt") || n.includes("tshirt") || n.includes("tee")) return "T-Shirts";
            if (n.includes("jacket") || n.includes("coat")) return "Jackets";
            if (n.includes("hoodie") || n.includes("sweatshirt")) return "Hoodies";
            if (n.includes("jean")) return "Jeans";
            if (n.includes("pant") || n.includes("trouser") || n.includes("cargo")) return "Pants";
            if (n.includes("short")) return "Shorts";
            if (n.includes("shoe") || n.includes("sneaker")) return "Shoes";
            if (n.includes("shirt")) return "Shirts";
        }
        return "T-Shirts";
    }

    function getMatchingColorPhoto(category, color) {
        const cat = String(category || getSelectedCategory() || "").trim().toLowerCase();
        const c = String(color || "").trim().toLowerCase();

        // 1. T-SHIRTS (T-Shirts / T-Shirt / Tee)
        if (cat.includes("t-shirt") || cat.includes("tshirt") || cat.includes("tee")) {
            if (c.includes("navy")) return "/images/tshirt1.jpg";
            if (c.includes("blue") || c.includes("sky")) return "/images/tshirt10.jpg";
            if (c.includes("black") || c.includes("dark") || c.includes("jet")) return "/images/tshirt4.jpg";
            if (c.includes("red") || c.includes("maroon") || c.includes("crimson")) return "/images/tshirt7.jpg";
            if (c.includes("white") || c.includes("cream")) return "/images/tshirt9.jpg";
            if (c.includes("green") || c.includes("mint") || c.includes("sage")) return "/images/tshirt2.jpg";
            if (c.includes("olive") || c.includes("military")) return "/images/tshirt2.jpg";
            if (c.includes("grey") || c.includes("gray") || c.includes("charcoal")) return "/images/tshirt3.jpg";
            if (c.includes("teal") || c.includes("cyan")) return "/images/tshirt10.jpg";
            if (c.includes("purple") || c.includes("violet")) return "/images/tshirt10.jpg";
            if (c.includes("orange") || c.includes("coral") || c.includes("rust")) return "/images/tshirt8.jpg";
            if (c.includes("yellow") || c.includes("mustard") || c.includes("gold")) return "/images/tshirt5.jpg";
            if (c.includes("brown") || c.includes("tan") || c.includes("beige") || c.includes("khaki")) return "/images/tshirt5.jpg";
            if (c.includes("pink") || c.includes("rose")) return "/images/tshirt6.jpg";
            return "/images/tshirt1.jpg";
        }

        // 2. SHIRTS (Shirts / Shirt)
        if (cat.includes("shirt")) {
            if (c.includes("navy")) return "/images/shirt7.jpg";
            if (c.includes("blue") || c.includes("sky")) return "/images/shirt10.jpg";
            if (c.includes("red") || c.includes("maroon") || c.includes("crimson")) return "/images/shirt9.jpg";
            if (c.includes("green") || c.includes("olive") || c.includes("teal") || c.includes("mint")) return "/images/shirt8.jpg";
            if (c.includes("brown") || c.includes("tan") || c.includes("khaki") || c.includes("beige")) return "/images/shirt2.jpg";
            if (c.includes("black") || c.includes("dark") || c.includes("jet")) return "/images/shirt4.jpg";
            if (c.includes("white") || c.includes("cream")) return "/images/shirt3.jpg";
            if (c.includes("grey") || c.includes("gray") || c.includes("charcoal")) return "/images/shirt6.jpg";
            if (c.includes("pink") || c.includes("rose") || c.includes("peach")) return "/images/shirt5.jpg";
            if (c.includes("orange") || c.includes("coral") || c.includes("yellow") || c.includes("gold")) return "/images/shirt11.jpg";
            if (c.includes("purple")) return "/images/shirt5.jpg";
            return "/images/shirt10.jpg";
        }

        // 3. JEANS
        if (cat.includes("jean") || cat.includes("denim")) {
            if (c.includes("navy")) return "/images/jeans3.jpg";
            if (c.includes("blue") || c.includes("indigo") || c.includes("denim")) return "/images/jeans3.jpg";
            if (c.includes("black") || c.includes("dark") || c.includes("grey") || c.includes("charcoal")) return "/images/pants cargo.jpg";
            if (c.includes("white") || c.includes("cream")) return "/images/jeans3.jpg";
            if (c.includes("brown") || c.includes("tan") || c.includes("beige")) return "/images/pants cargo.jpg";
            return "/images/jeans3.jpg";
        }

        // 4. PANTS (Pants / Chinos / Trousers / Cargo)
        if (cat.includes("pant") || cat.includes("trouser") || cat.includes("chino") || cat.includes("cargo")) {
            if (c.includes("green") || c.includes("olive") || c.includes("military") || c.includes("khaki") || c.includes("teal")) return "/images/pants cargo.jpg";
            if (c.includes("black") || c.includes("dark") || c.includes("grey") || c.includes("charcoal")) return "/images/pants cargo.jpg";
            if (c.includes("brown") || c.includes("tan") || c.includes("beige")) return "/images/shirt2.jpg";
            if (c.includes("navy")) return "/images/jeans3.jpg";
            if (c.includes("blue")) return "/images/jeans3.jpg";
            if (c.includes("white") || c.includes("cream")) return "/images/shirt3.jpg";
            return "/images/pants cargo.jpg";
        }

        // 5. JACKETS (Jackets / Coat / Outerwear / Blazer)
        if (cat.includes("jacket") || cat.includes("coat") || cat.includes("blazer")) {
            if (c.includes("green") || c.includes("olive") || c.includes("military") || c.includes("teal")) return "/images/jacket1.jpg";
            if (c.includes("navy")) return "/images/jacket2.jpg";
            if (c.includes("blue") || c.includes("sky")) return "/images/jacket2.jpg";
            if (c.includes("black") || c.includes("dark") || c.includes("jet")) return "/images/jacket3.jpg";
            if (c.includes("white") || c.includes("cream")) return "/images/jacket4.jpg";
            if (c.includes("red") || c.includes("maroon") || c.includes("burgundy") || c.includes("pink")) return "/images/jacket6.jpg";
            if (c.includes("brown") || c.includes("tan") || c.includes("cognac") || c.includes("beige")) return "/images/jacket5.jpg";
            if (c.includes("grey") || c.includes("gray") || c.includes("charcoal")) return "/images/jacket4.jpg";
            if (c.includes("yellow") || c.includes("orange")) return "/images/jacket1.jpg";
            return "/images/jacket1.jpg";
        }

        // 6. HOODIES (Hoodies / Sweatshirts)
        if (cat.includes("hoodie") || cat.includes("sweatshirt") || cat.includes("fleece")) {
            if (c.includes("black") || c.includes("dark")) return "/images/jacket5.jpg";
            if (c.includes("red") || c.includes("maroon") || c.includes("wine") || c.includes("pink")) return "/images/jacket6.jpg";
            if (c.includes("grey") || c.includes("gray") || c.includes("white") || c.includes("cream")) return "/images/jacket4.jpg";
            if (c.includes("navy")) return "/images/jacket2.jpg";
            if (c.includes("blue")) return "/images/jacket2.jpg";
            if (c.includes("green") || c.includes("olive") || c.includes("teal")) return "/images/jacket1.jpg";
            if (c.includes("brown") || c.includes("tan") || c.includes("beige")) return "/images/jacket5.jpg";
            if (c.includes("yellow") || c.includes("orange")) return "/images/jacket1.jpg";
            return "/images/jacket5.jpg";
        }

        // 7. SHORTS
        if (cat.includes("short")) {
            if (c.includes("green") || c.includes("olive") || c.includes("khaki") || c.includes("teal")) return "/images/pants cargo.jpg";
            if (c.includes("navy")) return "/images/jeans3.jpg";
            if (c.includes("blue") || c.includes("denim")) return "/images/jeans3.jpg";
            if (c.includes("black") || c.includes("dark") || c.includes("grey")) return "/images/pants cargo.jpg";
            if (c.includes("brown") || c.includes("tan") || c.includes("beige")) return "/images/shirt2.jpg";
            if (c.includes("white")) return "/images/shirt3.jpg";
            return "/images/pants cargo.jpg";
        }

        // 8. SHOES (Shoes / Footwear / Sneakers)
        if (cat.includes("shoe") || cat.includes("sneaker") || cat.includes("footwear")) {
            if (c.includes("navy")) return "/images/jacket2.jpg";
            if (c.includes("blue")) return "/images/jacket2.jpg";
            if (c.includes("black") || c.includes("dark")) return "/images/jacket3.jpg";
            if (c.includes("brown") || c.includes("tan") || c.includes("beige")) return "/images/shirt2.jpg";
            if (c.includes("white") || c.includes("cream")) return "/images/shirt3.jpg";
            if (c.includes("red") || c.includes("maroon")) return "/images/shirt9.jpg";
            if (c.includes("green") || c.includes("olive") || c.includes("teal")) return "/images/jacket1.jpg";
            if (c.includes("grey") || c.includes("gray")) return "/images/shirt6.jpg";
            return "/images/jacket2.jpg";
        }

        // 9. ACCESSORIES (Accessories / Caps / Belts / Bags)
        if (cat.includes("accessor") || cat.includes("belt") || cat.includes("cap") || cat.includes("hat") || cat.includes("watch")) {
            if (c.includes("black") || c.includes("dark")) return "/images/jacket3.jpg";
            if (c.includes("brown") || c.includes("tan") || c.includes("beige")) return "/images/shirt2.jpg";
            if (c.includes("gold") || c.includes("yellow") || c.includes("orange")) return "/images/shirt11.jpg";
            if (c.includes("silver") || c.includes("grey") || c.includes("gray") || c.includes("white")) return "/images/shirt6.jpg";
            if (c.includes("navy")) return "/images/shirt7.jpg";
            if (c.includes("blue")) return "/images/shirt10.jpg";
            if (c.includes("red") || c.includes("maroon")) return "/images/shirt9.jpg";
            if (c.includes("green") || c.includes("olive") || c.includes("teal")) return "/images/shirt8.jpg";
            return "/images/jacket3.jpg";
        }

        // Direct color photo fallback: default to authentic t-shirt photos
        if (c.includes("navy")) return "/images/tshirt1.jpg";
        if (c.includes("blue")) return "/images/tshirt10.jpg";
        if (c.includes("black") || c.includes("dark")) return "/images/tshirt4.jpg";
        if (c.includes("red") || c.includes("maroon")) return "/images/tshirt7.jpg";
        if (c.includes("green") || c.includes("olive")) return "/images/tshirt2.jpg";
        if (c.includes("white") || c.includes("cream")) return "/images/tshirt9.jpg";
        if (c.includes("grey") || c.includes("gray")) return "/images/tshirt3.jpg";
        if (c.includes("teal") || c.includes("cyan")) return "/images/tshirt10.jpg";
        if (c.includes("brown") || c.includes("tan") || c.includes("beige")) return "/images/tshirt5.jpg";
        if (c.includes("yellow") || c.includes("mustard")) return "/images/tshirt5.jpg";
        if (c.includes("orange")) return "/images/tshirt8.jpg";
        if (c.includes("pink")) return "/images/tshirt6.jpg";

        return "/images/tshirt1.jpg";
    }

    function getColorHex(colorName) {
        if (!colorName) return "#64748B";
        const c = String(colorName).trim().toLowerCase();
        if (c.startsWith("#")) return c;

        // Specific multi-word shades first
        if (c.includes("light blue") || c.includes("sky blue") || c.includes("powder blue") || c.includes("baby blue")) return "#38BDF8";
        if (c.includes("dark blue")) return "#1E3A8A";
        if (c.includes("royal blue")) return "#1D4ED8";
        if (c.includes("dark teal")) return "#115E59";
        if (c.includes("peacock")) return "#0E7490";
        if (c.includes("sea green")) return "#059669";
        if (c.includes("dark green") || c.includes("forest")) return "#14532D";
        if (c.includes("burnt orange") || c.includes("rust")) return "#C2410C";
        if (c.includes("peach")) return "#FB923C";
        if (c.includes("coral")) return "#F97316";
        if (c.includes("rose")) return "#F43F5E";
        if (c.includes("blush") || c.includes("salmon")) return "#FB7185";
        if (c.includes("mustard")) return "#CA8A04";
        if (c.includes("lavender") || c.includes("lilac")) return "#C084FC";
        if (c.includes("plum")) return "#581C87";
        if (c.includes("tan")) return "#D2B48C";
        if (c.includes("mocha")) return "#6F4E37";

        // Primary / Standard shades
        if (c.includes("navy") || c.includes("midnight")) return "#1B2A4A";
        if (c.includes("teal") || c.includes("cyan") || c.includes("turquoise") || c.includes("aqua")) return "#0D9488";
        if (c.includes("olive") || c.includes("military") || c.includes("army")) return "#65A30D";
        if (c.includes("sage")) return "#84A98C";
        if (c.includes("mint") || c.includes("seafoam")) return "#6EE7B7";
        if (c.includes("blue") || c.includes("indigo")) return "#2563EB";
        if (c.includes("maroon") || c.includes("burgundy") || c.includes("wine")) return "#832729";
        if (c.includes("red") || c.includes("crimson") || c.includes("ruby")) return "#DC2626";
        if (c.includes("orange")) return "#EA580C";
        if (c.includes("green") || c.includes("emerald")) return "#16A34A";
        if (c.includes("yellow") || c.includes("gold") || c.includes("lemon") || c.includes("amber")) return "#EAB308";
        if (c.includes("pink") || c.includes("magenta")) return "#EC4899";
        if (c.includes("purple") || c.includes("violet")) return "#9333EA";
        if (c.includes("brown") || c.includes("cognac")) return "#78350F";
        if (c.includes("beige") || c.includes("khaki") || c.includes("sand")) return "#D4B996";
        if (c.includes("charcoal")) return "#334155";
        if (c.includes("grey") || c.includes("gray") || c.includes("silver") || c.includes("ash")) return "#64748B";
        if (c.includes("white") || c.includes("cream") || c.includes("ivory")) return "#FFFFFF";
        if (c.includes("black") || c.includes("jet")) return "#181818";

        return "#64748B";
    }

    // =====================================================
    // GET VARIANT IMAGE FOR A SPECIFIC COLOR
    // =====================================================

    function getVariantImageForColor(color) {
        if (color) {
            const lower = String(color).trim().toLowerCase();
            if (variantImageDataByColor[color]) {
                return variantImageDataByColor[color];
            }
            for (const k of Object.keys(variantImageDataByColor)) {
                if (k.trim().toLowerCase() === lower && variantImageDataByColor[k]) {
                    return variantImageDataByColor[k];
                }
            }
            const fileMatch = selectedProductImages.find(function (f) {
                return f._detectedColor && f._detectedColor.trim().toLowerCase() === lower;
            });
            if (fileMatch && fileMatch._dataUrl) {
                return fileMatch._dataUrl;
            }
        }
        const category = getSelectedCategory();
        return getMatchingColorPhoto(category, color);
    }


    // =====================================================
    // UPDATE AUTO-MATCHED COLOR PHOTO PREVIEW (ADMIN SIDE)
    // =====================================================

    function updateAutoColorPhotoPreview() {
        if (!adminColorPhotoMatchContainer) {
            return;
        }

        const category = getSelectedCategory();
        const colors = getSelectedColors();

        // Update uploaded photos pill visibility and count
        const pillUploaded = document.getElementById("pillUploadedPhotos");
        const countSpan = document.getElementById("uploadedPhotosCount");
        const hasUploaded = selectedProductImages && selectedProductImages.length > 0;

        if (pillUploaded) {
            if (hasUploaded) {
                pillUploaded.style.display = "inline-flex";
                if (countSpan) countSpan.textContent = selectedProductImages.length;
            } else {
                pillUploaded.style.display = "none";
                if (currentPreviewCategory === "__uploaded__") {
                    currentPreviewCategory = category || "T-Shirts";
                }
            }
        }

        const isUploadedActive = (currentPreviewCategory === "__uploaded__" || (!currentPreviewCategory && hasUploaded)) && hasUploaded;

        // Update active badge and active category pill
        const badge = document.getElementById("activeCategoryBadge");
        if (badge) {
            if (isUploadedActive) {
                badge.innerHTML = `<i class="fa-solid fa-cloud-arrow-up" style="color:#16a34a;"></i> Source: <strong>Uploaded Photos (${selectedProductImages.length})</strong>`;
            } else {
                const activeCat = (!isUploadedActive && currentPreviewCategory) ? currentPreviewCategory : (category || 'T-Shirts');
                badge.innerHTML = `<i class="fa-solid fa-shirt"></i> Current: <strong>${escapeHTML(activeCat)}</strong>`;
            }
        }

        document.querySelectorAll(".cat-pill").forEach(function (pill) {
            if (pill.dataset.category === "__uploaded__") {
                pill.classList.toggle("active", isUploadedActive);
            } else {
                const activeCat = (!isUploadedActive && currentPreviewCategory) ? currentPreviewCategory : (category || 't-shirts');
                const isActive = !isUploadedActive && pill.dataset.category && pill.dataset.category.toLowerCase() === activeCat.toLowerCase();
                pill.classList.toggle("active", isActive);
            }
        });

        // When uploaded photos are active or exist, render EVERY uploaded photo directly
        if (isUploadedActive && selectedProductImages.length > 0) {
            adminColorPhotoMatchContainer.innerHTML = `
                <div class="color-photo-match-grid">
                    ${selectedProductImages.map(function (file, idx) {
                        const color = file._detectedColor || (colors[idx] || `Color ${idx + 1}`);
                        const hex = getColorHex(color);
                        const borderStyle = hex === "#FFFFFF" ? "border: 1.5px solid #cbd5e1;" : "";
                        const displayPhoto = file._dataUrl || (file instanceof File ? URL.createObjectURL(file) : "/images/jacket2.jpg");
                        const fileName = file.name || `photo-${idx + 1}.jpg`;

                        return `
                            <div class="color-photo-match-card has-uploaded-match" tabindex="0" role="button" data-photo="${escapeHTML(displayPhoto)}" data-color="${escapeHTML(color)}" aria-label="View ${escapeHTML(color)} photo ${idx + 1}">
                                <img src="${displayPhoto}" alt="${escapeHTML(color)} photo ${idx + 1}" onerror="this.src='/images/jacket2.jpg'">
                                <div class="color-photo-match-info">
                                    <div class="color-title">
                                        <span class="color-dot" style="background-color: ${hex}; ${borderStyle}"></span>
                                        <span>${escapeHTML(color)}</span>
                                    </div>
                                    <span class="file-name" title="${escapeHTML(fileName)}">${escapeHTML(fileName)}</span>
                                    <span class="badge-auto" style="background:#e0f2fe; color:#0369a1; border-color:#bae6fd;">
                                        <i class="fa-solid fa-cloud-arrow-up"></i> Photo #${idx + 1} (${escapeHTML(color)})
                                    </span>
                                </div>
                            </div>
                        `;
                    }).join("")}
                </div>
            `;

            adminColorPhotoMatchContainer.querySelectorAll(".color-photo-match-card").forEach(function (card) {
                card.addEventListener("click", function () {
                    openColorPhotoViewer(card.dataset.photo, card.dataset.color);
                });

                card.addEventListener("keydown", function (event) {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openColorPhotoViewer(card.dataset.photo, card.dataset.color);
                    }
                });
            });
            return;
        }

        if (colors.length === 0) {
            adminColorPhotoMatchContainer.innerHTML = `
                <p class="empty-message">
                    Select a category and colors above to preview auto-matched ${escapeHTML(category || 'product')} photos.
                </p>
            `;
            return;
        }

        const previewCategory = (!isUploadedActive && currentPreviewCategory) ? currentPreviewCategory : (category || "T-Shirts");

        adminColorPhotoMatchContainer.innerHTML = `
            <div class="color-photo-match-grid">
                ${colors.map(function (color) {
                    const categoryPhoto = getMatchingColorPhoto(previewCategory, color);
                    const hex = getColorHex(color);
                    const borderStyle = hex === "#FFFFFF" ? "border: 1.5px solid #cbd5e1;" : "";

                    // Check if an uploaded custom photo is linked to this color
                    const lowerColor = String(color).trim().toLowerCase();
                    const uploadedFile = selectedProductImages.find(function (f) {
                        return f._detectedColor && f._detectedColor.trim().toLowerCase() === lowerColor;
                    });

                    let customDataUrl = (uploadedFile && uploadedFile._dataUrl) || variantImageDataByColor[color] || null;
                    if (!customDataUrl) {
                        for (const k of Object.keys(variantImageDataByColor)) {
                            if (k.trim().toLowerCase() === lowerColor && variantImageDataByColor[k]) {
                                customDataUrl = variantImageDataByColor[k];
                                break;
                            }
                        }
                    }

                    // Prioritize the uploaded photo whenever available, or category photo
                    const hasCustom = !!customDataUrl;
                    const displayPhoto = (isUploadedActive && hasCustom) ? customDataUrl : (hasCustom ? customDataUrl : categoryPhoto);
                    const isPhotoUploaded = (displayPhoto === customDataUrl);

                    const fileName = (isPhotoUploaded && uploadedFile && uploadedFile.name)
                        ? uploadedFile.name
                        : (isPhotoUploaded ? `${color}-uploaded.jpg` : categoryPhoto.split("/").pop());

                    return `
                        <div class="color-photo-match-card ${isPhotoUploaded ? 'has-uploaded-match' : ''}" tabindex="0" role="button" data-photo="${escapeHTML(displayPhoto)}" data-color="${escapeHTML(color)}" aria-label="View ${escapeHTML(color)} photo">
                            <img src="${displayPhoto}" alt="${escapeHTML(color)} ${escapeHTML(previewCategory)} photo" onerror="this.src='/images/jacket2.jpg'">
                            <div class="color-photo-match-info">
                                <div class="color-title">
                                    <span class="color-dot" style="background-color: ${hex}; ${borderStyle}"></span>
                                    <span>${escapeHTML(color)}</span>
                                </div>
                                <span class="file-name" title="${escapeHTML(fileName)}">${escapeHTML(fileName)}</span>
                                ${isPhotoUploaded ? `
                                    <span class="badge-auto" style="background:#e0f2fe; color:#0369a1; border-color:#bae6fd;">
                                        <i class="fa-solid fa-cloud-arrow-up"></i> Uploaded Photo Linked
                                    </span>
                                ` : `
                                    <span class="badge-auto">
                                        <i class="fa-solid fa-wand-magic-sparkles"></i> Auto-Matched (${escapeHTML(previewCategory)})
                                    </span>
                                `}
                            </div>
                        </div>
                    `;
                }).join("")}
            </div>
        `;

        adminColorPhotoMatchContainer.querySelectorAll(".color-photo-match-card").forEach(function (card) {
            card.addEventListener("click", function () {
                openColorPhotoViewer(card.dataset.photo, card.dataset.color);
            });

            card.addEventListener("keydown", function (event) {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openColorPhotoViewer(card.dataset.photo, card.dataset.color);
                }
            });
        });
    }

    function openColorPhotoViewer(photoUrl, color) {
        if (!photoUrl) return;

        let viewer = document.getElementById("colorPhotoViewer");
        if (!viewer) {
            viewer = document.createElement("div");
            viewer.id = "colorPhotoViewer";
            viewer.className = "color-photo-viewer";
            viewer.innerHTML = `
                <div class="color-photo-viewer-card" role="dialog" aria-modal="true" aria-label="Color photo preview">
                    <button type="button" class="color-photo-viewer-close" aria-label="Close photo preview">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                    <img class="color-photo-viewer-image" alt="">
                    <strong class="color-photo-viewer-title"></strong>
                </div>
            `;
            document.body.appendChild(viewer);

            viewer.addEventListener("click", function (event) {
                if (event.target === viewer || event.target.closest(".color-photo-viewer-close")) {
                    viewer.classList.remove("is-visible");
                }
            });
        }

        viewer.querySelector(".color-photo-viewer-image").src = photoUrl;
        viewer.querySelector(".color-photo-viewer-image").alt = `${color || "Color"} product photo`;
        viewer.querySelector(".color-photo-viewer-title").textContent = `${color || "Color"} photo`;
        viewer.classList.add("is-visible");
    }


    // =====================================================
    // GET VARIANT IMAGE FILE FOR A SPECIFIC COLOR
    // =====================================================

    function getVariantImageFileForColor(color) {
        if (!color) return null;
        if (variantImageFilesByColor[color]) {
            return variantImageFilesByColor[color];
        }
        const lower = String(color).trim().toLowerCase();
        for (const k of Object.keys(variantImageFilesByColor)) {
            if (k.toLowerCase() === lower) {
                return variantImageFilesByColor[k];
            }
        }
        const fileMatch = selectedProductImages.find(function (f) {
            return f._detectedColor && f._detectedColor.toLowerCase() === lower;
        });
        if (fileMatch) return fileMatch;

        return null;
    }


    // =====================================================
    // UPDATE COLOR STOCK CONTROLS
    // =====================================================

    function updateColorStockControls() {

        if (!colorStockContainer) {
            return;
        }

        const colors =
            getSelectedColors();

        colorStockContainer.innerHTML = "";

        if (colors.length === 0) {

            colorStockContainer.innerHTML = `
                <p class="empty-message">
                    Select a color to manage stock.
                </p>
            `;

            return;

        }

        const mainStockInput = document.getElementById("stock");
        const defaultMainStock = Number(mainStockInput?.value) || 0;

        colors.forEach(function (color) {

            if (
                variantColorStocks[color] === undefined
            ) {

                variantColorStocks[color] = defaultMainStock > 0 ? defaultMainStock : 0;

            }

            const currentStock = getVariantStockForColor(color);
            const isOutOfStock = currentStock <= 0;

            const row =
                document.createElement("div");

            row.className =
                `color-stock-row ${isOutOfStock ? "out-of-stock-card" : "in-stock-card"}`;

            row.innerHTML = `

                <div class="color-stock-header" style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:6px;">
                    <label for="colorStock-${color}" style="font-weight:700; color:#1e293b;">
                        ${color} Stock
                    </label>
                    <span class="stock-status-pill ${isOutOfStock ? 'pill-out-of-stock' : 'pill-in-stock'}" style="${isOutOfStock ? 'background:#fee2e2; color:#dc2626; border:1px solid #fca5a5;' : 'background:#dcfce7; color:#166534; border:1px solid #86efac;'} font-size:11px; padding:2px 8px; border-radius:9999px; font-weight:700; white-space:nowrap;">
                        ${isOutOfStock ? '✕ Out of Stock' : '✓ In Stock'}
                    </span>
                </div>

                <input
                    type="number"
                    id="colorStock-${color}"
                    class="color-stock-input ${isOutOfStock ? 'is-out-of-stock' : ''}"
                    data-color="${color}"
                    min="0"
                    value="${currentStock}"
                    style="${isOutOfStock ? 'border-color:#ef4444; background:#fffbfb;' : ''}"
                >

            `;

            colorStockContainer.appendChild(row);

            const colorInput =
                row.querySelector(
                    ".color-stock-input"
                );

            if (colorInput) {

                colorInput.addEventListener(
                    "input",
                    function () {

                        const val =
                            Number(
                                this.value
                            ) || 0;

                        variantColorStocks[color] = val;

                        if (!window._manuallyEditedColorStocks) {
                            window._manuallyEditedColorStocks = {};
                        }
                        window._manuallyEditedColorStocks[color] = true;

                        const pill = row.querySelector(".stock-status-pill");
                        if (val <= 0) {
                            row.classList.add("out-of-stock-card");
                            row.classList.remove("in-stock-card");
                            this.classList.add("is-out-of-stock");
                            this.style.borderColor = "#ef4444";
                            this.style.backgroundColor = "#fffbfb";
                            if (pill) {
                                pill.textContent = "✕ Out of Stock";
                                pill.className = "stock-status-pill pill-out-of-stock";
                                pill.style.background = "#fee2e2";
                                pill.style.color = "#dc2626";
                                pill.style.border = "1px solid #fca5a5";
                            }
                        } else {
                            row.classList.remove("out-of-stock-card");
                            row.classList.add("in-stock-card");
                            this.classList.remove("is-out-of-stock");
                            this.style.borderColor = "";
                            this.style.backgroundColor = "";
                            if (pill) {
                                pill.textContent = "✓ In Stock";
                                pill.className = "stock-status-pill pill-in-stock";
                                pill.style.background = "#dcfce7";
                                pill.style.color = "#166534";
                                pill.style.border = "1px solid #86efac";
                            }
                        }

                        updateVariantPreview();

                    }
                );

            }

        });

    }


    // =====================================================
    // GET SIZE EXTRA PRICE
    // =====================================================

    function getSizeExtraPrice(size) {

        const input =
            document.querySelector(
                `.size-extra-price[data-size="${size}"]`
            );

        if (!input) {

            return (
                defaultSizePrices[size] || 0
            );

        }

        return Number(
            input.value
        ) || 0;

    }


    // =====================================================
    // UPDATE SIZE PRICE CARDS
    // =====================================================

    function updateSizePriceCards() {

        if (!sizePriceContainer) {
            return;
        }

        const sizes =
            getSelectedSizes();

        sizePriceContainer.innerHTML = "";


        // No size selected
        if (sizes.length === 0) {

            sizePriceContainer.innerHTML = `
                <p class="empty-message">
                    Select a size to set its extra price.
                </p>
            `;

            updateVariantPreview();

            return;

        }


        const basePrice =
            getBasePrice();


        sizes.forEach(function (size) {

            const defaultExtra =
                defaultSizePrices[size] || 0;

            const finalPrice =
                basePrice + defaultExtra;


            const card =
                document.createElement("div");

            card.className =
                "size-price-card";

            const sizeCardImage =
                selectedProductImages[0]
                    ? URL.createObjectURL(selectedProductImages[0])
                    : "/images/tshirt1.jpg";


            card.innerHTML = `
                
                <div class="size-price-card-header">

                    <div class="size-price-card-title">
                        <img
                            class="size-price-card-image"
                            src="${sizeCardImage}"
                            alt="Product preview"
                            onerror="this.src='/images/tshirt1.jpg'"
                        >

                        <strong>Size ${escapeHTML(size)}</strong>
                    </div>

                    <span
                        class="size-final-price"
                        data-final-price="${size}"
                    >
                        ₹${finalPrice.toFixed(2)}
                    </span>

                </div>


                <label>
                    Extra Price
                </label>


                <input
                    type="number"
                    min="0"
                    step="0.01"
                    class="size-extra-price"
                    data-size="${size}"
                    value="${defaultExtra}"
                >

            `;


            sizePriceContainer.appendChild(card);

        });


        // =================================================
        // EXTRA PRICE INPUT EVENTS
        // =================================================

        document
            .querySelectorAll(".size-extra-price")
            .forEach(function (input) {

                input.addEventListener(
                    "input",
                    function () {

                        const size =
                            this.dataset.size;

                        const extraPrice =
                            Number(
                                this.value
                            ) || 0;

                        const finalPrice =
                            getBasePrice() +
                            extraPrice;


                        const finalElement =
                            document.querySelector(
                                `[data-final-price="${size}"]`
                            );


                        if (finalElement) {

                            finalElement.textContent =
                                `₹${finalPrice.toFixed(2)}`;

                        }


                        updateVariantPreview();

                    }
                );

            });


        updateVariantPreview();

    }


    // =====================================================
    // UPDATE VARIANT PREVIEW
    // =====================================================

    function updateVariantPreview() {

        if (!variantPreview) {
            return;
        }

        const sizes =
            getSelectedSizes();

        const colors =
            getSelectedColors();


        variantPreview.innerHTML = "";


        // No size or color
        if (
            sizes.length === 0 ||
            colors.length === 0
        ) {

            variantPreview.innerHTML = `
                <p class="empty-message">
                    Select at least one size and one color.
                </p>
            `;

            return;

        }


        // =================================================
        // CREATE SIZE × COLOR COMBINATIONS
        // =================================================

        sizes.forEach(function (size) {

            colors.forEach(function (color) {

                const extraPrice =
                    getSizeExtraPrice(size);

                const finalPrice =
                    getBasePrice() +
                    extraPrice;

                const colorStock =
                    getVariantStockForColor(color);

                const previewImage =
                    getVariantImageForColor(color);


                const card =
                    document.createElement("div");

                card.className =
                    "variant-preview-card";


                card.innerHTML = `

                    <div class="variant-preview-content">

                        <div class="variant-preview-info">

                            <strong>
                                ${size} - ${color}
                            </strong>

                            <div class="price">
                                ₹${finalPrice.toFixed(2)}
                            </div>

                            <div class="stock">
                                Stock: ${colorStock}
                            </div>

                        </div>

                        ${
                            previewImage
                                ? `<img
                                    src="${previewImage}"
                                    alt="${color} variant"
                                    class="variant-preview-thumb"
                                >`
                                : `<div class="variant-preview-thumb placeholder">
                                    No image
                                </div>`
                        }

                    </div>

                `;


                variantPreview.appendChild(card);

            });

        });

    }


    // =====================================================
    // PRODUCT IMAGE PICKER
    // =====================================================

    if (chooseImagesBtn && productImages) {

        chooseImagesBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();
                productImages.click();

            }
        );

    }

    if (imageUploadArea && productImages) {

        imageUploadArea.addEventListener(
            "click",
            function (event) {

                if (
                    event.target !== chooseImagesBtn &&
                    !chooseImagesBtn?.contains(event.target) &&
                    event.target !== openAiStudioBtn &&
                    !openAiStudioBtn?.contains(event.target)
                ) {

                    productImages.click();

                }

            }
        );

    }


    // =====================================================
    // PRODUCT IMAGE SELECT
    // =====================================================

    if (productImages) {

        productImages.addEventListener(
            "change",
            function () {

                const files =
                    Array.from(this.files);


                if (
                    selectedProductImages.length +
                    files.length >
                    MAX_IMAGES
                ) {

                    alert(
                        `You can select maximum ${MAX_IMAGES} product images.`
                    );

                    this.value = "";

                    return;

                }


                selectedProductImages =
                    selectedProductImages.concat(
                        files
                    );

                currentPreviewCategory = "__uploaded__";
                renderProductImages();


                // Allows selecting same file again
                this.value = "";

            }
        );

    }


    // =====================================================
    // CALIBRATED GARMENT & APPAREL COLOR ANALYSIS VIA CANVAS
    // =====================================================

    function analyzeImageColor(dataUrl, callback) {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = function () {
            try {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d", { willReadFrequently: true });
                const width = 100;
                const height = 120;
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                const data = ctx.getImageData(0, 0, width, height).data;

                // 1. Detect dominant background color by sampling perimeter pixels (edges/corners)
                let bgR = 0, bgG = 0, bgB = 0, bgCount = 0;
                for (let x = 0; x < width; x++) {
                    for (const y of [0, 1, 2, height - 3, height - 2, height - 1]) {
                        const idx = (y * width + x) * 4;
                        if (data[idx + 3] >= 128) {
                            bgR += data[idx];
                            bgG += data[idx + 1];
                            bgB += data[idx + 2];
                            bgCount++;
                        }
                    }
                }
                for (let y = 0; y < height; y++) {
                    for (const x of [0, 1, 2, width - 3, width - 2, width - 1]) {
                        const idx = (y * width + x) * 4;
                        if (data[idx + 3] >= 128) {
                            bgR += data[idx];
                            bgG += data[idx + 1];
                            bgB += data[idx + 2];
                            bgCount++;
                        }
                    }
                }

                const avgBgR = bgCount > 0 ? bgR / bgCount : 255;
                const avgBgG = bgCount > 0 ? bgG / bgCount : 255;
                const avgBgB = bgCount > 0 ? bgB / bgCount : 255;
                const isBgLight = (avgBgR + avgBgG + avgBgB) / 3 > 160;

                const scores = {
                    "Light Blue": 0,
                    Blue: 0,
                    Navy: 0,
                    Teal: 0,
                    Green: 0,
                    Sage: 0,
                    Mint: 0,
                    Olive: 0,
                    Red: 0,
                    Maroon: 0,
                    Pink: 0,
                    Orange: 0,
                    Yellow: 0,
                    Brown: 0,
                    Beige: 0,
                    "Off White": 0,
                    Purple: 0,
                    Black: 0,
                    Charcoal: 0,
                    Grey: 0,
                    White: 0
                };

                // Torso / chest focus area: y from 30% to 75%, x from 24% to 76%
                const yStart = Math.floor(height * 0.30);
                const yEnd = Math.floor(height * 0.74);
                const xStart = Math.floor(width * 0.24);
                const xEnd = Math.floor(width * 0.76);
                const centerX = width * 0.50;
                const centerY = height * 0.52;

                let validPixelCount = 0;
                let sumR = 0, sumG = 0, sumB = 0;

                for (let y = yStart; y < yEnd; y++) {
                    for (let x = xStart; x < xEnd; x++) {
                        const index = (y * width + x) * 4;
                        const red = data[index];
                        const green = data[index + 1];
                        const blue = data[index + 2];
                        const alpha = data[index + 3];

                        if (alpha < 128) continue;

                        // Exclude background pixels that match detected edge/studio background
                        const distToBg = Math.hypot(red - avgBgR, green - avgBgG, blue - avgBgB);
                        if (distToBg < 35) {
                            continue;
                        }

                        // Also filter near-white background edges if background is light
                        if (isBgLight && red > 240 && green > 240 && blue > 240 && (x < width * 0.28 || x > width * 0.72)) {
                            continue;
                        }

                        const maximum = Math.max(red, green, blue);
                        const minimum = Math.min(red, green, blue);
                        const delta = maximum - minimum;

                        let hue = 0;
                        if (delta !== 0) {
                            if (maximum === red) hue = ((green - blue) / delta) % 6;
                            else if (maximum === green) hue = (blue - red) / delta + 2;
                            else hue = (red - green) / delta + 4;
                            hue = Math.round(hue * 60);
                            if (hue < 0) hue += 360;
                        }

                        const saturation = maximum === 0 ? 0 : delta / maximum;
                        const value = maximum / 255;

                        // Skip human skin tones (neck, arms, chest exposed)
                        const isUpperCenter = (y < height * 0.52 && Math.abs(x - centerX) < width * 0.16);
                        const isSkinTone = (red > green && green >= blue) && (hue >= 10 && hue <= 48) && (value > 0.28) &&
                            (red - green >= 8) && (red - blue >= 15);
                        if (isUpperCenter && isSkinTone) continue;

                        validPixelCount++;
                        sumR += red;
                        sumG += green;
                        sumB += blue;

                        // Primary garment fabric is most reliably present on left & right chest panels
                        // Center line (buttons, placket trim, zipper, open neckline) has normal weight
                        const isChestFabricPanel = (Math.abs(x - centerX) >= width * 0.07 && Math.abs(x - centerX) <= width * 0.26);
                        const weight = isChestFabricPanel ? 2.2 : 1.0;

                        // --- Precise Garment Color Classification ---

                        // Monochromes first (Black, Charcoal, White, Grey)
                        const isBlack = (value < 0.20 || (red < 48 && green < 48 && blue < 48 && delta < 20));
                        const isCharcoal = !isBlack && (value >= 0.20 && value <= 0.35 && saturation < 0.14 && delta < 18);
                        const isWhite = !isBlack && !isCharcoal && (saturation < 0.08 && value > 0.85 && delta < 14);
                        const isGrey = !isBlack && !isCharcoal && !isWhite && (saturation < 0.12 && value > 0.35 && value <= 0.85 && delta < 16);

                        // Off White & Cream: very light with subtle warm tint
                        const isOffWhite = !isBlack && !isCharcoal && !isWhite && !isGrey &&
                            (value >= 0.82 && saturation >= 0.04 && saturation <= 0.16 &&
                             hue >= 18 && hue <= 58 && red >= green && green >= blue + 4);

                        // Beige: classic warm tan / cream / khaki garment tone
                        const isBeige = !isBlack && !isCharcoal && !isWhite && !isGrey && !isOffWhite &&
                            (hue >= 18 && hue <= 52 && saturation >= 0.08 && saturation <= 0.42 &&
                             value >= 0.55 && value <= 0.95 && red >= green && green >= blue + 4);

                        // Brown: deeper warm earthy tone
                        const isBrown = !isBlack && !isCharcoal && !isGrey && !isWhite && !isBeige && !isOffWhite &&
                            (hue >= 14 && hue <= 48 && saturation >= 0.16 && value < 0.58 &&
                             red > green && green >= blue && red > blue + 16);

                        // Orange: rich vibrant warm tone (never match skin)
                        const isOrange = !isBlack && !isCharcoal && !isGrey && !isWhite && !isBrown && !isBeige && !isSkinTone &&
                            (hue >= 14 && hue <= 44 && saturation >= 0.38 && value >= 0.38 && red > green + 22 && green >= blue + 12);

                        // Yellow / Mustard
                        const isYellow = !isBlack && !isCharcoal && !isGrey && !isWhite && !isOrange && !isBeige &&
                            (hue > 44 && hue <= 68 && saturation >= 0.25 && value >= 0.45 && red > 100 && green > 95 && blue < green - 20);

                        // Olive / Green / Sage / Mint
                        const isOlive = !isBlack && !isCharcoal && !isGrey && !isWhite &&
                            ((hue >= 52 && hue <= 95 && saturation >= 0.12 && value <= 0.70 && green > blue + 6) ||
                            (green > 45 && red > 38 && blue < 55 && Math.abs(red - green) < 28 && value < 0.68));

                        const isMint = !isBlack && !isCharcoal && !isGrey && !isWhite && !isOlive &&
                            (hue >= 135 && hue <= 175 && saturation >= 0.10 && value >= 0.55 && green > red + 10);

                        const isSage = !isBlack && !isCharcoal && !isGrey && !isWhite && !isOlive && !isMint &&
                            (hue >= 65 && hue <= 170 && saturation >= 0.05 && value >= 0.35 && green > red + 3 && green >= blue - 10);

                        const isGreen = !isBlack && !isCharcoal && !isGrey && !isWhite && !isMint && !isSage && !isOlive &&
                            ((hue >= 68 && hue <= 165 && saturation >= 0.12 && green > red && green > blue) ||
                            (green > 50 && green > red * 1.15 && green > blue * 1.10));

                        // Blue / Light Blue / Navy / Teal
                        const isTeal = !isBlack && !isCharcoal && !isGrey && !isWhite &&
                            (hue >= 164 && hue <= 198 && saturation >= 0.15 && green >= 40 && blue >= 40 && red <= Math.min(green, blue));

                        const isLightBlue = !isBlack && !isCharcoal && !isGrey && !isWhite && !isTeal &&
                            ((hue >= 185 && hue <= 226 && value >= 0.60 && saturation >= 0.08 && blue > red + 15) ||
                            (blue > 135 && blue > red + 28 && blue > green + 10 && value >= 0.60));

                        const isNavy = !isBlack && !isCharcoal && !isGrey && !isWhite && !isLightBlue && !isTeal &&
                            ((hue >= 195 && hue <= 255 && saturation >= 0.10 && value <= 0.50 && blue > red + 8 && blue >= green) ||
                            (blue > 35 && blue > red + 10 && blue >= green - 2 && value <= 0.50));

                        const isBlue = !isBlack && !isCharcoal && !isGrey && !isWhite && !isLightBlue && !isTeal && !isNavy &&
                            ((hue >= 195 && hue <= 258 && saturation >= 0.14 && blue > red + 10 && blue > green + 3) ||
                            (blue > red + 18 && blue > green + 8 && blue > 50));

                        // Pink: strictly in magenta (295°-345°) or light rose/red (348°-12°) with Blue >= Green - 8!
                        // NEVER allow warm yellow/tan/beige hue (14°-290°) or green > blue + 10 to match Pink!
                        const isPink = !isBlack && !isCharcoal && !isGrey && !isWhite && !isBeige && !isOffWhite &&
                            !(green > blue + 10) &&
                            ((hue >= 295 && hue <= 345 && saturation >= 0.12 && value >= 0.45) ||
                             ((hue >= 348 || hue <= 12) && saturation >= 0.15 && saturation <= 0.60 && value >= 0.58 && red > green + 22 && blue >= green - 8));

                        const isMaroon = !isBlack && !isCharcoal && !isGrey && !isWhite && !isPink &&
                            ((hue >= 335 || hue <= 13) && saturation >= 0.22 && value < 0.45 && red > green + 15 && red > blue + 10);

                        const isRed = !isBlack && !isCharcoal && !isGrey && !isWhite && !isPink && !isMaroon &&
                            ((hue >= 345 || hue <= 13) && saturation >= 0.22 && red > green + 22 && red > blue + 20);

                        const isPurple = !isBlack && !isCharcoal && !isGrey && !isWhite && !isPink &&
                            (hue > 258 && hue < 295 && saturation >= 0.15 && blue > green + 15 && red > green + 10);

                        // Allocate weighted scores
                        if (isBlack) {
                            scores.Black += 3.8 * weight;
                        } else if (isCharcoal) {
                            scores.Charcoal += 3.6 * weight;
                        } else if (isWhite) {
                            scores.White += 3.8 * weight;
                        } else if (isOffWhite) {
                            scores["Off White"] += 3.8 * weight;
                        } else if (isBeige) {
                            scores.Beige += 3.8 * weight;
                        } else if (isLightBlue) {
                            scores["Light Blue"] += 3.8 * weight;
                        } else if (isTeal) {
                            scores.Teal += 3.8 * weight;
                        } else if (isMint) {
                            scores.Mint += 3.6 * weight;
                        } else if (isSage) {
                            scores.Sage += 3.5 * weight;
                        } else if (isOlive) {
                            scores.Olive += 3.5 * weight;
                        } else if (isGreen) {
                            scores.Green += 3.5 * weight;
                        } else if (isNavy) {
                            scores.Navy += 3.8 * weight;
                        } else if (isBlue) {
                            scores.Blue += 3.6 * weight;
                        } else if (isMaroon) {
                            scores.Maroon += 3.5 * weight;
                        } else if (isRed) {
                            scores.Red += 3.4 * weight;
                        } else if (isPink) {
                            scores.Pink += 3.4 * weight;
                        } else if (isOrange) {
                            scores.Orange += 3.0 * weight;
                        } else if (isYellow) {
                            scores.Yellow += 3.2 * weight;
                        } else if (isBrown) {
                            scores.Brown += 3.4 * weight;
                        } else if (isPurple) {
                            scores.Purple += 3.4 * weight;
                        } else if (isGrey) {
                            scores.Grey += 2.8 * weight;
                        }
                    }
                }

                // If Black or Charcoal or strong chromatic color dominates, heavily suppress White background bleed
                const dominantNonWhite = scores.Black + scores.Charcoal + scores.Green + scores.Teal + scores.Blue + scores["Light Blue"] + scores.Navy + scores.Red + scores.Maroon + scores.Pink + scores.Orange + scores.Yellow + scores.Purple + scores.Brown + scores.Beige;
                if (dominantNonWhite > 20 && dominantNonWhite > scores.White * 0.8) {
                    scores.White *= 0.15;
                }

                // For patterned/printed shirts (e.g. floral print on Navy/Blue fabric),
                // if Navy or Blue has substantial score alongside print colors (like Orange/Pink/Yellow),
                // the dominant base fabric (Navy/Blue) takes clear precedence!
                const totalBlueNavy = scores.Navy + scores.Blue;
                if (totalBlueNavy > 0 && totalBlueNavy > scores.Orange * 0.6) {
                    scores.Orange *= 0.35;
                }

                // If Black is strong and Charcoal exists, consolidate into Black
                if (scores.Black > 0 && scores.Charcoal > 0) {
                    if (scores.Black >= scores.Charcoal) {
                        scores.Black += scores.Charcoal * 0.6;
                        scores.Charcoal *= 0.3;
                    }
                }

                // Find top scoring color
                const sortedColors = Object.entries(scores).sort(function (a, b) {
                    return b[1] - a[1];
                });

                let bestColor = sortedColors[0] && sortedColors[0][1] > 0 ? sortedColors[0][0] : null;

                const avgBrightness = validPixelCount > 0 ? (sumR + sumG + sumB) / (3 * validPixelCount * 255) : 0.5;

                // Fallback using average RGB of torso center
                if (!bestColor && validPixelCount > 0) {
                    const avgR = sumR / validPixelCount;
                    const avgG = sumG / validPixelCount;
                    const avgB = sumB / validPixelCount;
                    const avgDelta = Math.max(avgR, avgG, avgB) - Math.min(avgR, avgG, avgB);
                    if (avgR < 55 && avgG < 55 && avgB < 55) bestColor = "Black";
                    else if (avgR > 180 && avgG > 180 && avgB > 180 && avgDelta < 18) bestColor = "White";
                    else if (avgR > 180 && avgG > 165 && avgB > 140 && avgR >= avgG && avgG >= avgB + 8) bestColor = "Beige";
                    else if (avgG > avgR + 8 && avgG > avgB - 5) bestColor = "Green";
                    else if (avgB > avgR + 10 && avgB > avgG) bestColor = avgBrightness > 0.60 ? "Light Blue" : "Blue";
                    else if (avgR > avgG + 25 && avgB >= avgG - 8) bestColor = "Pink";
                    else if (avgR > avgG + 18 && avgR > avgB + 18) bestColor = "Red";
                    else if (avgDelta < 18) bestColor = avgR > 140 ? "White" : "Grey";
                    else bestColor = "Black";
                }

                // Final safety fallback
                if (!bestColor) bestColor = "Black";

                callback(bestColor, { avgBrightness, scores });
            } catch (error) {
                console.warn("Garment color analysis fallback:", error);
                callback("Black", { avgBrightness: 0.5, scores: {} });
            }
        };
        img.onerror = function () {
            callback("Black");
        };
        img.src = dataUrl;
    }


    // =====================================================
    // DYNAMIC COLOR OPTION CREATOR
    // Ensures any detected color checkbox exists in admin panel
    // =====================================================

    function ensureColorOptionExists(colorName) {
        if (!colorName) return null;
        const cleanName = String(colorName).trim();
        const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

        // 1. Check if checkbox input already exists
        let existingInput = null;
        const normTarget = formattedName.trim().toLowerCase().replace(/gray/g, 'grey');
        const cleanTarget = normTarget.replace(/[^a-z0-9]/g, '');
        document.querySelectorAll('input[name="colors"]').forEach(function (input) {
            const v = input.value.trim().toLowerCase().replace(/gray/g, 'grey');
            const cleanV = v.replace(/[^a-z0-9]/g, '');
            if (v === normTarget || cleanV === cleanTarget) {
                existingInput = input;
            }
        });
        if (existingInput) {
            const parentLabel = existingInput.closest('.variant-option');
            if (parentLabel) {
                parentLabel.style.display = "inline-flex";
            }
            return existingInput;
        }

        // 2. Find the container for color options
        const anyColorInput = document.querySelector('input[name="colors"]');
        const container = anyColorInput
            ? anyColorInput.closest('.variant-options')
            : document.querySelector('.product-variants-section .variant-options');

        if (!container) return null;

        // 3. Create new tactile variant option badge with colored circle
        const hex = getColorHex(formattedName);
        const colorSlug = formattedName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const label = document.createElement("label");
        label.className = `variant-option color-${colorSlug} selected`;
        label.style.display = "inline-flex";
        label.style.setProperty("--swatch-color", hex);

        const input = document.createElement("input");
        input.type = "checkbox";
        input.name = "colors";
        input.value = formattedName;
        input.checked = true;

        const span = document.createElement("span");
        span.textContent = formattedName;

        label.appendChild(input);
        label.appendChild(span);
        container.appendChild(label);

        // 4. Re-bind event handlers to the new input
        bindVariantInputEvents();

        return input;
    }


    // =====================================================
    // DYNAMIC COLOR FILTER: SHOW MATCHED, HIDE OTHERS
    // =====================================================

    function filterColorOptionsToMatched(matchedColorList) {
        const colorInputs = document.querySelectorAll('input[name="colors"]');
        const colorVariantGroup = document.querySelector('input[name="colors"]')?.closest('.variant-group');

        if (!colorInputs || colorInputs.length === 0) return;

        // If no images or empty matched list, show all color options
        if (!matchedColorList || matchedColorList.length === 0) {
            colorInputs.forEach(function (input) {
                const label = input.closest('.variant-option');
                if (label) {
                    label.style.display = "";
                    label.style.display = "inline-flex";
                }
            });
            const banner = document.getElementById("matchedColorsBanner");
            if (banner) banner.remove();
            return;
        }

        // Ensure every detected color option exists in the DOM
        matchedColorList.forEach(function (c) {
            ensureColorOptionExists(c);
        });

        // Re-query colorInputs after ensuring all exist
        const updatedColorInputs = document.querySelectorAll('input[name="colors"]');

        const normalizedMatched = matchedColorList.map(function (c) {
            return String(c).trim().toLowerCase().replace(/gray/g, 'grey');
        });

        updatedColorInputs.forEach(function (input) {
            const label = input.closest('.variant-option');
            if (!label) return;

            const val = String(input.value).trim().toLowerCase().replace(/gray/g, 'grey');
            const cleanVal = val.replace(/[^a-z0-9]/g, '');

            // Exact match only against detected photo colors!
            // E.g. "Olive" matches ONLY "Olive" (never "Olive Green")
            // "Grey" matches ONLY "Grey" (never "Light Grey", "Dark Grey", "Slate Grey", "Ash Grey", "Smoke Grey")
            const isMatch = normalizedMatched.some(function (m) {
                const cleanM = m.replace(/[^a-z0-9]/g, '');
                return val === m || cleanVal === cleanM;
            });

            if (isMatch) {
                // SHOW EXACT MATCHING PHOTO COLOR & CHECK IT
                label.style.display = "inline-flex";
                input.checked = true;
                label.classList.add("selected");
            } else {
                // HIDE OTHER COLOR OPTIONS UNLESS USER CLICKED "Show All"
                const bannerBtn = document.getElementById("btnToggleAllColors");
                const isShowingAll = bannerBtn && bannerBtn.dataset.showingAll === "true";
                if (!isShowingAll) {
                    label.style.display = "none";
                    input.checked = false;
                    label.classList.remove("selected");
                } else {
                    input.checked = false;
                    label.classList.remove("selected");
                }
            }
        });

        syncVariantOptionActiveState();

        // Insert or update the matched colors indicator banner
        let banner = document.getElementById("matchedColorsBanner");
        if (!banner && colorVariantGroup) {
            banner = document.createElement("div");
            banner.id = "matchedColorsBanner";
            banner.className = "matched-colors-banner";
            const optionsDiv = colorVariantGroup.querySelector(".variant-options");
            if (optionsDiv) {
                colorVariantGroup.insertBefore(banner, optionsDiv);
            }
        }

        if (banner) {
            const uniqueColors = Array.from(new Set(matchedColorList));
            const displayNames = uniqueColors.join(", ");
            const countText = uniqueColors.length === 1 ? "1 color" : `${uniqueColors.length} colors`;

            banner.innerHTML = `
                <div class="matched-banner-info">
                    <i class="fa-solid fa-wand-magic-sparkles" style="color: #c5a059;"></i>
                    <span>Photo Matched: <strong>${escapeHTML(displayNames)}</strong> (${countText} added & matched to photos)</span>
                </div>
                <button type="button" class="btn-toggle-colors" id="btnToggleAllColors">
                    <i class="fa-solid fa-eye"></i> Show All Colors
                </button>
            `;

            const toggleBtn = banner.querySelector("#btnToggleAllColors");
            if (toggleBtn) {
                toggleBtn.addEventListener("click", function (e) {
                    e.preventDefault();
                    const isShowingAll = this.dataset.showingAll === "true";
                    if (isShowingAll) {
                        this.dataset.showingAll = "false";
                        this.innerHTML = '<i class="fa-solid fa-eye"></i> Show All Colors';
                        filterColorOptionsToMatched(matchedColorList);
                    } else {
                        this.dataset.showingAll = "true";
                        this.innerHTML = '<i class="fa-solid fa-filter"></i> Show Matched Only';
                        document.querySelectorAll('input[name="colors"]').forEach(function (input) {
                            const label = input.closest('.variant-option');
                            if (label) label.style.display = "inline-flex";
                        });
                    }
                });
            }
        }
    }


    // =====================================================
    // AUTO-MATCH IMAGE TO COLOR VARIANT
    // =====================================================

    function autoMatchImageToColor(detectedColor, dataUrl, file) {
        if (!detectedColor) return;

        const targetVal = String(detectedColor).trim();
        const formattedName = targetVal.charAt(0).toUpperCase() + targetVal.slice(1);

        // Ensure this specific color option exists as a selectable option in the admin panel
        let cb = ensureColorOptionExists(formattedName);
        if (!cb) {
            document.querySelectorAll('input[name="colors"]').forEach(function (input) {
                if (input.value.toLowerCase() === formattedName.toLowerCase()) {
                    cb = input;
                }
            });
        }

        const matchedKey = cb ? cb.value : formattedName;
        variantImageDataByColor[matchedKey] = dataUrl;
        if (file) {
            file._detectedColor = matchedKey;
            variantImageFilesByColor[matchedKey] = file;
        }

        const specStyleColourInput = document.getElementById("specStyleColour");
        if (specStyleColourInput) {
            specStyleColourInput.value = matchedKey;
        }

        // Collect all detected colors across all chosen product images
        const allDetected = Array.from(new Set(
            selectedProductImages.map(function (f) {
                return f._detectedColor;
            }).filter(Boolean)
        ));

        // SHOW ALL MATCHED COLOR OPTIONS, HIDE OTHER OPTIONS
        filterColorOptionsToMatched(allDetected.length > 0 ? allDetected : [matchedKey]);

        if (selectedProductImages.length > 0 && (!currentPreviewCategory || currentPreviewCategory !== "__uploaded__")) {
            currentPreviewCategory = "__uploaded__";
        }

        updateColorStockControls();
        updateAutoColorPhotoPreview();
        updateVariantPreview();
    }


    // =====================================================
    // PALETTE OF POPULAR COLORS FOR MANUAL CORRECTION
    // =====================================================

    const POPULAR_COLORS = [
        { name: "Light Blue", hex: "#38BDF8" },
        { name: "Blue", hex: "#2563EB" },
        { name: "Navy", hex: "#1B2A4A" },
        { name: "Teal", hex: "#0D9488" },
        { name: "Dark Teal", hex: "#115E59" },
        { name: "Sage", hex: "#84A98C" },
        { name: "Mint", hex: "#6EE7B7" },
        { name: "Green", hex: "#16A34A" },
        { name: "Olive", hex: "#65A30D" },
        { name: "Red", hex: "#DC2626" },
        { name: "Maroon", hex: "#832729" },
        { name: "Black", hex: "#181818" },
        { name: "Charcoal", hex: "#334155" },
        { name: "White", hex: "#FFFFFF" },
        { name: "Off White", hex: "#FAF9F6" },
        { name: "Grey", hex: "#64748B" },
        { name: "Brown", hex: "#78350F" },
        { name: "Beige", hex: "#D4B996" },
        { name: "Yellow", hex: "#EAB308" },
        { name: "Pink", hex: "#EC4899" },
        { name: "Orange", hex: "#EA580C" },
        { name: "Rust", hex: "#C2410C" },
        { name: "Peach", hex: "#FB923C" },
        { name: "Coral", hex: "#F97316" },
        { name: "Rose", hex: "#F43F5E" },
        { name: "Purple", hex: "#9333EA" }
    ];

    function disambiguateUploadedColors() {
        if (!selectedProductImages || selectedProductImages.length <= 1) return;

        const colorCounts = {};
        selectedProductImages.forEach(function (f) {
            const c = (f._detectedColor || "Blue").trim();
            const key = c.toLowerCase();
            if (!colorCounts[key]) colorCounts[key] = [];
            colorCounts[key].push(f);
        });

        let changed = false;

        Object.keys(colorCounts).forEach(function (key) {
            const group = colorCounts[key];
            if (group.length > 1) {
                changed = true;

                group.sort(function (a, b) {
                    const brA = a._brightness !== undefined ? a._brightness : 0.5;
                    const brB = b._brightness !== undefined ? b._brightness : 0.5;
                    return brB - brA;
                });

                let shadeNames = [];
                if (key.includes("blue")) {
                    shadeNames = ["Light Blue", "Blue", "Navy", "Sky Blue", "Dark Blue", "Royal Blue"];
                } else if (key.includes("teal") || key.includes("cyan")) {
                    shadeNames = ["Teal", "Dark Teal", "Peacock Blue", "Sea Green", "Aqua"];
                } else if (key.includes("green")) {
                    shadeNames = ["Mint", "Sage", "Green", "Olive", "Dark Green"];
                } else if (key.includes("orange")) {
                    shadeNames = ["Orange", "Rust", "Peach", "Coral", "Burnt Orange"];
                } else if (key.includes("pink")) {
                    shadeNames = ["Pink", "Rose", "Blush", "Salmon", "Magenta"];
                } else if (key.includes("yellow")) {
                    shadeNames = ["Yellow", "Mustard", "Gold", "Lemon", "Amber"];
                } else if (key.includes("purple") || key.includes("violet")) {
                    shadeNames = ["Purple", "Lavender", "Plum", "Violet", "Lilac"];
                } else if (key.includes("grey") || key.includes("gray")) {
                    shadeNames = ["Grey", "Charcoal", "Silver", "Ash"];
                } else if (key.includes("red") || key.includes("maroon")) {
                    shadeNames = ["Red", "Maroon", "Wine", "Crimson"];
                } else if (key.includes("brown") || key.includes("beige")) {
                    shadeNames = ["Beige", "Tan", "Brown", "Mocha"];
                }

                const modifiers = ["Light ", "Dark ", "Deep ", "Classic ", "Rich "];
                group.forEach(function (file, idx) {
                    let newName;
                    if (shadeNames && shadeNames[idx]) {
                        newName = shadeNames[idx];
                    } else if (idx === 0) {
                        newName = file._detectedColor;
                    } else {
                        const mod = modifiers[(idx - 1) % modifiers.length];
                        newName = `${mod}${file._detectedColor}`;
                    }
                    file._detectedColor = newName;
                });
            }
        });

        if (changed) {
            variantImageDataByColor = {};
            variantImageFilesByColor = {};
            selectedProductImages.forEach(function (f, idx) {
                const c = f._detectedColor;
                if (c) {
                    variantImageDataByColor[c] = f._dataUrl;
                    variantImageFilesByColor[c] = f;
                    ensureColorOptionExists(c);

                    const badge = document.getElementById(`detectedColorBadge-${idx}`);
                    if (badge) {
                        const hex = getColorHex(c);
                        badge.style.display = "inline-flex";
                        badge.innerHTML = `
                            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${hex};margin-right:3px;border:${hex === '#FFFFFF' ? '1px solid #ccc' : 'none'};flex-shrink:0;"></span>
                            <span class="badge-text">Matched: <strong>${escapeHTML(c)}</strong></span>
                            <i class="fa-solid fa-chevron-down badge-arrow"></i>
                        `;
                    }
                }
            });

            const allCols = Array.from(new Set(selectedProductImages.map(function (f) { return f._detectedColor; }).filter(Boolean)));
            filterColorOptionsToMatched(allCols);
            updateColorStockControls();
            updateAutoColorPhotoPreview();
            updateVariantPreview();
        }
    }


    // =====================================================
    // RENDER PRODUCT IMAGES
    // =====================================================

    function renderProductImages() {
        if (!imagePreview) {
            return;
        }

        imagePreview.innerHTML = "";

        let analyzedCount = 0;
        const totalFiles = selectedProductImages.length;

        function checkAllAnalyzed() {
            analyzedCount++;
            if (analyzedCount >= totalFiles) {
                disambiguateUploadedColors();
            }
        }

        selectedProductImages.forEach(function (file, index) {
            function buildImageCard(dataUrl) {
                file._dataUrl = dataUrl;

                const div = document.createElement("div");
                div.className = "image-preview-item";

                div.innerHTML = `
                    <img src="${dataUrl}" alt="Product Image" class="product-thumb-clickable" title="Click on photo to open in AI Studio Packshot">
                    ${file._isAiGenerated ? `
                        <div class="ai-generated-badge" title="AI Studio Packshot">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> AI Studio
                        </div>
                    ` : `
                        <button type="button" class="quick-ai-btn" data-index="${index}" title="Generate AI Studio Packshot from this photo">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> Studio AI
                        </button>
                    `}
                    <button
                        type="button"
                        class="image-remove-btn"
                        data-index="${index}"
                        title="Remove image"
                    >
                        ×
                    </button>
                    <div
                        class="detected-color-badge"
                        id="detectedColorBadge-${index}"
                        data-index="${index}"
                        title="Click to choose or change exact color"
                    >
                        <i class="fa-solid fa-spinner fa-spin"></i> <span>Analyzing...</span>
                    </div>
                    <div class="image-color-picker-popover" id="colorPickerPopover-${index}">
                        ${POPULAR_COLORS.map(function (c) {
                            return `
                                <button type="button" class="color-pop-btn" data-color="${c.name}" data-index="${index}">
                                    <span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${c.hex};border:${c.hex === '#FFFFFF' ? '1px solid #ccc' : 'none'};flex-shrink:0;"></span>
                                    <span>${c.name}</span>
                                </button>
                            `;
                        }).join("")}
                    </div>
                `;

                imagePreview.appendChild(div);

                // Clicking photo thumbnail opens AI Studio Packshot
                const thumbImg = div.querySelector(".product-thumb-clickable");
                if (thumbImg) {
                    thumbImg.addEventListener("click", function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        openAiStudioModal(file);
                    });
                }

                // Function to set and reflect color choice
                function applyColorSelection(chosenColor) {
                    file._detectedColor = chosenColor;
                    const hex = getColorHex(chosenColor);
                    const badge = div.querySelector(".detected-color-badge");
                    if (badge) {
                        badge.style.display = "inline-flex";
                        badge.innerHTML = `
                            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${hex};margin-right:3px;border:${hex === '#FFFFFF' ? '1px solid #ccc' : 'none'};flex-shrink:0;"></span>
                            <span class="badge-text">Matched: <strong>${escapeHTML(chosenColor)}</strong></span>
                            <i class="fa-solid fa-chevron-down badge-arrow"></i>
                        `;
                    }
                    div.querySelectorAll(".color-pop-btn").forEach(function (btn) {
                        btn.classList.toggle("selected", btn.dataset.color.toLowerCase() === chosenColor.toLowerCase());
                    });
                    autoMatchImageToColor(chosenColor, dataUrl, file);
                }

                // Interactive popover toggle on badge click
                const badge = div.querySelector(".detected-color-badge");
                const popover = div.querySelector(".image-color-picker-popover");

                if (badge && popover) {
                    badge.addEventListener("click", function (e) {
                        e.stopPropagation();
                        document.querySelectorAll(".image-color-picker-popover.open").forEach(function (p) {
                            if (p !== popover) p.classList.remove("open");
                        });
                        popover.classList.toggle("open");
                    });
                }

                // Color selection button click inside popover
                div.querySelectorAll(".color-pop-btn").forEach(function (btn) {
                    btn.addEventListener("click", function (e) {
                        e.stopPropagation();
                        const chosen = this.dataset.color;
                        applyColorSelection(chosen);
                        if (popover) popover.classList.remove("open");
                    });
                });

                // Quick AI Studio button click
                const quickAiBtn = div.querySelector(".quick-ai-btn");
                if (quickAiBtn) {
                    quickAiBtn.addEventListener("click", function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        openAiStudioModal(file);
                    });
                }

                // If color already selected/detected, apply it; otherwise analyze image
                if (file._detectedColor) {
                    applyColorSelection(file._detectedColor);
                    checkAllAnalyzed();
                } else {
                    analyzeImageColor(dataUrl, function (detectedColor, meta) {
                        if (meta && meta.avgBrightness !== undefined) {
                            file._brightness = meta.avgBrightness;
                        }
                        applyColorSelection(detectedColor);
                        checkAllAnalyzed();
                    });
                }
            }

            if (file._dataUrl) {
                buildImageCard(file._dataUrl);
            } else {
                const reader = new FileReader();
                reader.onload = function (event) {
                    buildImageCard(event.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Global listener to close color picker popovers on outside click
    document.addEventListener("click", function (e) {
        if (!e.target.closest(".image-color-picker-popover") && !e.target.closest(".detected-color-badge")) {
            document.querySelectorAll(".image-color-picker-popover.open").forEach(function (p) {
                p.classList.remove("open");
            });
        }
    });


    // =====================================================
    // REMOVE PRODUCT IMAGE
    // =====================================================

    if (imagePreview) {

        imagePreview.addEventListener(
            "click",
            function (event) {

                const button =
                    event.target.closest(
                        ".image-remove-btn"
                    );

                if (!button) {
                    return;
                }

                const index =
                    Number(
                        button.dataset.index
                    );

                const removedFile = selectedProductImages[index];
                selectedProductImages.splice(
                    index,
                    1
                );

                if (removedFile && removedFile._detectedColor) {
                    const stillPresent = selectedProductImages.some(function (f) {
                        return f._detectedColor === removedFile._detectedColor;
                    });
                    if (!stillPresent) {
                        delete variantImageDataByColor[removedFile._detectedColor];
                        delete variantImageFilesByColor[removedFile._detectedColor];
                    }
                }

                const allRemaining = Array.from(new Set(
                    selectedProductImages.map(function (f) {
                        return f._detectedColor;
                    }).filter(Boolean)
                ));

                if (selectedProductImages.length === 0) {
                    currentPreviewCategory = getSelectedCategory() || "T-Shirts";
                }

                // Re-filter color options (or restore all if 0 images left)
                filterColorOptionsToMatched(allRemaining);

                renderProductImages();
                updateColorStockControls();
                updateAutoColorPhotoPreview();
                updateVariantPreview();

            }
        );

    }


    // =====================================================
    // VARIANT IMAGE PICKER
    // =====================================================

    if (chooseVariantImagesBtn && variantImages) {

        chooseVariantImagesBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();
                variantImages.click();

            }
        );

    }

    if (variantImageUploadArea && variantImages) {

        variantImageUploadArea.addEventListener(
            "click",
            function (event) {

                if (
                    event.target !== chooseVariantImagesBtn &&
                    !chooseVariantImagesBtn?.contains(event.target)
                ) {

                    variantImages.click();

                }

            }
        );

    }


    // =====================================================
    // VARIANT IMAGE SELECT
    // =====================================================

    if (variantImages) {

        variantImages.addEventListener(
            "change",
            function () {

                const files =
                    Array.from(this.files);


                if (
                    selectedVariantImages.length +
                    files.length >
                    MAX_IMAGES
                ) {

                    alert(
                        `You can select maximum ${MAX_IMAGES} variant images.`
                    );

                    this.value = "";

                    return;

                }


                selectedVariantImages =
                    selectedVariantImages.concat(
                        files
                    );


                renderVariantImages();
                updateVariantPreview();


                this.value = "";

            }
        );

    }


    // =====================================================
    // RENDER VARIANT IMAGES
    // =====================================================

    function renderVariantImages() {

        if (!variantImagePreview) {
            return;
        }

        const colors =
            getSelectedColors();

        const imageColors =
            colors.length > 0
                ? colors
                : variantColorOrder;

        variantImagePreview.innerHTML = "";
        variantImageDataByColor = {};
        variantImageFilesByColor = {};


        selectedVariantImages.forEach(
            function (file, index) {

                const color =
                    imageColors[index] ||
                    null;

                if (color) {

                    variantImageFilesByColor[color] = file;

                }

                const reader =
                    new FileReader();


                reader.onload =
                    function (event) {

                        const div =
                            document.createElement(
                                "div"
                            );


                        div.className =
                            "variant-image-item";


                        div.innerHTML = `

                            <img
                                src="${event.target.result}"
                                alt="Variant Image"
                            >

                            <button
                                type="button"
                                class="image-remove-btn"
                                data-index="${index}"
                                title="Remove image"
                            >
                                ×
                            </button>

                        `;


                        variantImagePreview.appendChild(div);

                        if (color) {

                            variantImageDataByColor[color] =
                                event.target.result;

                        }

                        updateVariantPreview();

                    };


                reader.readAsDataURL(file);

            }
        );

    }


    // =====================================================
    // REMOVE VARIANT IMAGE
    // =====================================================

    if (variantImagePreview) {

        variantImagePreview.addEventListener(
            "click",
            function (event) {

                const button =
                    event.target.closest(
                        ".image-remove-btn"
                    );


                if (!button) {
                    return;
                }


                const index =
                    Number(
                        button.dataset.index
                    );


                selectedVariantImages.splice(
                    index,
                    1
                );


                renderVariantImages();
                updateVariantPreview();

            }
        );

    }


    // =====================================================
    // SIZE CHANGE
    // =====================================================

    function syncVariantOptionActiveState() {
        document.querySelectorAll('.variant-option').forEach(function (opt) {
            const cb = opt.querySelector('input[type="checkbox"]');
            if (cb && cb.checked) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });
    }

    function bindVariantInputEvents() {

        document
            .querySelectorAll(
                'input[name="sizes"]'
            )
            .forEach(function (input) {

                if (
                    input.dataset.bound === "true"
                ) {
                    return;
                }

                input.dataset.bound = "true";

                input.addEventListener(
                    "change",
                    function () {
                        syncVariantOptionActiveState();
                        updateSizePriceCards();
                    }
                );

            });


        document
            .querySelectorAll(
                'input[name="colors"]'
            )
            .forEach(function (input) {

                if (
                    input.dataset.bound === "true"
                ) {
                    return;
                }

                input.dataset.bound = "true";

                input.addEventListener(
                    "change",
                    function () {

                        syncVariantOptionActiveState();
                        updateColorStockControls();
                        updateAutoColorPhotoPreview();
                        updateVariantPreview();

                        // Automatically update Style Colour in admin form
                        const specStyleColourInput = document.getElementById("specStyleColour");
                        if (specStyleColourInput) {
                            if (this.checked) {
                                specStyleColourInput.value = this.value;
                            } else {
                                const remaining = getSelectedColors();
                                specStyleColourInput.value = remaining.length > 0 ? remaining[0] : "";
                            }
                        }

                    }
                );

            });

        syncVariantOptionActiveState();

    }


    function bindCategoryFilterPills() {
        const pills = document.querySelectorAll(".cat-pill");
        pills.forEach(function (pill) {
            if (pill.dataset.bound) return;
            pill.dataset.bound = "true";
            pill.addEventListener("click", function () {
                const targetCat = this.dataset.category;
                if (!targetCat) return;

                currentPreviewCategory = targetCat;

                if (targetCat !== "__uploaded__" && categorySelect) {
                    categorySelect.value = targetCat;
                }

                document.querySelectorAll(".cat-pill").forEach(function (p) {
                    p.classList.toggle("active", p === pill);
                });

                const badge = document.getElementById("activeCategoryBadge");
                if (badge) {
                    if (targetCat === "__uploaded__") {
                        badge.innerHTML = `<i class="fa-solid fa-cloud-arrow-up" style="color:#16a34a;"></i> Source: <strong>Uploaded Photos (${selectedProductImages.length})</strong>`;
                    } else {
                        badge.innerHTML = `<i class="fa-solid fa-shirt"></i> Current: <strong>${escapeHTML(targetCat)}</strong>`;
                    }
                }

                updateAutoColorPhotoPreview();
                updateVariantPreview();
            });
        });
    }

    bindVariantInputEvents();
    enhanceVariantOptions();
    bindCategoryFilterPills();

    // =====================================================
    // CATEGORY SELECTION CHANGE -> AUTO FETCH MATCHED PHOTO
    // =====================================================

    if (categorySelect) {
        categorySelect.addEventListener("change", function () {
            const chosen = this.value ? this.value.trim() : null;
            if (currentPreviewCategory !== "__uploaded__") {
                currentPreviewCategory = chosen;
            }
            document.querySelectorAll(".cat-pill").forEach(function (p) {
                if (p.dataset.category === "__uploaded__") {
                    p.classList.toggle("active", currentPreviewCategory === "__uploaded__");
                } else {
                    p.classList.toggle("active", currentPreviewCategory !== "__uploaded__" && p.dataset.category && p.dataset.category.toLowerCase() === (chosen || 't-shirts').toLowerCase());
                }
            });
            const badge = document.getElementById("activeCategoryBadge");
            if (badge) {
                if (currentPreviewCategory === "__uploaded__" && selectedProductImages.length > 0) {
                    badge.innerHTML = `<i class="fa-solid fa-cloud-arrow-up" style="color:#16a34a;"></i> Source: <strong>Uploaded Photos (${selectedProductImages.length})</strong>`;
                } else {
                    badge.innerHTML = `<i class="fa-solid fa-shirt"></i> Current: <strong>${escapeHTML(chosen || 'T-Shirts')}</strong>`;
                }
            }
            updateAutoColorPhotoPreview();
            updateVariantPreview();
        });
    }


    // =====================================================
    // BASE PRICE CHANGE
    // =====================================================

    if (priceInput) {

        priceInput.addEventListener(
            "input",
            updateBasePrice
        );

    }


    // =====================================================
    // MAIN STOCK CHANGE -> SYNC TO VARIANT STOCKS
    // =====================================================

    const stockInput = document.getElementById("stock");
    if (stockInput) {
        stockInput.addEventListener("input", function () {
            const mainStockVal = Number(this.value) || 0;
            const colors = getSelectedColors();
            colors.forEach(function (color) {
                if (!window._manuallyEditedColorStocks || !window._manuallyEditedColorStocks[color]) {
                    variantColorStocks[color] = mainStockVal;
                    const input = document.getElementById(`colorStock-${color}`);
                    if (input) {
                        input.value = mainStockVal;
                        input.dispatchEvent(new Event("input"));
                    }
                }
            });
            updateVariantPreview();
        });
    }


    // =====================================================
    // PRODUCT DETAILS & SPECIFICATIONS (AMAZON STYLE)
    // =====================================================

    function collectProductDetailsFromAdminForm() {
        const material = document.getElementById("specMaterial") ? document.getElementById("specMaterial").value.trim() : "";
        const fit = document.getElementById("specFit") ? document.getElementById("specFit").value.trim() : "";
        const sleeve = document.getElementById("specSleeve") ? document.getElementById("specSleeve").value.trim() : "";
        const collar = document.getElementById("specCollar") ? document.getElementById("specCollar").value.trim() : "";
        const length = document.getElementById("specLength") ? document.getElementById("specLength").value.trim() : "";
        const neck = document.getElementById("specNeck") ? document.getElementById("specNeck").value.trim() : "";
        const origin = document.getElementById("specOrigin") ? document.getElementById("specOrigin").value.trim() : "India";

        const highlights = {};
        if (material) highlights["Material composition"] = material;
        if (fit) highlights["Fit type"] = fit;
        if (sleeve) highlights["Sleeve type"] = sleeve;
        if (collar) highlights["Collar style"] = collar;
        if (length) highlights["Length"] = length;
        if (neck) highlights["Neck style"] = neck;
        if (origin) highlights["Country of Origin"] = origin;

        const aboutText = document.getElementById("specAbout") ? document.getElementById("specAbout").value.trim() : "";
        const about = aboutText ? aboutText.split("\n").map(function (l) { return l.trim(); }).filter(Boolean) : [];

        const manufacturer = document.getElementById("specManufacturer") ? document.getElementById("specManufacturer").value.trim() : "";
        const packer = document.getElementById("specPacker") ? document.getElementById("specPacker").value.trim() : "";
        const weight = document.getElementById("specWeight") ? document.getElementById("specWeight").value.trim() : "";
        const dimensions = document.getElementById("specDimensions") ? document.getElementById("specDimensions").value.trim() : "";
        const quantity = document.getElementById("specQuantity") ? document.getElementById("specQuantity").value.trim() : "1 Count";
        const genericName = document.getElementById("specGenericName") ? document.getElementById("specGenericName").value.trim() : "";

        const additional = {};
        if (manufacturer) additional["Manufacturer"] = manufacturer;
        if (packer) additional["Packer"] = packer;
        if (weight) additional["Item Weight"] = weight;
        if (dimensions) additional["Item Dimensions LxWxH"] = dimensions;
        if (quantity) additional["Net Quantity"] = quantity;
        if (genericName) additional["Generic Name"] = genericName;

        // Style specifications
        const style = {};
        const styleFields = [
            { id: "specStyleColour", key: "Colour" },
            { id: "specStyleFitting", key: "Fitting type" },
            { id: "specStyleName", key: "Style Name" },
            { id: "specStyleNeck", key: "Neck Style" },
            { id: "specStyleSleeve", key: "Sleeve Type" },
            { id: "specStyleShirtForm", key: "Shirt Form Type" },
            { id: "specStyleCollar", key: "Collar Style" },
            { id: "specStylePattern", key: "Pattern" },
            { id: "specStyleTopStyle", key: "top-style" },
            { id: "specStyleSeason", key: "Season" },
            { id: "specStyleClosure", key: "Apparel Closure Type" },
            { id: "specStyleCuff", key: "Cuff Style" },
            { id: "specStyleOccasion", key: "Apparel Occasion and Lifestyle" },
            { id: "specStyleBackStyle", key: "Back Style" }
        ];
        styleFields.forEach(function (f) {
            const el = document.getElementById(f.id);
            if (el && el.value.trim()) {
                style[f.key] = el.value.trim();
            }
        });

        // Item details
        const itemDetails = {};
        const itemFields = [
            { id: "specItemBrand", key: "Brand Name" },
            { id: "specItemModel", key: "Model Name" },
            { id: "specItemStyleNumber", key: "Style Number" },
            { id: "specItemUnitCount", key: "Unit Count" },
            { id: "specItemOrigin", key: "Country Of Origin" },
            { id: "specItemGtin", key: "Global Trade Identification Number" },
            { id: "specItemNumberOfItems", key: "number-of-items" },
            { id: "specItemAgeRange", key: "Age Range Description" },
            { id: "specItemTypeName", key: "Item Type Name" },
            { id: "specItemWeight", key: "Item Weight" },
            { id: "specItemManufacturerContact", key: "Manufacturer Contact Information" },
            { id: "specItemManufacturer", key: "Manufacturer" },
            { id: "specItemPackerContact", key: "Packer Contact Information" },
            { id: "specItemPartNumber", key: "Manufacturer Part Number" },
            { id: "specItemRank", key: "Best Sellers Rank" },
            { id: "specItemAsin", key: "ASIN" }
        ];
        itemFields.forEach(function (f) {
            const el = document.getElementById(f.id);
            if (el && el.value.trim()) {
                itemDetails[f.key] = el.value.trim();
            }
        });

        return {
            highlights: highlights,
            about: about,
            additional: additional,
            style: style,
            itemDetails: itemDetails
        };
    }

    function fillProductDetailsIntoAdminForm(details) {
        if (!details) return;
        const h = details.highlights || {};
        const a = details.additional || {};
        const s = details.style || {};
        const it = details.itemDetails || {};

        if (document.getElementById("specMaterial")) document.getElementById("specMaterial").value = h["Material composition"] || "";
        if (document.getElementById("specFit")) document.getElementById("specFit").value = h["Fit type"] || "";
        if (document.getElementById("specSleeve")) document.getElementById("specSleeve").value = h["Sleeve type"] || "";
        if (document.getElementById("specCollar")) document.getElementById("specCollar").value = h["Collar style"] || "";
        if (document.getElementById("specLength")) document.getElementById("specLength").value = h["Length"] || "";
        if (document.getElementById("specNeck")) document.getElementById("specNeck").value = h["Neck style"] || "";
        if (document.getElementById("specOrigin")) document.getElementById("specOrigin").value = h["Country of Origin"] || "India";

        if (document.getElementById("specAbout")) {
            const bullets = Array.isArray(details.about) ? details.about.join("\n") : "";
            document.getElementById("specAbout").value = bullets;
        }

        if (document.getElementById("specManufacturer")) document.getElementById("specManufacturer").value = a["Manufacturer"] || "";
        if (document.getElementById("specPacker")) document.getElementById("specPacker").value = a["Packer"] || "";
        if (document.getElementById("specWeight")) document.getElementById("specWeight").value = a["Item Weight"] || "";
        if (document.getElementById("specDimensions")) document.getElementById("specDimensions").value = a["Item Dimensions LxWxH"] || "";
        if (document.getElementById("specQuantity")) document.getElementById("specQuantity").value = a["Net Quantity"] || "1 Count";
        if (document.getElementById("specGenericName")) document.getElementById("specGenericName").value = a["Generic Name"] || "";

        // Fill Style
        const styleMap = {
            specStyleColour: "Colour",
            specStyleFitting: "Fitting type",
            specStyleName: "Style Name",
            specStyleNeck: "Neck Style",
            specStyleSleeve: "Sleeve Type",
            specStyleShirtForm: "Shirt Form Type",
            specStyleCollar: "Collar Style",
            specStylePattern: "Pattern",
            specStyleTopStyle: "top-style",
            specStyleSeason: "Season",
            specStyleClosure: "Apparel Closure Type",
            specStyleCuff: "Cuff Style",
            specStyleOccasion: "Apparel Occasion and Lifestyle",
            specStyleBackStyle: "Back Style"
        };
        Object.keys(styleMap).forEach(function (id) {
            const el = document.getElementById(id);
            if (el) el.value = s[styleMap[id]] || "";
        });

        // Fill Item Details
        const itemMap = {
            specItemBrand: "Brand Name",
            specItemModel: "Model Name",
            specItemStyleNumber: "Style Number",
            specItemUnitCount: "Unit Count",
            specItemOrigin: "Country Of Origin",
            specItemGtin: "Global Trade Identification Number",
            specItemNumberOfItems: "number-of-items",
            specItemAgeRange: "Age Range Description",
            specItemTypeName: "Item Type Name",
            specItemWeight: "Item Weight",
            specItemManufacturerContact: "Manufacturer Contact Information",
            specItemManufacturer: "Manufacturer",
            specItemPackerContact: "Packer Contact Information",
            specItemPartNumber: "Manufacturer Part Number",
            specItemRank: "Best Sellers Rank",
            specItemAsin: "ASIN"
        };
        Object.keys(itemMap).forEach(function (id) {
            const el = document.getElementById(id);
            if (el) el.value = it[itemMap[id]] || "";
        });

        // Auto-detect Style Colour if not set or empty
        const styleColourEl = document.getElementById("specStyleColour");
        if (styleColourEl && !styleColourEl.value.trim()) {
            const selColors = getSelectedColors();
            if (selColors.length > 0) {
                styleColourEl.value = selColors[0];
            }
        }
    }

    function handleAutoAnalyzeProductDetails(silent) {
        const name = document.getElementById("productName") ? document.getElementById("productName").value.trim() : "";
        const category = document.getElementById("category") ? document.getElementById("category").value.trim() : "";
        const description = document.getElementById("description") ? document.getElementById("description").value.trim() : "";
        const selectedColors = getSelectedColors();
        const primaryColor = selectedColors.length > 0 ? selectedColors[0] : "";

        if (!name && !category) {
            if (!silent) showMessage("Please enter product name or select category first to auto-analyze details.", "error");
            return;
        }

        if (window.ProductSpecsHelper && typeof window.ProductSpecsHelper.analyzeProductDetails === "function") {
            const analyzed = window.ProductSpecsHelper.analyzeProductDetails({
                name: name,
                category: category,
                description: description,
                colors: selectedColors,
                color: primaryColor,
                selectedColor: primaryColor
            });
            fillProductDetailsIntoAdminForm(analyzed);
            if (!silent) showMessage("Product details analyzed and filled successfully!", "success");
        }
    }

    const autoAnalyzeBtn = document.getElementById("autoAnalyzeProductBtn");
    if (autoAnalyzeBtn) {
        autoAnalyzeBtn.addEventListener("click", function () {
            handleAutoAnalyzeProductDetails(false);
        });
    }

    const pNameInput = document.getElementById("productName");
    if (pNameInput) {
        pNameInput.addEventListener("blur", function () {
            const matInput = document.getElementById("specMaterial");
            if (matInput && !matInput.value.trim() && this.value.trim()) {
                handleAutoAnalyzeProductDetails(true);
            }
        });
    }

    // =====================================================
    // SAVE PRODUCT
    // =====================================================

    if (productForm) {

        productForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                console.log(
                    "Product form submitted"
                );


                // =========================================
                // GET VALUES
                // =========================================

                const productData = {

                    name:
                        document
                            .getElementById("productName")
                            .value
                            .trim(),

                    description:
                        document
                            .getElementById("description")
                            .value
                            .trim(),

                    price:
                        getBasePrice(),

                    category:
                        document
                            .getElementById("category")
                            .value,

                    stock:
                        Number(
                            document
                                .getElementById("stock")
                                .value
                        ) || 0

                };


                // =========================================
                // VALIDATION
                // =========================================

                if (!productData.name) {

                    showMessage(
                        "Please enter product name.",
                        "error"
                    );

                    return;

                }


                if (
                    productData.price <= 0
                ) {

                    showMessage(
                        "Please enter a valid base price.",
                        "error"
                    );

                    return;

                }


                if (!productData.category) {

                    showMessage(
                        "Please select a category.",
                        "error"
                    );

                    return;

                }


                if (
                    productData.stock < 0
                ) {

                    showMessage(
                        "Please enter valid stock.",
                        "error"
                    );

                    return;

                }


                // =========================================
                // SELECTED VARIANTS
                // =========================================

                const sizes =
                    getSelectedSizes();

                const colors =
                    getSelectedColors();


                // =========================================
                // BUTTON
                // =========================================

                if (saveProductBtn) {

                    saveProductBtn.disabled =
                        true;

                    saveProductBtn.textContent =
                        "Saving...";

                }


                showMessage(
                    "Saving product..."
                );


                try {

                    // =====================================
                    // CREATE PRODUCT
                    // =====================================

                    const formData =
                        new FormData();


                    formData.append(
                        "name",
                        productData.name
                    );

                    formData.append(
                        "description",
                        productData.description
                    );

                    formData.append(
                        "price",
                        String(productData.price)
                    );

                    formData.append(
                        "category",
                        productData.category
                    );

                    formData.append(
                        "stock",
                        String(productData.stock)
                    );

                    const productDetailsObj = collectProductDetailsFromAdminForm();
                    formData.append(
                        "product_details",
                        JSON.stringify(productDetailsObj)
                    );

                    selectedProductImages.forEach(
                        function (file) {

                            formData.append(
                                "productImages",
                                file
                            );

                        }
                    );

                    if (selectedProductImages.length === 0 && colors.length > 0) {
                        const defaultImg = getVariantImageForColor(colors[0]);
                        if (defaultImg) {
                            formData.append("image", defaultImg);
                        }
                    }


                    selectedVariantImages.forEach(
                        function (file) {

                            formData.append(
                                "variantImages",
                                file
                            );

                        }
                    );


                    const response =
                        await fetch(
                            "/api/products",
                            {
                                method: "POST",
                                body: formData
                            }
                        );


                    const result =
                        await response.json();


                    console.log(
                        "Product API Response:",
                        result
                    );


                    if (!response.ok) {

                        throw new Error(
                            result.message ||
                            "Failed to create product."
                        );

                    }


                    // =====================================
                    // GET PRODUCT ID
                    // =====================================

                    currentProductId =
                        result.id ||
                        result.productId ||
                        result.product?.id ||
                        result.insertId;


                    if (!currentProductId) {

                        throw new Error(
                            "Product created, but product ID was not returned by API."
                        );

                    }


                    console.log(
                        "Created Product ID:",
                        currentProductId
                    );


                    // =====================================
                    // SAVE VARIANTS WITH MATCHED PHOTO URLS
                    // =====================================

                    let uploadedImageUrls = [];
                    const rawProdImage = result.product?.image || result.image;
                    if (rawProdImage) {
                        try {
                            const parsed = typeof rawProdImage === "string" ? JSON.parse(rawProdImage) : rawProdImage;
                            if (Array.isArray(parsed)) uploadedImageUrls = parsed;
                            else if (typeof parsed === "string") uploadedImageUrls = [parsed];
                        } catch (e) {
                            if (typeof rawProdImage === "string") {
                                uploadedImageUrls = [rawProdImage];
                            }
                        }
                    }

                    // Map each detected color to its saved uploaded image URL
                    const uploadedPathsByColor = {};
                    selectedProductImages.forEach(function (file, idx) {
                        const col = file._detectedColor;
                        if (col && uploadedImageUrls[idx]) {
                            uploadedPathsByColor[col] = uploadedImageUrls[idx];
                            uploadedPathsByColor[col.toLowerCase()] = uploadedImageUrls[idx];
                        }
                    });

                    // Ensure all uploaded photo colors are included in colors list
                    selectedProductImages.forEach(function (file) {
                        if (file._detectedColor && !colors.some(function (c) { return c.toLowerCase() === file._detectedColor.toLowerCase(); })) {
                            colors.push(file._detectedColor);
                        }
                    });

                    if (
                        colors.length > 0
                    ) {

                        await saveVariants(
                            currentProductId,
                            uploadedPathsByColor
                        );

                        // Ensure product.image in database strictly contains only the auto-matched photos
                        const matchedImageUrls = [];
                        const seenUrls = new Set();
                        colors.forEach(function (color) {
                            const img = uploadedPathsByColor[color] || uploadedPathsByColor[color.toLowerCase()];
                            if (img && !seenUrls.has(img)) {
                                seenUrls.add(img);
                                matchedImageUrls.push(img);
                            }
                        });

                        if (matchedImageUrls.length > 0) {
                            try {
                                await fetch(`/api/products/${currentProductId}`, {
                                    method: "PUT",
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                    body: JSON.stringify({
                                        name: productData.name,
                                        description: productData.description,
                                        price: productData.price,
                                        category: productData.category,
                                        stock: productData.stock,
                                        product_details: JSON.stringify(productDetailsObj),
                                        image: matchedImageUrls.length === 1 ? matchedImageUrls[0] : JSON.stringify(matchedImageUrls)
                                    })
                                });
                            } catch (e) {
                                console.warn("Could not sync product images to auto-matched variant images:", e);
                            }
                        }

                    }


                    // =====================================
                    // SUCCESS
                    // =====================================

                    showMessage(
                        "Product and variants saved successfully.",
                        "success"
                    );


                    alert(
                        "Product and variants saved successfully!"
                    );


                    // =====================================
                    // RESET
                    // =====================================

                    resetForm();


                    // =====================================
                    // RELOAD PRODUCTS
                    // =====================================

                    await loadProducts();

                }
                catch (error) {

                    console.error(
                        "SAVE PRODUCT ERROR:",
                        error
                    );


                    showMessage(
                        error.message ||
                        "Failed to save product.",
                        "error"
                    );

                }
                finally {

                    if (saveProductBtn) {

                        saveProductBtn.disabled =
                            false;

                        saveProductBtn.textContent =
                            "Save Product";

                    }

                }

            }
        );

    }


    // =====================================================
    // SAVE VARIANTS
    // =====================================================

    async function saveVariants(productId, uploadedPathsByColor) {

        const rawSizes =
            getSelectedSizes();

        const sizes =
            rawSizes.length > 0 ? rawSizes : ["Free Size"];

        let colors =
            getSelectedColors();

        if (selectedProductImages && selectedProductImages.length > 0) {
            selectedProductImages.forEach(function (f) {
                if (f._detectedColor && !colors.some(function (c) { return c.toLowerCase() === f._detectedColor.toLowerCase(); })) {
                    colors.push(f._detectedColor);
                }
            });
        }


        if (
            colors.length === 0
        ) {

            console.log(
                "No color variants selected."
            );

            return;

        }


        // =================================================
        // SIZE × COLOR
        // =================================================

        for (
            const size of sizes
        ) {

            for (
                const color of colors
            ) {

                const extraPrice =
                    getSizeExtraPrice(size);


                const finalPrice =
                    getBasePrice() +
                    extraPrice;


                const colorStock =
                    getVariantStockForColor(color);


                console.log(
                    "Saving variant:",
                    {
                        product_id: productId,
                        size: size,
                        color: color,
                        extra_price: extraPrice,
                        final_price: finalPrice,
                        stock: colorStock
                    }
                );


                const formData =
                    new FormData();


                formData.append(
                    "product_id",
                    String(productId)
                );

                formData.append(
                    "size",
                    size
                );

                formData.append(
                    "color",
                    color
                );

                formData.append(
                    "extra_price",
                    String(extraPrice)
                );

                formData.append(
                    "stock",
                    String(colorStock)
                );


                let matchedVariantImage = null;
                const lowerCol = String(color).trim().toLowerCase();

                // 1. Check if an uploaded product image was assigned to this color
                if (uploadedPathsByColor && (uploadedPathsByColor[color] || uploadedPathsByColor[lowerCol])) {
                    matchedVariantImage = uploadedPathsByColor[color] || uploadedPathsByColor[lowerCol];
                }

                // 2. Check if a dedicated variant file exists
                const variantImageFile =
                    getVariantImageFileForColor(color);

                if (matchedVariantImage) {
                    formData.append(
                        "image",
                        matchedVariantImage
                    );
                } else if (
                    variantImageFile
                ) {

                    formData.append(
                        "image",
                        variantImageFile
                    );

                } else {

                    const autoMatchedImg =
                        getVariantImageForColor(color);

                    if (autoMatchedImg) {

                        formData.append(
                            "image",
                            autoMatchedImg
                        );

                    }

                }


                const response =
                    await fetch(
                        "/api/variants",
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        `Failed to save variant ${size} - ${color}.`
                    );

                }


                console.log(
                    `Variant saved: ${size} - ${color}`,
                    result
                );

            }

        }

    }


    // =====================================================
    // LOAD PRODUCTS
    // =====================================================

    async function loadProducts() {

        if (!productsContainer) {
            return;
        }


        try {

            productsContainer.innerHTML = `
                <p class="empty-message">
                    Loading products...
                </p>
            `;


            const response =
                await fetch(
                    "/api/products"
                );


            const result =
                await response.json();


            console.log(
                "Products API Response:",
                result
            );


            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "Failed to load products."
                );

            }


            const products =
                Array.isArray(result)
                    ? result
                    : result.products || [];


            renderProducts(products);

        }
        catch (error) {

            console.error(
                "LOAD PRODUCTS ERROR:",
                error
            );


            productsContainer.innerHTML = `
                <p class="empty-message">
                    Failed to load products.
                </p>
            `;

        }

    }


    // =====================================================
    // RENDER PRODUCTS
    // =====================================================

    function renderProducts(products) {

        if (!productsContainer) {
            return;
        }


        productsContainer.innerHTML = "";


        if (!products.length) {

            productsContainer.innerHTML = `
                <p class="empty-message">
                    No products found.
                </p>
            `;

            return;

        }


        products.forEach(
            function (product) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "product-card";


                let image =
                    product.image ||
                    "/images/tshirt1.jpg";

                if (typeof image === "string") {
                    const trimmed = image.trim();
                    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
                        try {
                            const parsed = JSON.parse(trimmed);
                            if (Array.isArray(parsed) && parsed.length > 0) {
                                image = String(parsed[0] || "").trim();
                            }
                        } catch (e) {}
                    } else {
                        image = trimmed;
                    }
                } else if (Array.isArray(image) && image.length > 0) {
                    image = String(image[0] || "").trim();
                }

                if (!image) {
                    image = "/images/tshirt1.jpg";
                }

                if (
                    !image.startsWith("/") &&
                    !image.startsWith("http://") &&
                    !image.startsWith("https://") &&
                    !image.startsWith("data:")
                ) {
                    if (image.startsWith("images/")) {
                        image = `/${image}`;
                    } else {
                        image = `/images/${image}`;
                    }
                }


                const productName =
                    escapeHTML(
                        product.name ||
                        "Unnamed Product"
                    );


                const price =
                    Number(
                        product.price || 0
                    );


                const stock =
                    Number(
                        product.stock || 0
                    );

                const isOutOfStock = stock <= 0;

                // Build variants breakdown if product has variants
                let variantsHtml = "";
                if (Array.isArray(product.variants) && product.variants.length > 0) {
                    const uniqueColors = {};
                    product.variants.forEach(function (v) {
                        if (v.color && uniqueColors[v.color] === undefined) {
                            uniqueColors[v.color] = Number(v.stock) || 0;
                        }
                    });
                    const colorBadges = Object.keys(uniqueColors).map(function (col) {
                        const s = uniqueColors[col];
                        const oos = s <= 0;
                        return `<span class="variant-stock-tag" style="display:inline-block; font-size:11px; padding:2px 7px; border-radius:4px; margin:2px; ${oos ? 'background:#fee2e2; color:#dc2626; border:1px solid #fca5a5;' : 'background:#f1f5f9; color:#334155; border:1px solid #cbd5e1;'}">
                            <strong>${escapeHTML(col)}:</strong> ${s} ${oos ? '<b style="color:#ef4444;">(Out of Stock)</b>' : ''}
                        </span>`;
                    }).join(" ");
                    variantsHtml = `<div class="admin-product-variants" style="margin-top:8px; border-top:1px dashed #e2e8f0; padding-top:6px;">
                        <small style="display:block; color:#64748b; font-size:10px; font-weight:700; text-transform:uppercase; margin-bottom:3px;">Variant Stocks:</small>
                        ${colorBadges}
                    </div>`;
                }

                card.innerHTML = `
                    <div style="position: relative;" class="product-card-img-wrap">
                        <img
                            src="${image}"
                            alt="${productName}"
                            class="product-thumb-clickable"
                            style="cursor: pointer;"
                            title="Click photo to open in AI Studio Packshot"
                            onerror="
                                this.src='/images/tshirt1.jpg'
                            "
                        >
                        <button type="button" class="card-quick-ai-btn" style="position: absolute; bottom: 8px; right: 8px; background: rgba(124, 58, 237, 0.9); color: white; border: none; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; backdrop-filter: blur(4px); box-shadow: 0 2px 5px rgba(0,0,0,0.2);" title="Open in AI Studio Packshot">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> AI Studio
                        </button>
                        ${isOutOfStock ? `<span style="position: absolute; top: 8px; right: 8px; background: #dc2626; color: white; padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700;">Out of Stock</span>` : ''}
                    </div>

                    <h3 style="margin-top:8px;">
                        ${productName}
                    </h3>

                    <p style="font-weight: 700; color: #1e293b; margin:4px 0;">
                        ₹${price.toFixed(2)}
                    </p>

                    <p style="display:flex; align-items:center; gap:6px; margin:4px 0;">
                        <span>Total: <strong>${stock}</strong></span>
                        <span class="stock-badge ${isOutOfStock ? 'out-of-stock' : 'in-stock'}" style="${isOutOfStock ? 'color:#dc2626; background:#fee2e2;' : 'color:#166534; background:#dcfce7;'} font-size:11px; font-weight:700; padding:2px 8px; border-radius:9999px;">
                            ${isOutOfStock ? '✕ Out of Stock' : '✓ In Stock'}
                        </span>
                    </p>

                    ${variantsHtml}
                `;

                // Clicking product photo opens AI Studio Packshot
                const cardImg = card.querySelector(".product-card-img-wrap img");
                const cardAiBtn = card.querySelector(".card-quick-ai-btn");
                function openThisInStudio(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    openAiStudioModal(image);
                }
                if (cardImg) cardImg.addEventListener("click", openThisInStudio);
                if (cardAiBtn) cardAiBtn.addEventListener("click", openThisInStudio);

                productsContainer.appendChild(
                    card
                );

            }
        );

    }


    // =====================================================
    // ESCAPE HTML
    // =====================================================

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    // =====================================================
    // RESET FORM
    // =====================================================

    function resetForm() {

        if (productForm) {

            productForm.reset();

        }


        selectedProductImages = [];

        selectedVariantImages = [];

        variantImageDataByColor = {};

        variantImageFilesByColor = {};

        variantColorStocks = {};

        currentProductId = null;


        if (imagePreview) {

            imagePreview.innerHTML = "";

        }


        if (variantImagePreview) {

            variantImagePreview.innerHTML = "";

        }


        document
            .querySelectorAll(
                'input[name="sizes"], input[name="colors"]'
            )
            .forEach(function (input) {

                input.checked = false;

            });


        if (priceInput) {

            priceInput.value = "";

        }


        if (basePriceDisplay) {

            basePriceDisplay.textContent =
                "0.00";

        }


        if (sizePriceContainer) {

            sizePriceContainer.innerHTML = `
                <p class="empty-message">
                    Select a size to set its extra price.
                </p>
            `;

        }


        filterColorOptionsToMatched([]);
        updateColorStockControls();
        updateAutoColorPhotoPreview();
        updateVariantPreview();


        showMessage("");

    }


    // =====================================================
    // RESET BUTTON
    // =====================================================

    if (resetBtn) {

        resetBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                resetForm();

            }
        );

    }


    // =====================================================
    // REFRESH PRODUCTS
    // =====================================================

    if (refreshProductsBtn) {

        refreshProductsBtn.addEventListener(
            "click",
            function () {

                loadProducts();

            }
        );

    }


    // =====================================================
    // MENU BUTTON
    // =====================================================

    if (menuBtn) {

        menuBtn.addEventListener(
            "click",
            function () {

                if (sidebar) {

                    sidebar.classList.toggle(
                        "open"
                    );

                }

            }
        );

    }


    // =====================================================
    // PRODUCTS SUBMENU
    // =====================================================

    if (
        productsToggle &&
        productsMenu
    ) {

        productsToggle.addEventListener(
            "click",
            function () {

                productsMenu.classList.toggle(
                    "open"
                );

            }
        );

    }


    // =====================================================
    // LOGOUT
    // =====================================================

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function () {

                localStorage.removeItem(
                    "adminToken"
                );

                localStorage.removeItem(
                    "admin"
                );


                window.location.href =
                    "/login.html";

            }
        );

    }


    // =====================================================
    // AI PRODUCT STUDIO PACKSHOT GENERATOR
    // =====================================================

    let currentAiSourceFile = null;
    let currentAiSourceDataUrl = null;
    let currentAiSelectedPreset = "luxury-dark";
    let currentAiResultUrl = null;
    let currentAiResultFilename = null;
    let currentAiCutoutUrl = null;
    let currentAiCutoutFilename = null;

    const AI_PRESET_PROMPTS = {
        "luxury-dark": "Luxury black studio background with soft lighting",
        "studio-white": "Clean white studio background, seamless floor sweep with soft contact shadow",
        "concrete-minimal": "Minimalist concrete loft studio with soft directional daylight",
        "warm-wood": "Warm oak wooden table surface with soft studio ambient lighting",
        "neon-cyber": "Moody dark studio background with cyan and magenta neon glow lighting",
        "pastel-blush": "Soft pastel blush editorial fashion studio background with diffused warm light",
        "sunlit-outdoor": "Sunlit golden hour studio background with warm sunlight glow",
        "velvet-luxury": "Royal emerald velvet luxury studio background with soft spotlight",
        "studio-podium": "Minimalist round studio podium pedestal with soft neutral lighting",
        "marble-table": "Luxury white marble countertop with soft ambient lighting",
        "studio-grey": "Modern grey gradient studio background with soft overhead lighting",
        "warm-ambient": "Warm golden ambient studio background with soft commercial lighting",
        "cinematic-sky": "Dramatic cinematic cloudy sky background with atmospheric mist, soft smoke and backlit rim glow"
    };

    const aiDownloadStudioBtn = document.getElementById("aiDownloadStudioBtn");
    const aiDownloadCutoutBtn = document.getElementById("aiDownloadCutoutBtn");
    const aiOverlayStepText = document.getElementById("aiOverlayStepText");
    const aiOverlayDetailText = document.getElementById("aiOverlayDetailText");
    const aiStudioMetaText = document.getElementById("aiStudioMetaText");
    const aiProgressBar = document.getElementById("aiProgressBar");

    function openAiStudioModal(initialFile) {
        if (!aiStudioModal) return;

        currentAiResultUrl = null;
        currentAiResultFilename = null;
        currentAiCutoutUrl = null;
        currentAiCutoutFilename = null;

        if (aiResultPreviewImg) aiResultPreviewImg.src = "";
        if (aiDownloadCutoutBtn) aiDownloadCutoutBtn.style.display = "none";
        if (aiDownloadStudioBtn) aiDownloadStudioBtn.style.display = "none";
        if (aiGeneratingOverlay) aiGeneratingOverlay.style.display = "none";
        if (aiStatusMessage) aiStatusMessage.style.display = "none";
        if (aiApplyToProductBtn) aiApplyToProductBtn.style.display = "none";

        if (aiCustomPrompt && (!aiCustomPrompt.value || aiCustomPrompt.value.trim() === "")) {
            aiCustomPrompt.value = "Luxury black studio background with soft lighting";
        }

        if (aiDressColorChips) {
            aiDressColorChips.querySelectorAll(".ai-dress-chip").forEach(function (c) {
                c.classList.remove("active");
            });
            const origChip = aiDressColorChips.querySelector('.ai-dress-chip[data-color="original"]');
            if (origChip) origChip.classList.add("active");
            currentSelectedDressColor = null;
        }

        if (startAiGenerateBtn) {
            startAiGenerateBtn.disabled = true;
            startAiGenerateBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate AI Product Image';
        }

        // Render existing photos list if available
        if (aiExistingPhotosRow && aiExistingPhotosList) {
            if (selectedProductImages && selectedProductImages.length > 0) {
                aiExistingPhotosRow.style.display = "block";
                aiExistingPhotosList.innerHTML = "";

                selectedProductImages.forEach(function (f, idx) {
                    const thumb = document.createElement("div");
                    thumb.className = "ai-existing-photo-thumb" + (f === initialFile ? " selected" : "");
                    const img = document.createElement("img");
                    img.src = f._dataUrl || URL.createObjectURL(f);
                    thumb.appendChild(img);

                    thumb.addEventListener("click", function () {
                        aiExistingPhotosList.querySelectorAll(".ai-existing-photo-thumb").forEach(function (t) {
                            t.classList.remove("selected");
                        });
                        thumb.classList.add("selected");
                        setAiSourceFile(f);
                    });

                    aiExistingPhotosList.appendChild(thumb);
                });
            } else {
                aiExistingPhotosRow.style.display = "none";
            }
        }

        if (initialFile) {
            setAiSourceFile(initialFile);
        } else if (selectedProductImages && selectedProductImages.length > 0) {
            setAiSourceFile(selectedProductImages[0]);
            if (aiExistingPhotosList) {
                const firstThumb = aiExistingPhotosList.querySelector(".ai-existing-photo-thumb");
                if (firstThumb) firstThumb.classList.add("selected");
            }
        } else {
            if (aiPreviewComparisonArea) aiPreviewComparisonArea.style.display = "none";
            if (aiSourcePreviewImg) aiSourcePreviewImg.src = "";
        }

        aiStudioModal.style.display = "flex";
    }

    function closeAiStudioModal() {
        if (!aiStudioModal) return;
        aiStudioModal.style.display = "none";
    }

    function setAiSourceFile(file) {
        currentAiSourceFile = file;

        function applySourceDataUrl(url) {
            currentAiSourceDataUrl = url;
            if (aiSourcePreviewImg) {
                aiSourcePreviewImg.src = url;
            }
            if (aiPreviewComparisonArea) {
                aiPreviewComparisonArea.style.display = "block";
            }
            if (startAiGenerateBtn) {
                startAiGenerateBtn.disabled = false;
            }
        }

        if (file._dataUrl) {
            applySourceDataUrl(file._dataUrl);
        } else {
            const reader = new FileReader();
            reader.onload = function (e) {
                file._dataUrl = e.target.result;
                applySourceDataUrl(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    // Modal open / close listeners
    if (openAiStudioBtn) {
        openAiStudioBtn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            openAiStudioModal();
        });
    }

    if (closeAiStudioModalBtn) {
        closeAiStudioModalBtn.addEventListener("click", closeAiStudioModal);
    }

    if (aiModalCloseBottomBtn) {
        aiModalCloseBottomBtn.addEventListener("click", closeAiStudioModal);
    }

    if (aiStudioModal) {
        aiStudioModal.addEventListener("click", function (e) {
            if (e.target === aiStudioModal) {
                closeAiStudioModal();
            }
        });
    }

    // Dropzone listeners
    if (aiUploadDropZone && aiSourceFileInput) {
        aiUploadDropZone.addEventListener("click", function () {
            aiSourceFileInput.click();
        });

        aiSourceFileInput.addEventListener("change", function () {
            if (this.files && this.files[0]) {
                setAiSourceFile(this.files[0]);
                if (aiExistingPhotosList) {
                    aiExistingPhotosList.querySelectorAll(".ai-existing-photo-thumb").forEach(function (t) {
                        t.classList.remove("selected");
                    });
                }
            }
        });

        aiUploadDropZone.addEventListener("dragover", function (e) {
            e.preventDefault();
            aiUploadDropZone.classList.add("dragover");
        });

        aiUploadDropZone.addEventListener("dragleave", function () {
            aiUploadDropZone.classList.remove("dragover");
        });

        aiUploadDropZone.addEventListener("drop", function (e) {
            e.preventDefault();
            aiUploadDropZone.classList.remove("dragover");
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
                setAiSourceFile(e.dataTransfer.files[0]);
            }
        });
    }

    // Preset button clicks
    if (aiStylePresets) {
        aiStylePresets.querySelectorAll(".ai-style-preset").forEach(function (btn) {
            btn.addEventListener("click", function () {
                aiStylePresets.querySelectorAll(".ai-style-preset").forEach(function (b) {
                    b.classList.remove("active");
                });
                btn.classList.add("active");
                currentAiSelectedPreset = btn.dataset.preset || "studio-white";
                if (aiCustomPrompt && AI_PRESET_PROMPTS[currentAiSelectedPreset]) {
                    const basePrompt = AI_PRESET_PROMPTS[currentAiSelectedPreset];
                    if (currentSelectedDressColor) {
                        aiCustomPrompt.value = `${basePrompt}, change dress colour to ${currentSelectedDressColor}`;
                    } else {
                        aiCustomPrompt.value = basePrompt;
                    }
                }
            });
        });
    }

    // Dress / Apparel Color Quick Chips
    const aiDressColorChips = document.getElementById("aiDressColorChips");
    let currentSelectedDressColor = null;

    if (aiDressColorChips) {
        aiDressColorChips.querySelectorAll(".ai-dress-chip").forEach(function (chip) {
            chip.addEventListener("click", function () {
                aiDressColorChips.querySelectorAll(".ai-dress-chip").forEach(function (c) {
                    c.classList.remove("active");
                });
                chip.classList.add("active");

                const colorVal = chip.dataset.color;
                if (aiCustomPrompt) {
                    let curText = aiCustomPrompt.value.trim();
                    // Strip prior dress recoloring command from prompt
                    curText = curText.replace(/,?\s*(?:change|make|turn|set|recolor)?\s*(?:the\s*)?(?:dress|shirt|tshirt|t-shirt|top|cloth|clothes|clothing|outfit|suit|jacket|coat|garment|apparel|polo)?\s*(?:colou?r)?\s*(?:to|into|as|in|:)?\s*[a-z\s]+$/i, "").trim();
                    curText = curText.replace(/,\s*$/, "").trim();

                    if (!curText) {
                        curText = AI_PRESET_PROMPTS[currentAiSelectedPreset] || "Luxury black studio background with soft lighting";
                    }

                    if (colorVal && colorVal !== "original") {
                        currentSelectedDressColor = colorVal;
                        aiCustomPrompt.value = `${curText}, change dress colour to ${colorVal}`;
                    } else {
                        currentSelectedDressColor = null;
                        aiCustomPrompt.value = curText;
                    }
                }
            });
        });
    }

    // Sync prompt text edits with color chips
    if (aiCustomPrompt) {
        aiCustomPrompt.addEventListener("input", function () {
            const val = this.value.toLowerCase();
            if (aiDressColorChips) {
                let matched = false;
                aiDressColorChips.querySelectorAll(".ai-dress-chip").forEach(function (chip) {
                    const c = chip.dataset.color;
                    if (c && c !== "original") {
                        const regex = new RegExp(`\\b(?:dress|shirt|tshirt|cloth|jacket|outfit)?\\s*(?:colour|color)?\\s*(?:to\\s+)?${c}\\b|\\b${c}\\s+(?:dress|shirt|jacket|outfit)\\b`, "i");
                        if (regex.test(val)) {
                            chip.classList.add("active");
                            currentSelectedDressColor = c;
                            matched = true;
                        } else {
                            chip.classList.remove("active");
                        }
                    } else {
                        chip.classList.remove("active");
                    }
                });
                if (!matched) {
                    currentSelectedDressColor = null;
                    const origChip = aiDressColorChips.querySelector('.ai-dress-chip[data-color="original"]');
                    if (origChip) origChip.classList.add("active");
                }
            }
        });
    }

    // =====================================================
    // BACKGROUND EXTRACTION & STUDIO REPLACEMENT ENGINE
    // =====================================================

    const aiBgSensitivity = document.getElementById("aiBgSensitivity");
    const aiApiKeyInput = document.getElementById("aiApiKeyInput");
    const saveAiApiKeyBtn = document.getElementById("saveAiApiKeyBtn");

    if (aiApiKeyInput) {
        const storedKey = localStorage.getItem("mystore_gemini_api_key");
        if (storedKey) aiApiKeyInput.value = storedKey;
    }

    if (saveAiApiKeyBtn && aiApiKeyInput) {
        saveAiApiKeyBtn.addEventListener("click", function (e) {
            e.preventDefault();
            const val = aiApiKeyInput.value.trim();
            localStorage.setItem("mystore_gemini_api_key", val);
            alert(val ? "✨ Gemini API Key saved in browser!" : "API Key cleared.");
        });
    }

    function extractProductAndChangeBackground(sourceImg, preset, sensitivity) {
        return new Promise(function (resolve) {
            try {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                const W = 1000;
                const H = 1000;
                canvas.width = W;
                canvas.height = H;

                // 1. Draw source image on a processing canvas
                const origW = sourceImg.naturalWidth || sourceImg.width || 500;
                const origH = sourceImg.naturalHeight || sourceImg.height || 500;

                const maxDim = 700;
                const pScale = Math.min(1, maxDim / Math.max(origW, origH));
                const pW = Math.max(10, Math.round(origW * pScale));
                const pH = Math.max(10, Math.round(origH * pScale));

                const procCanvas = document.createElement("canvas");
                procCanvas.width = pW;
                procCanvas.height = pH;
                const procCtx = procCanvas.getContext("2d", { willReadFrequently: true });
                procCtx.drawImage(sourceImg, 0, 0, pW, pH);

                const imgDataObj = procCtx.getImageData(0, 0, pW, pH);
                const data = imgDataObj.data;

                // 2. Identify Subject Silhouettes via Per-Row Adaptive Ray-Casting
                // This guarantees that white clothes, bottles, shoes, jeans, and products are NEVER erased!
                const leftBound = new Int32Array(pH).fill(-1);
                const rightBound = new Int32Array(pH).fill(-1);

                const sampleMargin = Math.min(4, Math.max(2, Math.floor(pW * 0.02)));

                let threshBriDiff = 8;
                let threshDarkDiff = 25;
                let threshMarginDist = 14;
                if (sensitivity === "fine") {
                    threshBriDiff = 6;
                    threshDarkDiff = 20;
                    threshMarginDist = 11;
                } else if (sensitivity === "deep") {
                    threshBriDiff = 12;
                    threshDarkDiff = 32;
                    threshMarginDist = 18;
                }

                for (let y = 0; y < pH; y++) {
                    // Left baseline for row y
                    let lR = 0, lG = 0, lB = 0;
                    for (let x = 0; x < sampleMargin; x++) {
                        const idx = (y * pW + x) * 4;
                        lR += data[idx]; lG += data[idx + 1]; lB += data[idx + 2];
                    }
                    lR /= sampleMargin; lG /= sampleMargin; lB /= sampleMargin;
                    const lBri = (lR + lG + lB) / 3;

                    // Right baseline for row y
                    let rR = 0, rG = 0, rB = 0;
                    for (let x = pW - sampleMargin; x < pW; x++) {
                        const idx = (y * pW + x) * 4;
                        rR += data[idx]; rG += data[idx + 1]; rB += data[idx + 2];
                    }
                    rR /= sampleMargin; rG /= sampleMargin; rB /= sampleMargin;
                    const rBri = (rR + rG + rB) / 3;

                    // Trace left to right
                    for (let x = 2; x < Math.floor(pW * 0.78); x++) {
                        const idx = (y * pW + x) * 4;
                        const r = data[idx], g = data[idx + 1], b = data[idx + 2];
                        const nr = data[idx + 4], ng = data[idx + 5], nb = data[idx + 6];
                        const pr = data[idx - 4], pg = data[idx - 3], pb = data[idx - 2];

                        const gx = Math.hypot(nr - pr, ng - pg, nb - pb) / 2;
                        const sat = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b));
                        const bri = (r + g + b) / 3;
                        const isBright = bri > Math.max(lBri + threshBriDiff, 228);
                        const isDark = bri < lBri - threshDarkDiff;
                        const dMargin = Math.hypot(r - lR, g - lG, b - lB);

                        if (gx > 7 || sat > 8 || isBright || isDark || dMargin > threshMarginDist) {
                            leftBound[y] = x;
                            break;
                        }
                    }

                    // Trace right to left
                    for (let x = pW - 3; x > Math.floor(pW * 0.22); x--) {
                        const idx = (y * pW + x) * 4;
                        const r = data[idx], g = data[idx + 1], b = data[idx + 2];
                        const nr = data[idx + 4], ng = data[idx + 5], nb = data[idx + 6];
                        const pr = data[idx - 4], pg = data[idx - 3], pb = data[idx - 2];

                        const gx = Math.hypot(nr - pr, ng - pg, nb - pb) / 2;
                        const sat = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b));
                        const bri = (r + g + b) / 3;
                        const isBright = bri > Math.max(rBri + threshBriDiff, 226);
                        const isDark = bri < rBri - (threshDarkDiff + 10);

                        if (gx > 8 || sat > 8 || isBright || isDark) {
                            rightBound[y] = x;
                            break;
                        }
                    }

                    if (leftBound[y] !== -1 && rightBound[y] !== -1) {
                        if (rightBound[y] - leftBound[y] < 12) {
                            leftBound[y] = -1;
                            rightBound[y] = -1;
                        }
                    } else {
                        leftBound[y] = -1;
                        rightBound[y] = -1;
                    }
                }

                // Morphological filter: fill single missing rows, remove sharp single-row spikes
                for (let pass = 0; pass < 2; pass++) {
                    for (let y = 1; y < pH - 1; y++) {
                        if (leftBound[y] === -1 && leftBound[y - 1] !== -1 && leftBound[y + 1] !== -1) {
                            leftBound[y] = Math.round((leftBound[y - 1] + leftBound[y + 1]) / 2);
                            rightBound[y] = Math.round((rightBound[y - 1] + rightBound[y + 1]) / 2);
                        }
                        if (leftBound[y] !== -1 && leftBound[y - 1] !== -1 && leftBound[y + 1] !== -1) {
                            const medL = (leftBound[y - 1] + leftBound[y + 1]) / 2;
                            if (Math.abs(leftBound[y] - medL) > 8) {
                                leftBound[y] = Math.round(medL);
                            }
                            const medR = (rightBound[y - 1] + rightBound[y + 1]) / 2;
                            if (Math.abs(rightBound[y] - medR) > 8) {
                                rightBound[y] = Math.round(medR);
                            }
                        }
                    }
                }

                // 3. Mark Subject Bounding Box and Alpha Mask
                let minX = pW, maxX = 0, minY = pH, maxY = 0;
                let foregroundPixelCount = 0;

                for (let y = 0; y < pH; y++) {
                    const lb = leftBound[y];
                    const rb = rightBound[y];

                    for (let x = 0; x < pW; x++) {
                        const idx = (y * pW + x) * 4;

                        if (lb !== -1 && rb !== -1 && x >= lb && x <= rb) {
                            // Inside PROTECTED subject zone (clothing, white jacket, skin, jeans, etc.)
                            const distToEdge = Math.min(x - lb, rb - x);
                            if (distToEdge === 0) {
                                data[idx + 3] = Math.round(data[idx + 3] * 0.50);
                            } else if (distToEdge === 1) {
                                data[idx + 3] = Math.round(data[idx + 3] * 0.80);
                            } else {
                                data[idx + 3] = 255; // 100% solid, fully preserved
                            }

                            if (data[idx + 3] > 60) {
                                if (x < minX) minX = x;
                                if (x > maxX) maxX = x;
                                if (y < minY) minY = y;
                                if (y > maxY) maxY = y;
                                foregroundPixelCount++;
                            }
                        } else {
                            // Outside subject zone: original background completely removed!
                            data[idx + 3] = 0;
                        }
                    }
                }

                if (foregroundPixelCount < (pW * pH * 0.02) || maxX <= minX || maxY <= minY) {
                    minX = Math.round(pW * 0.1);
                    maxX = Math.round(pW * 0.9);
                    minY = Math.round(pH * 0.05);
                    maxY = Math.round(pH * 0.95);
                    for (let i = 3; i < data.length; i += 4) {
                        data[i] = 255;
                    }
                }

                procCtx.putImageData(imgDataObj, 0, 0);

                // 5. Target Centering on 1000x1000 Canvas
                const prodW = maxX - minX;
                const prodH = maxY - minY;
                const maxTargetW = 720;
                const maxTargetH = 720;
                const scale = Math.min(maxTargetW / prodW, maxTargetH / prodH);
                const targetW = Math.round(prodW * scale);
                const targetH = Math.round(prodH * scale);
                const targetX = Math.round((W - targetW) / 2);
                const targetY = Math.round((H - targetH) / 2 + 25);
                const productBottom = targetY + targetH;

                // 6. Paint BRAND NEW STUDIO BACKGROUND
                if (preset === "transparent-cutout") {
                    ctx.clearRect(0, 0, W, H);
                } else if (preset === "marble-table") {
                    const wallGrad = ctx.createLinearGradient(0, 0, 0, productBottom - 30);
                    wallGrad.addColorStop(0, "#f8fafc");
                    wallGrad.addColorStop(1, "#e2e8f0");
                    ctx.fillStyle = wallGrad;
                    ctx.fillRect(0, 0, W, productBottom - 30);

                    const marbleGrad = ctx.createLinearGradient(0, productBottom - 30, 0, H);
                    marbleGrad.addColorStop(0, "#ffffff");
                    marbleGrad.addColorStop(0.3, "#f1f5f9");
                    marbleGrad.addColorStop(0.7, "#e2e8f0");
                    marbleGrad.addColorStop(1, "#cbd5e1");
                    ctx.fillStyle = marbleGrad;
                    ctx.fillRect(0, productBottom - 30, W, H - (productBottom - 30));

                    ctx.save();
                    ctx.strokeStyle = "rgba(148, 163, 184, 0.22)";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(60, productBottom + 20);
                    ctx.bezierCurveTo(280, productBottom + 60, 580, productBottom - 10, 940, productBottom + 80);
                    ctx.stroke();
                    ctx.restore();

                    ctx.beginPath();
                    ctx.ellipse(W / 2, productBottom + 4, targetW * 0.44, 15, 0, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(15, 23, 42, 0.16)";
                    ctx.filter = "blur(10px)";
                    ctx.fill();
                    ctx.filter = "none";

                } else if (preset === "studio-podium") {
                    const bgGrad = ctx.createRadialGradient(W / 2, 380, 80, W / 2, H / 2, 700);
                    bgGrad.addColorStop(0, "#ffffff");
                    bgGrad.addColorStop(0.5, "#f3f4f8");
                    bgGrad.addColorStop(1, "#e2e6ea");
                    ctx.fillStyle = bgGrad;
                    ctx.fillRect(0, 0, W, H);

                    const podiumW = Math.max(targetW * 1.15, 360);
                    const podiumH = 46;
                    const podiumTopY = productBottom - 4;

                    ctx.beginPath();
                    ctx.ellipse(W / 2, podiumTopY + podiumH + 16, podiumW * 0.58, 20, 0, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(15, 23, 42, 0.12)";
                    ctx.filter = "blur(14px)";
                    ctx.fill();
                    ctx.filter = "none";

                    const podGrad = ctx.createLinearGradient(W / 2 - podiumW / 2, 0, W / 2 + podiumW / 2, 0);
                    podGrad.addColorStop(0, "#cbd5e1");
                    podGrad.addColorStop(0.3, "#f8fafc");
                    podGrad.addColorStop(0.7, "#f1f5f9");
                    podGrad.addColorStop(1, "#94a3b8");
                    ctx.fillStyle = podGrad;
                    ctx.beginPath();
                    ctx.rect(W / 2 - podiumW / 2, podiumTopY, podiumW, podiumH);
                    ctx.fill();

                    ctx.beginPath();
                    ctx.ellipse(W / 2, podiumTopY + podiumH, podiumW / 2, 14, 0, 0, Math.PI);
                    ctx.fillStyle = "#94a3b8";
                    ctx.fill();

                    ctx.beginPath();
                    ctx.ellipse(W / 2, podiumTopY, podiumW / 2, 16, 0, 0, Math.PI * 2);
                    const topGrad = ctx.createRadialGradient(W / 2, podiumTopY, 20, W / 2, podiumTopY, podiumW / 2);
                    topGrad.addColorStop(0, "#ffffff");
                    topGrad.addColorStop(0.8, "#f1f5f9");
                    topGrad.addColorStop(1, "#e2e8f0");
                    ctx.fillStyle = topGrad;
                    ctx.fill();
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
                    ctx.lineWidth = 2;
                    ctx.stroke();

                } else if (preset === "studio-grey") {
                    const grad = ctx.createRadialGradient(W / 2, 280, 60, W / 2, H / 2, 650);
                    grad.addColorStop(0, "#f8fafc");
                    grad.addColorStop(0.4, "#e2e8f0");
                    grad.addColorStop(1, "#cbd5e1");
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, W, H);

                    ctx.save();
                    const spot = ctx.createRadialGradient(W / 2, 160, 40, W / 2, 160, 450);
                    spot.addColorStop(0, "rgba(255, 255, 255, 0.45)");
                    spot.addColorStop(1, "rgba(255, 255, 255, 0)");
                    ctx.fillStyle = spot;
                    ctx.fillRect(0, 0, W, H);
                    ctx.restore();

                    ctx.beginPath();
                    ctx.ellipse(W / 2, productBottom + 4, targetW * 0.44, 18, 0, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(15, 23, 42, 0.22)";
                    ctx.filter = "blur(12px)";
                    ctx.fill();
                    ctx.filter = "none";

                } else if (preset === "luxury-dark") {
                    const grad = ctx.createRadialGradient(W / 2, 450, 70, W / 2, H / 2, 650);
                    grad.addColorStop(0, "#2c303c");
                    grad.addColorStop(0.5, "#17181f");
                    grad.addColorStop(1, "#0a0a0d");
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, W, H);

                    ctx.save();
                    ctx.translate(0, productBottom * 2);
                    ctx.scale(1, -1);
                    ctx.globalAlpha = 0.18;
                    ctx.drawImage(procCanvas, minX, minY, prodW, prodH, targetX, targetY, targetW, targetH);
                    ctx.restore();

                    const refFade = ctx.createLinearGradient(0, productBottom, 0, productBottom + 80);
                    refFade.addColorStop(0, "rgba(10, 10, 13, 0.3)");
                    refFade.addColorStop(1, "rgba(10, 10, 13, 1)");
                    ctx.fillStyle = refFade;
                    ctx.fillRect(0, productBottom, W, 100);

                } else if (preset === "warm-ambient") {
                    const grad = ctx.createRadialGradient(W / 2, 380, 80, W / 2, H / 2, 650);
                    grad.addColorStop(0, "#fffbf2");
                    grad.addColorStop(0.45, "#faede0");
                    grad.addColorStop(1, "#ebdacf");
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, W, H);

                    ctx.beginPath();
                    ctx.ellipse(W / 2, productBottom + 4, targetW * 0.44, 16, 0, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(90, 50, 20, 0.18)";
                    ctx.filter = "blur(12px)";
                    ctx.fill();
                    ctx.filter = "none";

                } else {
                    // Clean White Studio
                    const grad = ctx.createRadialGradient(W / 2, 340, 70, W / 2, H / 2, 680);
                    grad.addColorStop(0, "#ffffff");
                    grad.addColorStop(0.45, "#ffffff");
                    grad.addColorStop(0.85, "#f6f8fb");
                    grad.addColorStop(1, "#eef1f6");
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, W, H);

                    const floorGrad = ctx.createLinearGradient(0, 720, 0, H);
                    floorGrad.addColorStop(0, "rgba(240, 243, 248, 0.2)");
                    floorGrad.addColorStop(1, "rgba(235, 239, 245, 0.45)");
                    ctx.fillStyle = floorGrad;
                    ctx.fillRect(0, 720, W, H - 720);

                    ctx.beginPath();
                    ctx.ellipse(W / 2, productBottom + 6, targetW * 0.42, 16, 0, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(15, 23, 42, 0.16)";
                    ctx.filter = "blur(12px)";
                    ctx.fill();
                    ctx.filter = "none";

                    ctx.beginPath();
                    ctx.ellipse(W / 2, productBottom, targetW * 0.28, 6, 0, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(15, 23, 42, 0.22)";
                    ctx.filter = "blur(5px)";
                    ctx.fill();
                    ctx.filter = "none";
                }

                // 7. Draw Isolated Product (original background completely stripped)
                ctx.drawImage(procCanvas, minX, minY, prodW, prodH, targetX, targetY, targetW, targetH);

                // 8. Studio lighting atmosphere
                if (preset !== "transparent-cutout") {
                    ctx.save();
                    const studioLighting = ctx.createRadialGradient(W / 2, 280, 100, W / 2, H / 2, 680);
                    studioLighting.addColorStop(0, "rgba(255, 255, 255, 0.10)");
                    studioLighting.addColorStop(0.8, "rgba(0, 0, 0, 0)");
                    studioLighting.addColorStop(1, "rgba(0, 0, 0, 0.05)");
                    ctx.fillStyle = studioLighting;
                    ctx.fillRect(0, 0, W, H);
                    ctx.restore();
                }

                const mime = preset === "transparent-cutout" ? "image/png" : "image/jpeg";
                resolve(canvas.toDataURL(mime, 0.95));
            } catch (err) {
                console.error("Canvas background extraction error:", err);
                resolve(sourceImg.src);
            }
        });
    }

    // Generate AI Image Action (3-Step Neural AI Studio)
    if (startAiGenerateBtn) {
        startAiGenerateBtn.addEventListener("click", async function () {
            if (!currentAiSourceFile && !aiSourcePreviewImg?.src) {
                alert("Please upload or select a product photo first.");
                return;
            }

            let progressInterval = null;
            try {
                if (aiGeneratingOverlay) aiGeneratingOverlay.style.display = "flex";
                if (aiProgressBar) aiProgressBar.style.width = "22%";
                if (aiOverlayStepText) aiOverlayStepText.textContent = "1. AI identifying product & removing background...";
                if (aiOverlayDetailText) aiOverlayDetailText.textContent = "Creating transparent PNG cutout & preserving original product 100%...";
                
                let curProgress = 22;
                progressInterval = setInterval(() => {
                    curProgress += 14;
                    if (curProgress > 92) curProgress = 92;
                    if (aiProgressBar) aiProgressBar.style.width = curProgress + "%";
                    if (curProgress > 32 && curProgress <= 65) {
                        if (aiOverlayStepText) aiOverlayStepText.textContent = "2. Generating studio lighting & backdrop...";
                        if (aiOverlayDetailText) aiOverlayDetailText.textContent = "Applying soft key light & commercial reflections...";
                    } else if (curProgress > 65) {
                        if (aiOverlayStepText) aiOverlayStepText.textContent = "3. Compositing realistic shadows...";
                        if (aiOverlayDetailText) aiOverlayDetailText.textContent = "Adding contact ground shadow & final packshot finish...";
                    }
                }, 130);

                startAiGenerateBtn.disabled = true;
                startAiGenerateBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing AI Studio...';
                if (aiApplyToProductBtn) aiApplyToProductBtn.style.display = "none";
                if (aiStatusMessage) aiStatusMessage.style.display = "none";

                const formData = new FormData();
                if (currentAiSourceFile && currentAiSourceFile instanceof File) {
                    formData.append("image", currentAiSourceFile);
                } else if (aiSourcePreviewImg && aiSourcePreviewImg.src) {
                    try {
                        const urlObj = new URL(aiSourcePreviewImg.src, window.location.origin);
                        formData.append("imagePath", urlObj.pathname);
                    } catch (e) {
                        formData.append("imagePath", aiSourcePreviewImg.src);
                    }
                }

                const promptVal = aiCustomPrompt?.value?.trim() || AI_PRESET_PROMPTS[currentAiSelectedPreset] || "Luxury black studio background with soft lighting";
                const isRecolor = /dress|shirt|tshirt|cloth|jacket|outfit|colour|color/i.test(promptVal);
                if (isRecolor && aiOverlayStepText) {
                    aiOverlayStepText.textContent = currentSelectedDressColor 
                        ? `1. AI isolating product & changing dress colour to ${currentSelectedDressColor}...`
                        : "1. AI isolating product & changing dress colour...";
                    if (aiOverlayDetailText) aiOverlayDetailText.textContent = "Photorealistically preserving fabric texture, folds, wrinkles & natural lighting...";
                }

                formData.append("prompt", promptVal);
                formData.append("stylePreset", currentAiSelectedPreset);

                const customKey = (aiApiKeyInput?.value || "").trim() || localStorage.getItem("mystore_gemini_api_key") || "";
                if (customKey) {
                    formData.append("apiKey", customKey);
                }

                // Call backend neural studio pipeline
                const response = await fetch("/api/products/generate-ai-image", {
                    method: "POST",
                    body: formData
                });

                const resJson = await response.json();

                if (response.ok && resJson.success) {
                    if (aiProgressBar) aiProgressBar.style.width = "100%";
                    currentAiResultUrl = resJson.imageUrl;
                    currentAiResultFilename = resJson.filename;
                    currentAiCutoutUrl = resJson.cutoutUrl;
                    currentAiCutoutFilename = resJson.cutoutFilename || `product-cutout-${Date.now()}.png`;

                    // Update Studio Packshot Card
                    if (aiResultPreviewImg) {
                        aiResultPreviewImg.src = currentAiResultUrl;
                    }
                    if (aiDownloadCutoutBtn && currentAiCutoutUrl) {
                        aiDownloadCutoutBtn.style.display = "inline-flex";
                    }
                    if (aiDownloadStudioBtn && currentAiResultUrl) {
                        aiDownloadStudioBtn.style.display = "inline-flex";
                    }

                    if (aiStudioMetaText) {
                        if (resJson.garmentColor) {
                            aiStudioMetaText.innerHTML = `Dress: <strong style="color:#7c3aed;text-transform:capitalize;">${resJson.garmentColor}</strong> • Studio Packshot`;
                        } else {
                            aiStudioMetaText.textContent = resJson.prompt ? (resJson.prompt.length > 32 ? resJson.prompt.substring(0, 32) + "..." : resJson.prompt) : "Studio composite";
                        }
                    }

                    // Status Message
                    if (aiStatusMessage) {
                        aiStatusMessage.className = "ai-status-message success";
                        aiStatusMessage.innerHTML = `
                            <div style="display:flex;align-items:center;width:100%;gap:10px;flex-wrap:wrap;">
                                <span><i class="fa-solid fa-circle-check"></i> ${resJson.message || "Background changed & studio packshot generated!"}</span>
                                <span style="margin-left:auto;font-size:11px;opacity:0.85;background:rgba(0,0,0,0.06);padding:2px 8px;border-radius:6px;font-weight:700;">${resJson.model || "AI Neural Studio"}</span>
                            </div>
                        `;
                        aiStatusMessage.style.display = "flex";
                    }

                    // Show apply button
                    if (aiApplyToProductBtn) {
                        aiApplyToProductBtn.style.display = "inline-flex";
                    }
                } else {
                    throw new Error(resJson.message || "Server returned an error generating AI studio image.");
                }
            } catch (err) {
                console.error("AI Generation request error:", err);
                if (aiStatusMessage) {
                    aiStatusMessage.className = "ai-status-message error";
                    aiStatusMessage.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Error generating AI image: ${err.message}`;
                    aiStatusMessage.style.display = "flex";
                }
            } finally {
                if (progressInterval) clearInterval(progressInterval);
                if (aiGeneratingOverlay) aiGeneratingOverlay.style.display = "none";
                startAiGenerateBtn.disabled = false;
                startAiGenerateBtn.innerHTML = '<i class="fa-solid fa-rotate"></i> Regenerate / Change Background';
            }
        });
    }

    // Helper: Save file to File Manager (public/images) and download directly to user's device
    async function downloadAndSaveAiFile(url, defaultFilename, type, btnElement) {
        if (!url) return;
        const origHtml = btnElement ? btnElement.innerHTML : null;
        try {
            if (btnElement) {
                btnElement.disabled = true;
                btnElement.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
            }

            let finalDownloadUrl = url;
            let finalFilename = defaultFilename;

            // 1. Permanently save to server File Manager (public/images)
            try {
                const saveRes = await fetch("/api/products/save-ai-file", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tempUrl: url, type: type })
                });
                const saveData = await saveRes.json();
                if (saveData.success && saveData.savedUrl) {
                    finalDownloadUrl = saveData.savedUrl;
                    finalFilename = saveData.filename || defaultFilename;
                    if (type === "cutout") {
                        currentAiCutoutUrl = saveData.savedUrl;
                        currentAiCutoutFilename = saveData.filename;
                    } else {
                        currentAiResultUrl = saveData.savedUrl;
                        currentAiResultFilename = saveData.filename;
                    }
                }
            } catch (saveErr) {
                console.warn("Save to server File Manager notice:", saveErr);
            }

            // 2. Direct Blob download to user's local File Manager / Downloads folder
            const fetchRes = await fetch(finalDownloadUrl);
            const blob = await fetchRes.blob();
            const blobUrl = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = finalFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);

            if (aiStatusMessage) {
                aiStatusMessage.className = "ai-status-message success";
                aiStatusMessage.innerHTML = `<i class="fa-solid fa-circle-check"></i> <strong>${type === "cutout" ? "Transparent PNG Cutout" : "Studio Packshot"}</strong> saved to File Manager & downloaded successfully!`;
                aiStatusMessage.style.display = "flex";
            }
        } catch (err) {
            console.error("Download error:", err);
            alert("Failed to save and download file: " + err.message);
        } finally {
            if (btnElement && origHtml) {
                btnElement.disabled = false;
                btnElement.innerHTML = origHtml;
            }
        }
    }

    // Download PNG (Transparent Cutout) Button Click
    if (aiDownloadCutoutBtn) {
        aiDownloadCutoutBtn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            downloadAndSaveAiFile(currentAiCutoutUrl, currentAiCutoutFilename || `product-cutout-${Date.now()}.png`, "cutout", aiDownloadCutoutBtn);
        });
    }

    // Download JPG (Studio Packshot) Button Click
    if (aiDownloadStudioBtn) {
        aiDownloadStudioBtn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            downloadAndSaveAiFile(currentAiResultUrl, currentAiResultFilename || `studio-packshot-${Date.now()}.jpg`, "packshot", aiDownloadStudioBtn);
        });
    }

    // Apply Studio Packshot to Product
    if (aiApplyToProductBtn) {
        aiApplyToProductBtn.addEventListener("click", async function () {
            if (!currentAiResultUrl) return;

            try {
                aiApplyToProductBtn.disabled = true;
                aiApplyToProductBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Applying...';

                // Save to server File Manager first
                let finalUrl = currentAiResultUrl;
                let finalName = currentAiResultFilename;
                try {
                    const saveRes = await fetch("/api/products/save-ai-file", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ tempUrl: currentAiResultUrl, type: "packshot" })
                    });
                    const saveData = await saveRes.json();
                    if (saveData.success && saveData.savedUrl) {
                        finalUrl = saveData.savedUrl;
                        finalName = saveData.filename;
                    }
                } catch (saveErr) {}

                const fetchRes = await fetch(finalUrl);
                const blob = await fetchRes.blob();
                const filename = finalName || `ai-product-${Date.now()}.jpg`;
                const aiFile = new File([blob], filename, { type: blob.type || "image/jpeg" });
                aiFile._isAiGenerated = true;
                aiFile._dataUrl = finalUrl;

                // Prepend so it becomes the primary cover photo of the product
                selectedProductImages.unshift(aiFile);
                currentPreviewCategory = "__uploaded__";
                renderProductImages();

                closeAiStudioModal();

                if (imageUploadArea) {
                    imageUploadArea.scrollIntoView({ behavior: "smooth", block: "center" });
                }

                alert("✨ AI Studio Product Image saved to File Manager and added as primary cover photo!");
            } catch (applyErr) {
                console.error("Failed to apply AI image to product:", applyErr);
                alert("Failed to apply AI image: " + applyErr.message);
            } finally {
                aiApplyToProductBtn.disabled = false;
                aiApplyToProductBtn.innerHTML = '<i class="fa-solid fa-check"></i> Use Studio Packshot';
            }
        });
    }


    // =====================================================
    // INITIALIZE
    // =====================================================

    updateBasePrice();

    loadProducts();


    console.log(
        "Admin Products Initialized Successfully"
    );

});

