"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add image column to product_attributes
    await queryInterface.addColumn("product_attributes", "sku", {
      type: Sequelize.STRING,
      unique: true,
      after: 'color',
    });

    // Remove image column from products
    await queryInterface.removeColumn("products", "sku");
  },

  async down(queryInterface, Sequelize) {
    // Add image back to products
    await queryInterface.addColumn("products", "sku", {
      type: Sequelize.STRING,
      unique: true,
    });

    // Remove image from product_attributes
    await queryInterface.removeColumn("product_attributes", "sku");
  },
};