const { DataTypes } = require("sequelize");
const sequelize = require("../config/mysqldb");

const Order = require("./Orders");
const Product = require("./Products");

const OrderItem = sequelize.define(
    "OrderItem",
    {
        productName: DataTypes.STRING,

        sku: DataTypes.STRING,

        image_url: DataTypes.STRING,

        color: DataTypes.STRING,

        size: DataTypes.STRING,

        fabric: DataTypes.STRING,

        quantity: DataTypes.INTEGER,

        price: DataTypes.DECIMAL(10, 2),

        discount: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },

        subtotal: DataTypes.DECIMAL(10, 2),
    },
    {
        tableName: "order_items",
    }
);

Order.hasMany(OrderItem, {
    foreignKey: "orderId",
    as: "items",
});

OrderItem.belongsTo(Order, {
    foreignKey: "orderId",
    as: "order",
});

Product.hasMany(OrderItem, {
    foreignKey: "productId",
    as: "orderItems",
});

OrderItem.belongsTo(Product, {
    foreignKey: "productId",
    as: "product",
});

module.exports = OrderItem;