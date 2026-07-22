"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.dropTable("product_attributes");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.createTable("product_attributes", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      image_url: {
        type: Sequelize.STRING,
      },

      color: {
        type: Sequelize.STRING,
      },

      sku: {
        type: Sequelize.STRING,
        unique: true,
      },

      fabric: {
        type: Sequelize.STRING,
      },

      work: {
        type: Sequelize.STRING,
      },

      blouseLength: {
        type: Sequelize.STRING,
      },

      occasion: {
        type: Sequelize.STRING,
      },

      metal: {
        type: Sequelize.STRING,
      },

      purity: {
        type: Sequelize.STRING,
      },

      stone: {
        type: Sequelize.STRING,
      },

      weight: {
        type: Sequelize.STRING,
      },

      size: {
        type: Sequelize.STRING,
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
};