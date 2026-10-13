const express = require("express");

const router = express.Router();

const variantController =
    require("../controllers/variantController");

const upload =
    require("../middleware/uploadMiddleware");


router.post(
    "/",
    upload.single("image"),
    variantController.createVariant
);


router.get(
    "/product/:productId",
    variantController.getProductVariants
);


router.get(
    "/:id",
    variantController.getVariant
);


router.put(
    "/:id",
    upload.single("image"),
    variantController.updateVariant
);


router.delete(
    "/:id",
    variantController.deleteVariant
);


module.exports = router;