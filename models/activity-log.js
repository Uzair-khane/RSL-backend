const sequelize = require('../config/dbconfig');
const Sequelize = require('sequelize');
const users = require('./user');
const { DataTypes } = Sequelize;
const ActivityLogs = sequelize.define('activity_logs', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    action: {
        type: DataTypes.ENUM('add','view','update','delete','login'),
        allowNull: false
    },
    ip_address: {
        type: DataTypes.STRING(15),
        defaultValue: '127.0.0.1'
    },
    detail: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.TINYINT(1),
        defaultValue: 1
    }
}, { freezeTableName: true });

users.hasMany(ActivityLogs, { foreignKey: 'user_id', as: 'activity_logs' });
ActivityLogs.belongsTo(users, { foreignKey: 'user_id', as: 'user' });

module.exports = ActivityLogs;