const sequelize = require('../config/dbconfig');
const Sequelize = require('sequelize');
const { DataTypes } = Sequelize;
const email = sequelize.define('emails', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    from: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    to: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, { freezeTableName: true });

module.exports = email;