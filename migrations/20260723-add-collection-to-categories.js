'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Rename 'category' column to 'name' in categories table
    await queryInterface.renameColumn('categories', 'category', 'name');

    // Add collection column
    await queryInterface.addColumn('categories', 'collection', {
      type: Sequelize.ENUM('SAREE', 'JEWEL'),
      allowNull: false,
      defaultValue: 'SAREE',
      after: 'name'
    });

    // Add unique constraint on (name, collection) combination
    await queryInterface.addIndex('categories', ['name', 'collection'], {
      unique: true,
      name: 'unique_category_collection'
    });

    // Add index on collection for faster queries
    await queryInterface.addIndex('categories', ['collection']);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes
    await queryInterface.removeIndex('categories', ['collection']);
    await queryInterface.removeIndex('categories', 'unique_category_collection');

    // Remove collection column
    await queryInterface.removeColumn('categories', 'collection');

    // Rename 'name' column back to 'category'
    await queryInterface.renameColumn('categories', 'name', 'category');
  }
};
