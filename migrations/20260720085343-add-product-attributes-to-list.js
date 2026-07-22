"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("product_attributes", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      color: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      fabric: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      work: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      blouseLength: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      occasion: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      metal: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      purity: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      stone: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      weight: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      size: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("product_attributes");
  },
};