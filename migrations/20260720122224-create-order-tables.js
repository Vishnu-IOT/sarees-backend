"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("orders", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            orderNumber: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },

            customerName: {
                type: Sequelize.STRING,
                allowNull: false,
            },

            customerPhone: {
                type: Sequelize.STRING,
                allowNull: false,
            },

            customerEmail: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            customerAddress: {
                type: Sequelize.TEXT,
                allowNull: false,
            },

            customerCity: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            customerState: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            customerPincode: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            notes: {
                type: Sequelize.TEXT,
                allowNull: true,
            },

            subtotal: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },

            discount: {
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0,
            },

            shippingCharge: {
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0,
            },

            grandTotal: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },

            status: {
                type: Sequelize.ENUM(
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
                type: Sequelize.ENUM(
                    "Pending",
                    "Paid",
                    "Failed",
                    "Refunded"
                ),
                defaultValue: "Pending",
            },

            paymentMethod: {
                type: Sequelize.ENUM(
                    "WhatsApp",
                    "COD",
                    "Online"
                ),
                defaultValue: "WhatsApp",
            },

            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },

            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("orders");
    },
};