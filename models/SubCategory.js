const { DataTypes } = require("sequelize");
const sequelize = require("../config/mysqldb");
const Category = require("./Category");

const SubCategory = sequelize.define(
    "SubCategory",
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

        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        image: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        status: {
            type: DataTypes.ENUM("active", "inactive"),
            defaultValue: "active",
        },
    },
    {
        tableName: "subcategories",
        timestamps: true,
    }
);

SubCategory.belongsTo(Category, {
    foreignKey: "categoryId",
    as: "category",
});

Category.hasMany(SubCategory, {
    foreignKey: "categoryId",
    as: "subcategories",
});

module.exports = SubCategory;