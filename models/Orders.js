const { DataTypes } = require("sequelize");
const sequelize = require("../config/mysqldb");
const User = require("./User");
const Customer = require("./Customer");

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
        customerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "customers",
                key: "id",
            },
        },

        shippingName: DataTypes.STRING,

        shippingPhone: DataTypes.STRING,

        shippingEmail: DataTypes.STRING,

        shippingAddress: DataTypes.TEXT,

        shippingCity: DataTypes.STRING,

        shippingState: DataTypes.STRING,

        shippingPincode: DataTypes.STRING,

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
});

User.hasMany(Order, {
    foreignKey: "userId",
    as: "orders",
});

Order.belongsTo(Customer, {
    foreignKey: "customerId",
    as: "customer",
});

Customer.hasMany(Order, {
    foreignKey: "customerId",
    as: "orders",
});

module.exports = Order;
