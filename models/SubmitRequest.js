const { DataTypes } = require('sequelize');
const sequelize = require('../config/mysqldb');
const User = require('./User');
const Order = require('./Orders');

const SubmitRequest = sequelize.define(
    'SubmitRequest',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        orderId: {
            // NEW FIELD
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'orders',
                key: 'id',
            },
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 100],
            },
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true,
            },
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
            validate: {
                len: [10, 20],
            },
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [5, 200],
            },
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [10, 5000],
            },
        },
        requestType: {
            type: DataTypes.ENUM('feedback', 'complaint', 'inquiry', 'partnership', 'order_inquiry', 'other'),
            allowNull: false,
            defaultValue: 'inquiry',
        },
        status: {
            type: DataTypes.ENUM('pending', 'in_progress', 'resolved', 'rejected'),
            allowNull: false,
            defaultValue: 'pending',
        },
        priority: {
            type: DataTypes.ENUM('low', 'medium', 'high'),
            allowNull: false,
            defaultValue: 'medium',
        },
        attachmentUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        adminNotes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: 'SubmitRequests',
        timestamps: true,
    }
);

SubmitRequest.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
});
SubmitRequest.belongsTo(Order, {
    foreignKey: 'orderId',
    as: 'order',
});

module.exports = SubmitRequest;