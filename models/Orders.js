const { DataTypes } = require("sequelize");
const sequelize = require("../config/mysqldb");
const User = require("./User");

const Order = sequelize.define(
    "Order",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        // NEW: Add userId to link orders to users
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
        },

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
        timestamps: true,
    }
);

// Association with User
Order.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
    allowNull: true,
});

User.hasMany(Order, {
    foreignKey: "userId",
    as: "orders",
});

module.exports = Order;
