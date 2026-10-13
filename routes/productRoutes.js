const express = require("express");

const router =
    express.Router();

const productController =
    require("../controllers/productController");

const upload =
    require("../middleware/uploadMiddleware");


// ==========================================
// PRODUCT ROUTES
// ==========================================

router.get(
    "/",
    productController.getProducts
);


router.get(
    "/:id",
    productController.getProductById
);


// ==========================================
// AI PRODUCT IMAGE GENERATION
// ==========================================

router.post(
    "/generate-ai-image",
    upload.single("image"),
    productController.generateAiProductImage
);

router.post(
    "/save-ai-file",
    productController.saveAiFile
);


router.post(
    "/",
    upload.fields([
        {
            name: "productImages",
            maxCount: 30
        },
        {
            name: "variantImages",
            maxCount: 30
        }
    ]),
    productController.createProduct
);


router.put(
    "/:id",
    upload.fields([
        {
            name: "productImages",
            maxCount: 30
        },
        {
            name: "variantImages",
            maxCount: 30
        }
    ]),
    productController.updateProduct
);


router.delete(
    "/:id",
    productController.deleteProduct
);


module.exports = router;