const { DataTypes } = require("sequelize");
const sequelize = require("../config/mysqldb");
const User = require("./User");

const Customer = sequelize.define(
    "Customer",
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

        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        phone: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },

        email: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        address: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        city: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        state: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        pincode: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        country: {
            type: DataTypes.STRING,
            defaultValue: "India",
        },
    },
    {
        tableName: "customers",
        timestamps: true,
    }
);

Customer.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
});

User.hasMany(Customer, {
    foreignKey: "userId",
    as: "customers",
});

module.exports = Customer;