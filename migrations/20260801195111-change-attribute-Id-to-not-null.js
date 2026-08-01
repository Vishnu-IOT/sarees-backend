'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("order_items", "attributeId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "product_attributes",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("order_items", "attributeId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "product_attributes",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },
};