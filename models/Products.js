const { DataTypes } = require("sequelize");
const sequelize = require("../config/mysqldb");
const Category = require("./Category");
const SubCategory = require("./SubCategory");

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

        subcategoryId: {
            type: DataTypes.INTEGER,
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
        slug: {
            type: DataTypes.STRING,
            unique: true,
        },

        offerPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },

        isFeatured: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },

        isNewArrival: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
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

Product.belongsTo(SubCategory, {
    foreignKey: "subcategoryId",
    as: "subcategory",
});

SubCategory.hasMany(Product, {
    foreignKey: "subcategoryId",
    as: "products",
});

module.exports = Product;