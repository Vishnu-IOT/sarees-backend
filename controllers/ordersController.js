const sequelize = require("../config/mysqldb");
const { Op, fn, col } = require("sequelize");
const Order = require("../models/Orders");
const OrderItem = require("../models/OrderItems");
const Product = require("../models/Products");
const ProductAttribute = require("../models/ProductAttributes");
const User = require("../models/User");

// ✅ ADMIN FUNCTION: Get all orders (existing)
async function GetOrders(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const search = req.query.search || "";
        const status = req.query.status || "";
        const sort = req.query.sort === "ASC" ? "ASC" : "DESC";

        const where = {};

        if (status) {
            where.status = status;
        }

        if (search) {
            where[Op.or] = [
                {
                    orderNumber: {
                        [Op.like]: `%${search}%`,
                    },
                },
                {
                    customerName: {
                        [Op.like]: `%${search}%`,
                    },
                },
                {
                    customerPhone: {
                        [Op.like]: `%${search}%`,
                    },
                },
            ];
        }

        const { count, rows } = await Order.findAndCountAll({
            where,
            attributes: [
                "id",
                "userId",
                "orderNumber",
                "customerName",
                "customerPhone",
                "customerEmail",
                "customerCity",
                "customerState",
                "subtotal",
                "discount",
                "shippingCharge",
                "grandTotal",
                "paymentMethod",
                "paymentStatus",
                "status",
                "createdAt",
                [
                    fn("COUNT", col("items.id")),
                    "totalItems",
                ],
            ],
            include: [
                {
                    model: OrderItem,
                    as: "items",
                    attributes: [],
                    required: false,
                },
            ],
            group: ["Order.id"],
            order: [["createdAt", sort]],
            limit,
            offset,
            subQuery: false,
        });

        return res.status(200).json({
            success: true,
            totalOrders: Array.isArray(count) ? count.length : count,
            currentPage: page,
            totalPages: Math.ceil(
                (Array.isArray(count) ? count.length : count) / limit
            ),
            data: rows,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch orders.",
        });
    }
}

// ✅ NEW: Get orders for a specific user
async function GetUserOrders(req, res) {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const status = req.query.status || "";
        const sort = req.query.sort === "ASC" ? "ASC" : "DESC";

        // Build where clause
        const where = {
            userId: parseInt(userId),
        };

        if (status) {
            where.status = status;
        }

        const { count, rows } = await Order.findAndCountAll({
            where,
            include: [
                {
                    model: OrderItem,
                    as: "items",
                    include: [
                        {
                            model: Product,
                            as: "product",
                            attributes: ["id", "name", "collection"],
                        },
                    ],
                },
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "name", "email"],
                },
            ],
            order: [["createdAt", sort]],
            limit,
            offset,
            distinct: true,
        });

        if (rows.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No orders found for this user",
                userId: parseInt(userId),
                orders: [],
                currentPage: page,
                totalPages: 0,
                total: 0,
            });
        }

        return res.status(200).json({
            success: true,
            userId: parseInt(userId),
            orders: rows,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            total: count,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch user orders.",
            error: error.message,
        });
    }
}

// ✅ NEW: Get single order details with items
async function GetOrderById(req, res) {
    try {
        const { orderId } = req.params;

        const order = await Order.findByPk(orderId, {
            include: [
                {
                    model: OrderItem,
                    as: "items",
                    include: [
                        {
                            model: Product,
                            as: "product",
                            attributes: ["id", "name", "collection", "price", "offerPrice"],
                        },
                    ],
                },
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "name", "email", "phone"],
                },
            ],
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: order,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch order details.",
            error: error.message,
        });
    }
}

async function CreateOrder(req, res) {
    const transaction = await sequelize.transaction();

    try {
        const {
            userId,
            customerName,
            customerPhone,
            customerEmail,
            customerAddress,
            customerCity,
            customerState,
            customerPincode,
            notes,
            items,
        } = req.body;

        if (!customerName || !customerPhone || !customerAddress) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Customer details are required.",
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Order must contain at least one product.",
            });
        }

        // Order number: timestamp + short random suffix to avoid collisions
        const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 900 + 100)}`;

        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const quantity = Number(item.quantity);

            if (!item.productId) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Each item must include a productId.",
                });
            }

            if (!Number.isInteger(quantity) || quantity <= 0) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Invalid quantity for product ${item.productId}.`,
                });
            }

            const product = await Product.findByPk(item.productId, {
                include: [
                    {
                        model: ProductAttribute,
                        as: "attributes",
                    },
                ],
                transaction,
            });

            if (!product) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    message: `Product ${item.productId} not found.`,
                });
            }

            const variants = product.attributes || [];
            let selectedAttribute = null;

            if (item.attributeId) {
                selectedAttribute = variants.find(
                    (attr) => String(attr.id) === String(item.attributeId)
                );

                if (!selectedAttribute) {
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        message: `Selected variant not found for product ${item.productId}.`,
                    });
                }
            } else if (variants.length === 1) {
                selectedAttribute = variants[0];
            } else if (variants.length > 1) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: `attributeId is required for product ${item.productId} (multiple variants available).`,
                });
            }

            const price =
                Number(product.offerPrice) > 0
                    ? Number(product.offerPrice)
                    : Number(product.price);

            const lineTotal = price * quantity;

            subtotal += lineTotal;

            orderItems.push({
                productId: product.id,
                productName: product.name,
                collection: product.collection,
                sku: selectedAttribute?.sku || null,
                image_url: selectedAttribute?.image_url || null,
                color: selectedAttribute?.color || null,
                size: selectedAttribute?.size || null,
                fabric: selectedAttribute?.fabric || null,
                quantity,
                price,
                discount: product.discount || 0,
                subtotal: lineTotal,
            });
        }

        const order = await Order.create(
            {
                userId: userId || null,
                orderNumber,
                customerName,
                customerPhone,
                customerEmail,
                customerAddress,
                customerCity,
                customerState,
                customerPincode,
                notes,
                subtotal,
                discount: 0,
                shippingCharge: 0,
                grandTotal: subtotal,
            },
            { transaction }
        );

        for (const item of orderItems) {
            await OrderItem.create(
                {
                    orderId: order.id,
                    ...item,
                },
                { transaction }
            );
        }

        await transaction.commit();

        const createdOrder = await Order.findByPk(order.id, {
            include: [
                {
                    model: OrderItem,
                    as: "items",
                },
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "name", "email"],
                },
            ],
        });

        return res.status(201).json({
            success: true,
            message: "Order created successfully.",
            data: createdOrder,
        });
    } catch (error) {
        await transaction.rollback();

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to create order.",
            error: error.message,
        });
    }
}

async function UpdateOrderStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatus = [
            "Pending",
            "Confirmed",
            "Packed",
            "Shipped",
            "Delivered",
            "Cancelled",
        ];

        if (!status || !validStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status.",
            });
        }

        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found.",
            });
        }

        await order.update({ status });

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully.",
            data: {
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
            },
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to update order status.",
        });
    }
}

module.exports = {
    CreateOrder,
    GetOrders,
    GetUserOrders,
    GetOrderById,
    UpdateOrderStatus,
};
