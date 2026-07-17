const { DataTypes } = require("sequelize");
const sequelize = require("../config/mysqldb");
const Category = require("./Category");

const Product = sequelize.define(
    "Product",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        desc: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        discount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },

        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },

        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        image: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        loom: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },

        status: {
            type: DataTypes.ENUM("active", "inactive"),
            defaultValue: "active",
        },
    },
    {
        tableName: "products",
        timestamps: true,
    }
);

Product.belongsTo(Category, {
    foreignKey: "categoryId",
    as: "category",
});

Category.hasMany(Product, {
    foreignKey: "categoryId",
    as: "products",
});

module.exports = Product;