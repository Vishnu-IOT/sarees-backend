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
    foreignKey: {
        name: "orderId",
        allowNull: false,
    },
    onDelete: "CASCADE",
    as: "items",
});

OrderItem.belongsTo(Order, {
    foreignKey: {
        name: "orderId",
        allowNull: false,
    },
    onDelete: "CASCADE",
    as: "order",
});

Product.hasMany(OrderItem, {
    foreignKey: {
        name: "productId",
        allowNull: false,
    },
    onDelete: "CASCADE",
    as: "orderItems",
});

OrderItem.belongsTo(Product, {
    foreignKey: {
        name: "productId",
        allowNull: false,
    },
    onDelete: "CASCADE",
    as: "product",
});

module.exports = OrderItem;