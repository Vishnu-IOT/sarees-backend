const { DataTypes } = require("sequelize");
const sequelize = require("../config/mysqldb");

const Category = sequelize.define(
    "Category",
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

        // NEW: Collection enum to differentiate between SAREE and JEWEL collections
        collection: {
            type: DataTypes.ENUM("SAREE", "JEWEL"),
            allowNull: false,
            defaultValue: "SAREE",
        },
    },
    {
        tableName: "categories",
        timestamps: true,
    }
);

module.exports = Category;
