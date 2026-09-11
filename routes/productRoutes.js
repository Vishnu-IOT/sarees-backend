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
    AddToLoom,
    RemoveFromLoom,
    GetNewArrivals,
    AddToNewArrival,
    RemoveFromNewArrival,
    UpdateProductStatus,
    GetProductById,
} = require("../controllers/productController");

// ✅ GET all products (mixed)
router.get("/get-products", GetProducts);

// ✅ NEW: GET all SAREE products
router.get("/get-sarees", GetSarees);

// ✅ NEW: GET all JEWEL products
router.get("/get-jewels", GetJewels);

// ✅ NEW: GET all LOOM products
router.get("/get-looms", GetLoomProducts);

// ✅ NEW: GET product by ID
router.get("/get-product/:id", GetProductById);

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

router.post("/add-to-loom/:productId", AddToLoom);
router.post("/remove-from-loom/:productId", RemoveFromLoom);

// ============ NEW ARRIVALS ============

// ✅ NEW: GET all New Arrival products
router.get("/get-new-arrivals", GetNewArrivals);

// ✅ NEW: Add / remove a product from New Arrivals
router.post("/add-to-new-arrival/:productId", AddToNewArrival);
router.post("/remove-from-new-arrival/:productId", RemoveFromNewArrival);

// ============ PRODUCT STATUS ============

// ✅ NEW: Toggle a product active/inactive — GET /product-status-update?id=1&status=inactive
router.get("/product-status-update", UpdateProductStatus);

module.exports = router;
