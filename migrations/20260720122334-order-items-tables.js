"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("order_items", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            orderId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "orders",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            productId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "products",
                    key: "id",
                },
            },

            productName: {
                type: Sequelize.STRING,
                allowNull: false,
            },

            sku: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            image_url: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            color: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            size: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            fabric: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },

            price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },

            discount: {
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0,
            },

            subtotal: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
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
        await queryInterface.dropTable("order_items");
    },
};