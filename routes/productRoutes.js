const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");

const {
    GetProducts,
    GetSarees,
    GetJewels,
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

// POST - Create product with variant images
router.post(
    "/create-product",
    upload.array("variantImages", 20),
    CreateProduct
);

// PUT - Update product with variant images
router.post(
    "/update-product/:id",
    upload.array("variantImages", 20),
    UpdateProduct
);

// DELETE product
router.post("/delete-product/:id", DeleteProduct);

module.exports = router;
