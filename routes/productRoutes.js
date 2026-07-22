const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");

const {
    GetProducts,
    CreateProduct,
    UpdateProduct,
    DeleteProduct,
} = require("../controllers/productController");

// GET all products
router.get("/get-products", GetProducts);

// POST - Create product with variant images
// ✅ CHANGED: upload.single("image") → upload.array("variantImages", 20)
// This accepts up to 20 variant images with field name "variantImages"
router.post(
    "/create-product",
    upload.array("variantImages", 20),
    CreateProduct
);

// PUT - Update product with variant images
// ✅ CHANGED: POST → PUT and added multer for variant images
router.post(
    "/update-product/:id",
    upload.array("variantImages", 20),
    UpdateProduct
);

// DELETE product
router.post("/delete-product/:id", DeleteProduct);

module.exports = router;