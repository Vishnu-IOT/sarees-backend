const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");

const {
    GetProducts,
    GetSarees,
    GetJewels,
    GetLoomProducts,
    CreateProduct,
    UpdateProduct,
    DeleteProduct,
} = require("../controllers/productController");

// ✅ GET all products (mixed)
router.get("/get-products", GetProducts);

// ✅ NEW: GET all SAREE products
router.get("/get-sarees", GetSarees);

// ✅ NEW: GET all JEWEL products
router.get("/get-jewels", GetJewels);

// ✅ NEW: GET all LOOM products
router.get("/get-looms", GetLoomProducts);

// POST - Create product with main image + variant images
router.post(
    "/create-product",
    upload.fields([
        { name: "mainImage", maxCount: 1 },
        { name: "variantImages", maxCount: 20 },
    ]),
    CreateProduct
);

// PUT - Update product with main image + variant images
router.post(
    "/update-product/:id",
    upload.fields([
        { name: "mainImage", maxCount: 1 },
        { name: "variantImages", maxCount: 20 },
    ]),
    UpdateProduct
);

// DELETE product
router.post("/delete-product/:id", DeleteProduct);

module.exports = router;
