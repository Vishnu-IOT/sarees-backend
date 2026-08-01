'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('categories', 'status', {
      type: Sequelize.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
      after: 'collection', // optional
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('categories', 'status');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS enum_categories_status;'
    );
  },
};