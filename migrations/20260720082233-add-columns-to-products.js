'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("products", "subcategoryId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: "categoryId",
      references: {
        model: "subcategories",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn('products', 'slug', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
      after: 'name',
    });

    await queryInterface.addColumn('products', 'sku', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
      after: 'slug',
    });

    await queryInterface.addColumn('products', 'offerPrice', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      after: 'price',
    });

    await queryInterface.addColumn('products', 'isFeatured', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      after: 'loom',
    });

    await queryInterface.addColumn('products', 'isNewArrival', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      after: 'isFeatured',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('products', 'subcategoryId');
    await queryInterface.removeColumn('products', 'slug');
    await queryInterface.removeColumn('products', 'sku');
    await queryInterface.removeColumn('products', 'offerPrice');
    await queryInterface.removeColumn('products', 'isFeatured');
    await queryInterface.removeColumn('products', 'isNewArrival');
  },
};