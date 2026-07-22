"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add image column to product_attributes
    await queryInterface.addColumn("product_attributes", "image_url", {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'color',
    });

    // Remove image column from products
    await queryInterface.removeColumn("products", "image");
  },

  async down(queryInterface, Sequelize) {
    // Add image back to products
    await queryInterface.addColumn("products", "image", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Remove image from product_attributes
    await queryInterface.removeColumn("product_attributes", "image_url");
  },
};