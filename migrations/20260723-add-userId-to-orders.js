'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add userId column with foreign key reference
    await queryInterface.addColumn('orders', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // Add index on userId for faster queries
    await queryInterface.addIndex('orders', ['userId']);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove index
    await queryInterface.removeIndex('orders', ['userId']);

    // Remove userId column
    await queryInterface.removeColumn('orders', 'userId');
  }
};
