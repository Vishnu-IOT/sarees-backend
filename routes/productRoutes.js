const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload");

const {
    GetProducts,
    CreateProduct,
    UpdateProduct,
    DeleteProduct,
} = require("../controllers/productController");

router.get("/get-products", GetProducts);

router.post(
    "/create-product",
    upload.single("image"),
    CreateProduct
);

router.put("/update-product/:id", UpdateProduct);

router.delete("/delete-product/:id", DeleteProduct);

module.exports = router;