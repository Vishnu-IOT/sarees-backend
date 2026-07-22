const { DataTypes } = require("sequelize");
const sequelize = require("../config/mysqldb");

const Order = sequelize.define(
    "Order",
    {
        orderNumber: {
            type: DataTypes.STRING,
            unique: true,
        },

        customerName: DataTypes.STRING,

        customerPhone: DataTypes.STRING,

        customerEmail: DataTypes.STRING,

        customerAddress: DataTypes.TEXT,

        customerCity: DataTypes.STRING,

        customerState: DataTypes.STRING,

        customerPincode: DataTypes.STRING,

        notes: DataTypes.TEXT,

        subtotal: DataTypes.DECIMAL(10, 2),

        discount: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },

        shippingCharge: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },

        grandTotal: DataTypes.DECIMAL(10, 2),

        status: {
            type: DataTypes.ENUM(
                "Pending",
                "Confirmed",
                "Packed",
                "Shipped",
                "Delivered",
                "Cancelled"
            ),
            defaultValue: "Pending",
        },

        paymentStatus: {
            type: DataTypes.ENUM(
                "Pending",
                "Paid",
                "Failed",
                "Refunded"
            ),
            defaultValue: "Pending",
        },

        paymentMethod: {
            type: DataTypes.ENUM(
                "WhatsApp",
                "COD",
                "Online"
            ),
            defaultValue: "WhatsApp",
        },
    },
    {
        tableName: "orders",
    }
);

module.exports = Order;