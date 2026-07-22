const express = require("express");
const router = express.Router();

const {
    CreateOrder,
    GetOrders,
    UpdateOrderStatus,
} = require("../controllers/ordersControllers");

router.get("/get-orders", GetOrders);
router.post("/create-orders", CreateOrder);
router.post("/order-status/:id/status", UpdateOrderStatus);


module.exports = router;