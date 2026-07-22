const { DataTypes } = require("sequelize");
const sequelize = require("../config/mysqldb");

const Product = require("./Products");

const ProductAttribute = sequelize.define(
    "ProductAttribute",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        image_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        color: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        
        sku: {
            type: DataTypes.STRING,
            unique: true,
        },

        fabric: {
            type: DataTypes.JSON,
            allowNull: true,
        },

        work: {
            type: DataTypes.JSON,
            allowNull: true,
        },

        blouseLength: {
            type: DataTypes.JSON,
            allowNull: true,
        },

        occasion: {
            type: DataTypes.JSON,
            allowNull: true,
        },

        metal: {
            type: DataTypes.JSON,
            allowNull: true,
        },

        purity: {
            type: DataTypes.JSON,
            allowNull: true,
        },

        stone: {
            type: DataTypes.JSON,
            allowNull: true,
        },

        weight: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        size: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    },
    {
        tableName: "product_attributes",
        timestamps: true,
    }
);

Product.hasMany(ProductAttribute, {
    foreignKey: "productId",
    as: "attributes",
});

ProductAttribute.belongsTo(Product, {
    foreignKey: "productId",
    as: "product",
});

module.exports = ProductAttribute;