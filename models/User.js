const { DataTypes } = require("sequelize");
const sequelize = require("../config/mysqldb");

const User = sequelize.define(
    "User",
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

        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },

        phoneNo: {
            type: DataTypes.STRING(10),
            allowNull: false,
            unique: true,
            validate: {
                len: [10, 10],
                isNumeric: true,
            },
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Admin",
        },

        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Active",
        },
    },
    {
        tableName: "users", // Use "users" if your migration creates a lowercase table
        timestamps: true,
    }
);

module.exports = User;