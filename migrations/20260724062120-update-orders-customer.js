"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn("orders", "customerId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "customers",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    await queryInterface.renameColumn(
      "orders",
      "customerName",
      "shippingName"
    );

    await queryInterface.renameColumn(
      "orders",
      "customerPhone",
      "shippingPhone"
    );

    await queryInterface.renameColumn(
      "orders",
      "customerEmail",
      "shippingEmail"
    );

    await queryInterface.renameColumn(
      "orders",
      "customerAddress",
      "shippingAddress"
    );

    await queryInterface.renameColumn(
      "orders",
      "customerCity",
      "shippingCity"
    );

    await queryInterface.renameColumn(
      "orders",
      "customerState",
      "shippingState"
    );

    await queryInterface.renameColumn(
      "orders",
      "customerPincode",
      "shippingPincode"
    );
  },

  async down(queryInterface) {

    await queryInterface.removeColumn("orders", "customerId");

    await queryInterface.renameColumn(
      "orders",
      "shippingName",
      "customerName"
    );

    await queryInterface.renameColumn(
      "orders",
      "shippingPhone",
      "customerPhone"
    );

    await queryInterface.renameColumn(
      "orders",
      "shippingEmail",
      "customerEmail"
    );

    await queryInterface.renameColumn(
      "orders",
      "shippingAddress",
      "customerAddress"
    );

    await queryInterface.renameColumn(
      "orders",
      "shippingCity",
      "customerCity"
    );

    await queryInterface.renameColumn(
      "orders",
      "shippingState",
      "customerState"
    );

    await queryInterface.renameColumn(
      "orders",
      "shippingPincode",
      "customerPincode"
    );
  },
};