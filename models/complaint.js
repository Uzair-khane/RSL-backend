
const sequelize = require('../config/dbconfig');
const Sequelize = require('sequelize');
const { DataTypes } = Sequelize;
const Complaint = sequelize.define('complaints', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    subject: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'resolved', 'rejected'),
        defaultValue: 'pending'
    },
    isDeleted: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    }
}, { freezeTableName: true });

module.exports = Complaint;