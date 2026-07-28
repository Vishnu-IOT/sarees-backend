const { DataTypes } = require("sequelize");
const sequelize = require("../config/mysqldb");

const Favorite = sequelize.define(
    "Favorite",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        productType: {
            type: DataTypes.ENUM("SAREE", "JEWEL"),
            allowNull: false,
        },
    },
    {
        tableName: "favorites",
        timestamps: true,
        updatedAt: false,
    }
);

module.exports = Favorite;