const express = require("express");
const router = express.Router();

const {
    CreateOrder,
    GetOrders,
    GetUserOrders,
    GetOrderById,
    UpdateOrderStatus,
} = require("../controllers/ordersController");

// ============ ADMIN ROUTES ============

// ✅ GET - All orders (ADMIN VIEW)
router.get("/get-orders", GetOrders);

// ✅ GET - Order details by ID
router.get("/get-order/:orderId", GetOrderById);

// ✅ POST - Create order
router.post("/create-order", CreateOrder);

// ✅ PUT - Update order status
router.post("/update-order-status/:id", UpdateOrderStatus);

// ============ USER ROUTES ============

// ✅ NEW: GET - User's orders
// Usage: /api/orders/user/:userId
router.get("/user/:userId", GetUserOrders);

module.exports = router;
