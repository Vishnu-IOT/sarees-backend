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

        collection: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "SAREE",
        },

        category: {
            type: DataTypes.VIRTUAL,
            get() {
                return this.getDataValue("name");
            },
            set(value) {
                this.setDataValue("name", value);
            },
        },
    },
    {
        tableName: "categories",
        timestamps: true,
    }
);

module.exports = Category;
