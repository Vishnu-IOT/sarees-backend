const sequelize = require("../config/mysqldb");
const { Op, fn, col } = require("sequelize");
const Order = require("../models/Orders");
const OrderItem = require("../models/OrderItems");
const Product = require("../models/Products");
const ProductAttribute = require("../models/ProductAttributes");

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
};

async function CreateOrder(req, res) {
    const transaction = await sequelize.transaction();

    try {
        const {
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

        // Generate Order Number
        const orderNumber = `ORD${Date.now()}`;

        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
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

            const attributes = product.attributes;

            const price =
                Number(product.offerPrice) > 0
                    ? Number(product.offerPrice)
                    : Number(product.price);

            const lineTotal = price * Number(item.quantity);

            subtotal += lineTotal;

            orderItems.push({
                productId: product.id,
                productName: product.name,
                sku: attributes?.sku || null,
                image_url: attributes?.image_url || null,
                color: attributes?.color || null,
                size: attributes?.size || null,
                fabric: attributes?.fabric || null,
                quantity: item.quantity,
                price,
                discount: product.discount || 0,
                subtotal: lineTotal,
            });
        }

        const order = await Order.create(
            {
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
        });
    }
};

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
};

module.exports = { CreateOrder, GetOrders, UpdateOrderStatus }