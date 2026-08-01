'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('product_attributes', 'quantity', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      after: 'image_url', // optional
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('product_attributes', 'quantity');
  },
};