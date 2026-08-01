'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "order_items",
      "attributeId",
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "product_attributes",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        after: "productId",
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      "order_items",
      "attributeId"
    );
  },
};