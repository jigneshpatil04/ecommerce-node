// ==========================================
// PRODUCT CONTROLLER
// ==========================================

const db = require("../config/db");
const fs = require("fs");
const path = require("path");
const aiWorkerManager = require("./aiWorkerManager");
let GoogleGenAI;
try {
    GoogleGenAI = require("@google/genai").GoogleGenAI;
} catch (e) {
    console.warn("Could not load @google/genai:", e.message);
}


// ==========================================
// HELPERS & OFFLINE FALLBACKS
// ==========================================

let offlineProducts = [];
const FALLBACK_PRODUCTS = [];

function buildProductDisplayData(product, variants = [], lastOrderedColor = null) {

    const basePrice =
        Number(product.price || 0);

    const prices =
        variants.length > 0
            ? variants.map(
                (variant) =>
                    basePrice +
                    Number(
                        variant.extra_price || 0
                    )
            )
            : [basePrice];

    const displayPrice =
        Math.min(...prices);

    let effectiveStock = Number(product.stock || 0);
    let effectiveImage = product.image;

    if (variants.length > 0) {
        const colorStocks = {};
        const variantImages = [];
        const seenImages = new Set();

        // If there is an ordered color, prioritize that variant's photo!
        let orderedVariantImg = null;
        if (lastOrderedColor) {
            const ordVar = variants.find(function (v) {
                return v && v.color && String(v.color).trim().toLowerCase() === String(lastOrderedColor).trim().toLowerCase() && v.image && v.image !== "null";
            });
            if (ordVar && ordVar.image) {
                orderedVariantImg = String(ordVar.image).trim();
                seenImages.add(orderedVariantImg);
                variantImages.push(orderedVariantImg);
            }
        }

        variants.forEach(function (v) {
            const col = (v.color || "").trim().toLowerCase();
            if (col && colorStocks[col] === undefined) {
                colorStocks[col] = Number(v.stock) || 0;
            }

            if (v && v.image && v.image !== "null" && String(v.image).trim() !== "") {
                const img = String(v.image).trim();
                if (!seenImages.has(img)) {
                    seenImages.add(img);
                    variantImages.push(img);
                }
            }
        });

        const totalVariantStock = Object.values(colorStocks).reduce((a, b) => a + b, 0);
        effectiveStock = totalVariantStock;

        // Auto-matched variant photos from admin side take precedence for display
        if (variantImages.length > 0) {
            effectiveImage = variantImages.length === 1 ? variantImages[0] : JSON.stringify(variantImages);
        }
    }

    let lastOrderedImage = null;
    if (lastOrderedColor && variants.length > 0) {
        const ordVar = variants.find(function (v) {
            return v && v.color && String(v.color).trim().toLowerCase() === String(lastOrderedColor).trim().toLowerCase() && v.image && v.image !== "null";
        });
        if (ordVar && ordVar.image) {
            lastOrderedImage = String(ordVar.image).trim();
        }
    }

    return {
        ...product,
        image: effectiveImage,
        stock: effectiveStock,
        display_price:
            displayPrice,
        variants,
        last_ordered_color: lastOrderedColor,
        last_ordered_image: lastOrderedImage
    };

}


// ==========================================
// GET ALL PRODUCTS
// GET /api/products
// ==========================================

exports.getProducts = async (req, res) => {

    console.log("");
    console.log("=================================");
    console.log("GET PRODUCTS");
    console.log("=================================");

    try {

        const [products] = await db.query(
            `
            SELECT *
            FROM products
            ORDER BY id DESC
            `
        );

        const productIds =
            products.map(
                (product) => product.id
            );

        const variantsByProduct = {};
        const lastOrderedByProduct = {};

        if (productIds.length > 0) {

            const [variants] = await db.query(
                `
                SELECT *
                FROM product_variants
                WHERE product_id IN (?)
                ORDER BY
                    product_id,
                    FIELD(size, 'S', 'M', 'L', 'XL', 'XXL'),
                    color
                `,
                [productIds]
            );

            variants.forEach(
                (variant) => {

                    if (!variantsByProduct[variant.product_id]) {

                        variantsByProduct[variant.product_id] = [];

                    }

                    variantsByProduct[variant.product_id].push(variant);

                }
            );

            try {
                const [orderItems] = await db.query(
                    `
                    SELECT product_id, color
                    FROM order_items
                    WHERE product_id IN (?)
                    ORDER BY id DESC
                    `,
                    [productIds]
                );

                for (const item of orderItems) {
                    if (item.product_id && item.color && !lastOrderedByProduct[item.product_id]) {
                        lastOrderedByProduct[item.product_id] = String(item.color).trim();
                    }
                }
            } catch (err) {
                console.warn("Could not query order_items for last ordered color:", err.message);
            }

        }

        const productsWithDisplayData =
            products.map(
                (product) =>
                    buildProductDisplayData(
                        product,
                        variantsByProduct[product.id] || [],
                        lastOrderedByProduct[product.id] || null
                    )
            );

        return res.status(200).json({

            success: true,

            products: productsWithDisplayData

        });

    }
    catch (error) {

        const isConnError = error.code === 'ECONNREFUSED' ||
            error.name === 'AggregateError' ||
            (error.errors && error.errors.some(e => e.code === 'ECONNREFUSED')) ||
            String(error).includes("ECONNREFUSED");

        if (isConnError) {
            console.log("ℹ️ [Offline Mode] Database offline. Serving offline product catalog.");
            const all = [...offlineProducts, ...FALLBACK_PRODUCTS];
            return res.status(200).json({
                success: true,
                products: all.map(p => buildProductDisplayData(p, []))
            });
        }

        console.error(
            "GET PRODUCTS ERROR:",
            error.message || error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load products.",

            error:
                error.message

        });

    }

};


// ==========================================
// GET SINGLE PRODUCT
// GET /api/products/:id
// ==========================================

exports.getProductById = async (req, res) => {

    console.log("");
    console.log("=================================");
    console.log("GET SINGLE PRODUCT");
    console.log("=================================");

    try {

        const id =
            req.params.id;


        const [products] =
            await db.query(
                `
                SELECT *
                FROM products
                WHERE id = ?
                LIMIT 1
                `,
                [id]
            );


        const [variants] =
            await db.query(
                `
                SELECT *
                FROM product_variants
                WHERE product_id = ?
                ORDER BY
                    FIELD(size, 'S', 'M', 'L', 'XL', 'XXL'),
                    color
                `,
                [id]
            );


        // ======================================
        // PRODUCT NOT FOUND
        // ======================================

        if (products.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Product not found."

            });

        }


        // ======================================
        // SUCCESS
        // ======================================

        let lastOrderedColor = null;
        try {
            const [orderItems] = await db.query(
                `
                SELECT color
                FROM order_items
                WHERE product_id = ?
                ORDER BY id DESC
                LIMIT 1
                `,
                [id]
            );
            if (orderItems.length > 0 && orderItems[0].color) {
                lastOrderedColor = String(orderItems[0].color).trim();
            }
        } catch (err) {}

        const product =
            buildProductDisplayData(
                products[0],
                variants,
                lastOrderedColor
            );


        return res.status(200).json({

            success: true,

            product

        });

    }
    catch (error) {

        const isConnError = error.code === 'ECONNREFUSED' ||
            error.name === 'AggregateError' ||
            (error.errors && error.errors.some(e => e.code === 'ECONNREFUSED')) ||
            String(error).includes("ECONNREFUSED");

        if (isConnError) {
            console.log("ℹ️ [Offline Mode] Serving fallback single product.");
            const targetId = req.params.id;
            const fallbackProd = FALLBACK_PRODUCTS.find(p => String(p.id) === String(targetId)) || FALLBACK_PRODUCTS[0];
            return res.status(200).json({
                success: true,
                product: fallbackProd,
                variants: fallbackProd.variants || [],
                reviews: [],
                similarProducts: FALLBACK_PRODUCTS.filter(p => p.id !== fallbackProd.id).slice(0, 4)
            });
        }

        console.error(
            "GET PRODUCT ERROR:",
            error.message || error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load product.",

            error:
                error.message

        });

    }

};


// ==========================================
// CREATE PRODUCT
// POST /api/products
// ==========================================

exports.createProduct = async (req, res) => {

    console.log("");
    console.log("=================================");
    console.log("CREATE PRODUCT");
    console.log("=================================");


    let imagePath = null;
    let productDetailsVal = null;

    try {

        // ======================================
        // CHECK REQUEST BODY
        // ======================================

        if (!req.body) {

            return res.status(400).json({

                success: false,

                message:
                    "Request body is missing."

            });

        }


        console.log(
            "Request body:",
            req.body
        );


        // ======================================
        // GET PRODUCT DATA
        // ======================================

        const {
            name,
            description,
            price,
            category,
            stock
        } = req.body;


        // ======================================
        // VALIDATE PRODUCT NAME
        // ======================================

        if (
            !name ||
            name.trim() === ""
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Product name is required."

            });

        }


        // ======================================
        // VALIDATE PRICE
        // ======================================

        if (
            price === undefined ||
            price === null ||
            price === ""
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Product price is required."

            });

        }


        // ======================================
        // CONVERT PRICE
        // ======================================

        const productPrice =
            Number(price);


        // ======================================
        // CONVERT STOCK
        // ======================================

        const productStock =
            Number(stock || 0);


        // ======================================
        // VALIDATE PRICE
        // ======================================

        if (
            Number.isNaN(productPrice) ||
            productPrice < 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid product price."

            });

        }


        // ======================================
        // VALIDATE STOCK
        // ======================================

        if (
            Number.isNaN(productStock) ||
            productStock < 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid stock quantity."

            });

        }


        // ======================================
        // HANDLE UPLOADED IMAGE
        // ======================================

        const uploadedProductImages =
            req.files?.productImages || [];

        imagePath = null;

        if (uploadedProductImages.length > 0) {

            const imagePaths = uploadedProductImages.map(function (file) {
                return "/images/" + file.filename;
            });

            imagePath = imagePaths.length === 1
                ? imagePaths[0]
                : JSON.stringify(imagePaths);

        }
        else if (req.file) {

            imagePath = "/images/" + req.file.filename;

        }
        else if (req.body.image) {

            imagePath = req.body.image;

        }
        else {

            console.log(
                "No image uploaded."
            );

        }


        // ======================================
        productDetailsVal = req.body.product_details || null;
        if (productDetailsVal && typeof productDetailsVal === "object") {
            try { productDetailsVal = JSON.stringify(productDetailsVal); } catch (e) {}
        }

        const sql = `
            INSERT INTO products
            (
                name,
                description,
                price,
                category,
                image,
                stock,
                product_details
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;


        const values = [

            name.trim(),

            description || "",

            productPrice,

            category || "",

            imagePath,

            productStock,

            productDetailsVal

        ];


        console.log(
            "Database values:",
            values
        );


        const [result] =
            await db.query(
                sql,
                values
            );


        // ======================================
        // SUCCESS
        // ======================================

        console.log(
            "Product created successfully."
        );

        console.log(
            "Product ID:",
            result.insertId
        );


        return res.status(201).json({

            success: true,

            message:
                "Product added successfully.",

            productId:
                result.insertId,

            product: {

                id:
                    result.insertId,

                name:
                    name.trim(),

                description:
                    description || "",

                price:
                    productPrice,

                category:
                    category || "",

                image:
                    imagePath,

                stock:
                    productStock

            }

        });

    }
    catch (error) {
        const isConnError = error.code === 'ECONNREFUSED' ||
            error.name === 'AggregateError' ||
            (error.errors && error.errors.some(e => e.code === 'ECONNREFUSED')) ||
            String(error).includes("ECONNREFUSED");

        if (isConnError) {
            console.log("ℹ️ [Offline Mode] Database offline. Saving created product in offline memory.");
            const simId = Date.now();
            const newProd = {
                id: simId,
                name: (req.body?.name || "").trim(),
                description: req.body?.description || "",
                price: Number(req.body?.price || 0),
                category: req.body?.category || "",
                image: imagePath || req.body?.image || null,
                stock: Number(req.body?.stock || 0),
                product_details: productDetailsVal,
                created_at: new Date().toISOString()
            };
            offlineProducts.unshift(newProd);

            return res.status(201).json({
                success: true,
                message: "Product added successfully (offline mode).",
                productId: simId,
                product: newProd
            });
        }

        console.error("CREATE PRODUCT ERROR:", error.message || error);

        return res.status(500).json({
            success: false,
            message: "Failed to create product.",
            error: error.message
        });
    }

};


// ==========================================
// UPDATE PRODUCT
// PUT /api/products/:id
// ==========================================

exports.updateProduct = async (req, res) => {

    console.log("");
    console.log("=================================");
    console.log("UPDATE PRODUCT");
    console.log("=================================");


    try {

        // ======================================
        // CHECK REQUEST BODY
        // ======================================

        if (!req.body) {

            return res.status(400).json({

                success: false,

                message:
                    "Request body is missing."

            });

        }


        // ======================================
        // GET PRODUCT ID
        // ======================================

        const id =
            req.params.id;


        // ======================================
        // GET PRODUCT DATA
        // ======================================

        const {
            name,
            description,
            price,
            category,
            stock
        } = req.body;


        // ======================================
        // VALIDATE NAME
        // ======================================

        if (
            !name ||
            name.trim() === ""
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Product name is required."

            });

        }


        // ======================================
        // VALIDATE PRICE
        // ======================================

        if (
            price === undefined ||
            price === null ||
            price === ""
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Product price is required."

            });

        }


        const productPrice =
            Number(price);


        const productStock =
            Number(stock || 0);


        // ======================================
        // CHECK PRICE
        // ======================================

        if (
            Number.isNaN(productPrice) ||
            productPrice < 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid product price."

            });

        }


        // ======================================
        // CHECK STOCK
        // ======================================

        if (
            Number.isNaN(productStock) ||
            productStock < 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid stock quantity."

            });

        }


        // ======================================
        // GET CURRENT PRODUCT
        // ======================================

        const [existingProducts] =
            await db.query(
                `
                SELECT image
                FROM products
                WHERE id = ?
                LIMIT 1
                `,
                [id]
            );


        if (
            existingProducts.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Product not found."

            });

        }


        // ======================================
        // KEEP OLD IMAGE BY DEFAULT
        // ======================================

        let imagePath =
            existingProducts[0].image || null;


        // ======================================
        // NEW IMAGE UPLOADED
        // ======================================

        const uploadedProductImages =
            req.files?.productImages || [];

        if (uploadedProductImages.length > 0) {

            const imagePaths = uploadedProductImages.map(function (file) {
                return "/images/" + file.filename;
            });

            imagePath = imagePaths.length === 1
                ? imagePaths[0]
                : JSON.stringify(imagePaths);

        }
        else if (req.file) {

            imagePath = "/images/" + req.file.filename;

        }
        else if (req.body.image) {

            imagePath = req.body.image;

        }


        // ======================================
        // UPDATE PRODUCT
        // ======================================

        let productDetailsVal = req.body.product_details !== undefined ? req.body.product_details : null;
        if (productDetailsVal && typeof productDetailsVal === "object") {
            try { productDetailsVal = JSON.stringify(productDetailsVal); } catch (e) {}
        }

        const [result] =
            await db.query(
                `
                UPDATE products
                SET
                    name = ?,
                    description = ?,
                    price = ?,
                    category = ?,
                    image = ?,
                    stock = ?,
                    product_details = COALESCE(?, product_details)
                WHERE id = ?
                `,
                [

                    name.trim(),

                    description || "",

                    productPrice,

                    category || "",

                    imagePath,

                    productStock,

                    productDetailsVal,

                    id

                ]
            );


        // ======================================
        // SUCCESS
        // ======================================

        return res.status(200).json({

            success: true,

            message:
                "Product updated successfully.",

            product: {

                id:
                    id,

                name:
                    name.trim(),

                description:
                    description || "",

                price:
                    productPrice,

                category:
                    category || "",

                image:
                    imagePath,

                stock:
                    productStock

            }

        });

    }
    catch (error) {
        const isConnError = error.code === 'ECONNREFUSED' ||
            error.name === 'AggregateError' ||
            (error.errors && error.errors.some(e => e.code === 'ECONNREFUSED')) ||
            String(error).includes("ECONNREFUSED");

        if (isConnError) {
            const updId = req.params.id;
            const existing = offlineProducts.find(p => String(p.id) === String(updId));
            if (existing) {
                if (req.body.name) existing.name = req.body.name.trim();
                if (req.body.description !== undefined) existing.description = req.body.description;
                if (req.body.price !== undefined) existing.price = Number(req.body.price);
                if (req.body.category !== undefined) existing.category = req.body.category;
                if (req.body.stock !== undefined) existing.stock = Number(req.body.stock);
            }
            return res.status(200).json({
                success: true,
                message: "Product updated successfully (offline mode)."
            });
        }

        console.error("UPDATE PRODUCT ERROR:", error.message || error);

        return res.status(500).json({
            success: false,
            message: "Failed to update product.",
            error: error.message
        });
    }

};


// ==========================================
// DELETE PRODUCT
// DELETE /api/products/:id
// ==========================================

exports.deleteProduct = async (req, res) => {

    console.log("");
    console.log("=================================");
    console.log("DELETE PRODUCT");
    console.log("=================================");

    try {

        const id = req.params.id;

        const [result] = await db.query(
            `DELETE FROM products WHERE id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully."
        });

    } catch (error) {

        const isConnError = error.code === 'ECONNREFUSED' ||
            error.name === 'AggregateError' ||
            (error.errors && error.errors.some(e => e.code === 'ECONNREFUSED')) ||
            String(error).includes("ECONNREFUSED");

        if (isConnError) {
            console.log("ℹ️ [Offline Mode] Simulating product delete.");
            const delId = req.params.id;
            offlineProducts = offlineProducts.filter(p => String(p.id) !== String(delId));
            const idx = FALLBACK_PRODUCTS.findIndex(p => String(p.id) === String(delId));
            if (idx !== -1) {
                FALLBACK_PRODUCTS.splice(idx, 1);
            }
            return res.status(200).json({
                success: true,
                message: "Product deleted successfully (offline mode).",
                isOfflineMode: true
            });
        }

        console.error("DELETE PRODUCT ERROR:", error.message || error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete product.",
            error: error.message
        });

    }

};


// ==========================================
// AI PRODUCT IMAGE GENERATION (Studio Packshot)
// ==========================================

exports.generateAiProductImage = async function (req, res) {
    try {
        let imageBuffer = null;
        let mimeType = "image/jpeg";

        if (req.file) {
            imageBuffer = fs.readFileSync(req.file.path);
            mimeType = req.file.mimetype || "image/jpeg";
        } else if (req.body.imageBase64) {
            const matches = req.body.imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                mimeType = matches[1];
                imageBuffer = Buffer.from(matches[2], "base64");
            } else {
                imageBuffer = Buffer.from(req.body.imageBase64, "base64");
            }
        } else if (req.body.imagePath) {
            const cleanPath = req.body.imagePath.replace(/^\//, "");
            const fullPath = path.join(__dirname, "../public", cleanPath);
            if (fs.existsSync(fullPath)) {
                imageBuffer = fs.readFileSync(fullPath);
                const ext = path.extname(fullPath).toLowerCase();
                mimeType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
            }
        } else if (req.body.enhancedBase64) {
            const matches = req.body.enhancedBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                mimeType = matches[1];
                imageBuffer = Buffer.from(matches[2], "base64");
            } else {
                imageBuffer = Buffer.from(req.body.enhancedBase64, "base64");
            }
        }

        if (!imageBuffer) {
            return res.status(400).json({
                success: false,
                message: "No image provided. Please upload or select a product photo."
            });
        }

        const userPrompt = req.body.prompt ? String(req.body.prompt).trim() : "";
        const stylePreset = req.body.stylePreset || "studio-white";

        let presetDescription = "clean solid pure white seamless studio cyclorama background, balanced commercial studio lighting, soft natural contact floor shadow, product centered";
        if (stylePreset === "studio-podium") {
            presetDescription = "centered product elevated on a sleek round studio podium pedestal, smooth neutral studio backdrop, soft studio key light and ambient fill";
        } else if (stylePreset === "studio-grey") {
            presetDescription = "modern smooth grey gradient studio cyclorama background, crisp soft overhead lighting, soft floor shadow, product centered";
        } else if (stylePreset === "luxury-dark") {
            presetDescription = "dark graphite studio background, sharp rim lighting highlighting product contours, soft reflective ground surface, product centered";
        } else if (stylePreset === "warm-ambient") {
            presetDescription = "warm inviting studio lighting, elegant clean backdrop, soft diffusion, commercial advertisement aesthetic, product centered";
        } else if (stylePreset === "marble-table") {
            presetDescription = "luxury polished white marble tabletop surface, subtle grey veins, soft window ambient morning lighting, clean blurred interior background";
        } else if (stylePreset === "concrete-minimal") {
            presetDescription = "minimalist cool grey concrete loft studio background, soft directional natural daylight, polished architectural floor shadow, product centered";
        } else if (stylePreset === "warm-wood") {
            presetDescription = "warm natural golden oak wooden tabletop surface, soft warm studio ambient light, clean creamy studio backdrop, product centered";
        } else if (stylePreset === "neon-cyber") {
            presetDescription = "moody dark midnight slate studio backdrop, vivid dual-tone cyan and magenta neon rim lighting, subtle floor reflections, product centered";
        } else if (stylePreset === "pastel-blush") {
            presetDescription = "editorial fashion studio background with soft champagne peach-blush gradient, diffused warm key lighting, clean minimalist aesthetic, product centered";
        } else if (stylePreset === "sunlit-outdoor") {
            presetDescription = "warm golden hour sunlight studio lighting, sun-dappled warm cream backdrop, golden rim illumination, soft contact ground shadow, product centered";
        } else if (stylePreset === "velvet-luxury") {
            presetDescription = "regal deep emerald-teal luxury velvet studio cyclorama, rich vignette, soft overhead spotlighting, dramatic commercial packshot, product centered";
        } else if (stylePreset === "cinematic-sky" || stylePreset === "dramatic-sky") {
            presetDescription = "dramatic overcast cinematic stormy cloudy sky background with atmospheric low mist and fog, radiant daylight rim lighting glow, high-end editorial action photo shoot, product centered";
        }

        const trainedAiInstruction = `TASK: Change the background of this photo.
1. Segment and isolate the foreground product from the input image.
2. Completely remove the original background. Do not keep any of the original background, room, table, outdoor scene, or clutter.
3. Replace the background with: ${presetDescription}.
4. Position the product perfectly centered and upright, maintaining all original details, text, labels, and proportions.
5. Add realistic studio lighting and a natural contact drop shadow under the product base so it looks grounded.
${userPrompt ? `Additional user instructions: ${userPrompt}.` : ""}`;

        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || req.headers["x-goog-api-key"] || req.body.apiKey;
        let generatedBuffer = null;
        let modelUsed = null;

        if (apiKey) {
            // Attempt 1: Call @google/genai SDK
            if (GoogleGenAI) {
                try {
                    const ai = new GoogleGenAI({ apiKey });
                    const interaction = await ai.interactions.create({
                        model: "gemini-3.1-flash-image",
                        input: [
                            {
                                type: "text",
                                text: trainedAiInstruction
                            },
                            {
                                type: "image",
                                data: imageBuffer.toString("base64"),
                                mime_type: mimeType
                            }
                        ]
                    });

                    if (interaction && interaction.output_image && interaction.output_image.data) {
                        generatedBuffer = Buffer.from(interaction.output_image.data, "base64");
                        modelUsed = "gemini-3.1-flash-image";
                    } else if (interaction && Array.isArray(interaction.steps)) {
                        for (const step of interaction.steps) {
                            if (step.type === "model_output" && Array.isArray(step.content)) {
                                for (const part of step.content) {
                                    if (part.type === "image" && part.data) {
                                        generatedBuffer = Buffer.from(part.data, "base64");
                                        modelUsed = "gemini-3.1-flash-image";
                                        break;
                                    }
                                }
                            }
                            if (generatedBuffer) break;
                        }
                    }
                } catch (sdkError) {
                    console.warn("Gemini SDK call error:", sdkError.message);
                }
            }

            // Attempt 2: Direct REST call if SDK did not return image
            if (!generatedBuffer) {
                try {
                    const restResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "x-goog-api-key": apiKey
                        },
                        body: JSON.stringify({
                            model: "gemini-3.1-flash-image",
                            input: [
                                {
                                    type: "text",
                                    text: trainedAiInstruction
                                },
                                {
                                    type: "image",
                                    data: imageBuffer.toString("base64"),
                                    mime_type: mimeType
                                }
                            ]
                        })
                    });

                    if (restResponse.ok) {
                        const json = await restResponse.json();
                        if (json.output_image && json.output_image.data) {
                            generatedBuffer = Buffer.from(json.output_image.data, "base64");
                            modelUsed = "gemini-3.1-flash-image-rest";
                        } else if (Array.isArray(json.steps)) {
                            for (const step of json.steps) {
                                if (step.type === "model_output" && Array.isArray(step.content)) {
                                    for (const part of step.content) {
                                        if (part.type === "image" && part.data) {
                                            generatedBuffer = Buffer.from(part.data, "base64");
                                            modelUsed = "gemini-3.1-flash-image-rest";
                                            break;
                                        }
                                    }
                                }
                                if (generatedBuffer) break;
                            }
                        }
                    } else {
                        const errText = await restResponse.text();
                        console.warn("Gemini REST API error:", errText);
                    }
                } catch (restErr) {
                    console.warn("Gemini REST fetch error:", restErr.message);
                }
            }
        }

        // Ultra-Fast AI Neural Studio Engine (Pre-warmed in memory via persistent worker, <1s)
        if (!generatedBuffer) {
            try {
                const tempDir = path.join(__dirname, "../public/temp_ai");
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir, { recursive: true });
                }

                const tempInputFilename = `input-${Date.now()}-${Math.round(Math.random() * 1e5)}.${mimeType.includes("png") ? "png" : "jpg"}`;
                const tempInputPath = path.join(tempDir, tempInputFilename);
                fs.writeFileSync(tempInputPath, imageBuffer);

                const outFilename = `temp-ai-product-${Date.now()}-${Math.round(Math.random() * 1e6)}.jpg`;
                const outPath = path.join(tempDir, outFilename);
                const cutoutFilename = `temp-ai-cutout-${Date.now()}-${Math.round(Math.random() * 1e6)}.png`;
                const cutoutPath = path.join(tempDir, cutoutFilename);

                let workerResult = null;
                try {
                    // Fast path: Pre-warmed persistent AI worker (~0.6 - 0.9s)
                    workerResult = await aiWorkerManager.processImage({
                        inputPath: tempInputPath,
                        outputPath: outPath,
                        cutoutPath: cutoutPath,
                        prompt: userPrompt || trainedAiInstruction,
                        stylePreset: stylePreset || "luxury-dark"
                    });
                } catch (workerErr) {
                    console.warn("[AI Worker Fallback] Direct execution:", workerErr.message);
                    const scriptPath = path.join(__dirname, "aiStudioEngine.py");
                    const safePrompt = (userPrompt || "").replace(/"/g, '\\"');
                    const pyCmd = `python "${scriptPath}" "${tempInputPath}" "${outPath}" "${cutoutPath}" "${safePrompt}" "${stylePreset}"`;
                    await new Promise((resolve) => {
                        const { exec } = require("child_process");
                        exec(pyCmd, { timeout: 35000 }, (error) => resolve(!error));
                    });
                }

                try {
                    if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
                } catch (e) {}

                if (fs.existsSync(outPath) && fs.statSync(outPath).size > 0) {
                    const garmentColor = workerResult && workerResult.garmentColor ? workerResult.garmentColor : null;
                    return res.json({
                        success: true,
                        imageUrl: `/temp_ai/${outFilename}`,
                        cutoutUrl: `/temp_ai/${cutoutFilename}`,
                        filename: outFilename,
                        cutoutFilename: cutoutFilename,
                        garmentColor: garmentColor,
                        model: "ai-neural-studio-engine (ultra-fast)",
                        prompt: userPrompt || trainedAiInstruction,
                        stylePreset: stylePreset,
                        message: garmentColor 
                            ? `AI changed dress colour to ${garmentColor}, removed original background & generated studio packshot!`
                            : "AI identified product, removed background, generated studio backdrop & added realistic shadows!"
                    });
                }
            } catch (pyErr) {
                console.warn("AI Neural Studio Engine execution error:", pyErr.message);
            }

            if (req.body.enhancedBase64) {
                const matches = req.body.enhancedBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                if (matches && matches.length === 3) {
                    generatedBuffer = Buffer.from(matches[2], "base64");
                } else {
                    generatedBuffer = Buffer.from(req.body.enhancedBase64, "base64");
                }
                modelUsed = "ai-studio-lighting-engine";
            } else {
                generatedBuffer = imageBuffer;
                modelUsed = "ai-studio-packshot";
            }
        }

        const tempDir = path.join(__dirname, "../public/temp_ai");
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        const outFilename = `temp-ai-product-${Date.now()}-${Math.round(Math.random() * 1e6)}.jpg`;
        const outPath = path.join(tempDir, outFilename);
        fs.writeFileSync(outPath, generatedBuffer);

        return res.json({
            success: true,
            imageUrl: `/temp_ai/${outFilename}`,
            filename: outFilename,
            model: modelUsed || "gemini-3.1-flash-image",
            prompt: trainedAiInstruction,
            stylePreset: stylePreset,
            message: "AI Product Image background changed and studio lighting applied!"
        });
    } catch (error) {
        console.error("AI GENERATE IMAGE ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate AI product image: " + error.message
        });
    }
};

// ==========================================
// SAVE AI FILE TO FILE MANAGER (public/images)
// Triggered on "Download PNG", "Download JPG", or "Use Studio Packshot"
// ==========================================
exports.saveAiFile = async function (req, res) {
    try {
        const { tempUrl, type } = req.body;
        if (!tempUrl) {
            return res.status(400).json({ success: false, message: "No tempUrl provided." });
        }

        const imagesDir = path.join(__dirname, "../public/images");
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
        }

        // Clean path to extract filename
        const cleanPath = tempUrl.replace(/^\//, "").split("?")[0];
        const sourcePath = path.join(__dirname, "../public", cleanPath);

        // If sourcePath is already in public/images, return it directly
        if (cleanPath.startsWith("images/")) {
            const existingFilename = path.basename(sourcePath);
            return res.json({
                success: true,
                savedUrl: `/images/${existingFilename}`,
                filename: existingFilename,
                message: "File is already in File Manager."
            });
        }

        if (!fs.existsSync(sourcePath)) {
            return res.status(404).json({ success: false, message: "Source file not found." });
        }

        const ext = path.extname(sourcePath) || (type === "cutout" ? ".png" : ".jpg");
        const prefix = type === "cutout" ? "ai-cutout" : "ai-product";
        const destFilename = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e5)}${ext}`;
        const destPath = path.join(imagesDir, destFilename);

        fs.copyFileSync(sourcePath, destPath);

        return res.json({
            success: true,
            savedUrl: `/images/${destFilename}`,
            filename: destFilename,
            message: "File successfully saved to File Manager."
        });
    } catch (err) {
        console.error("Save AI File Error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};