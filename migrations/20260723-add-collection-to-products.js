'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('products', 'collection', {
      type: Sequelize.ENUM('SAREE', 'JEWEL'),
      allowNull: false,
      defaultValue: 'SAREE',
      after: 'subcategoryId'
    });

    // Add index on collection for faster queries
    await queryInterface.addIndex('products', ['collection']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('products', ['collection']);
    await queryInterface.removeColumn('products', 'collection');
  }
};
