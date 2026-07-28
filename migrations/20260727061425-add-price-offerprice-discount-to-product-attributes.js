"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("product_attributes", "price", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      after: 'image_url',
      defaultValue: 0,
    });

    await queryInterface.addColumn("product_attributes", "offerPrice", {
      type: Sequelize.DECIMAL(10, 2),
      after: 'price',
      allowNull: true,
    });

    await queryInterface.addColumn("product_attributes", "discount", {
      type: Sequelize.INTEGER,
      after: 'offerPrice',
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("product_attributes", "discount");
    await queryInterface.removeColumn("product_attributes", "offerPrice");
    await queryInterface.removeColumn("product_attributes", "price");
  },
};