const sequelize = require('../config/dbconfig');
const Sequelize = require('sequelize');
const { DataTypes } = Sequelize;
const RoleMenu = sequelize.define('role_menus', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    role_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    menu_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    action: {
        type: DataTypes.ENUM('add', 'update', 'read', 'delete'),
        defaultValue: 'read'
    },
}, { freezeTableName: true });

module.exports = RoleMenu;