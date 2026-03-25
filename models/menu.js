const sequelize = require('../config/dbconfig');
const Sequelize = require('sequelize');
const RoleMenu = require('./role_menus');
const { DataTypes } = Sequelize;

const Menu = sequelize.define(
  'menus',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    parent_id: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    route: {
      type: DataTypes.STRING(255),
      defaultValue: '#'
    },
    slug: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    query_param: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    icon: {
      type: DataTypes.STRING(255),
      defaultValue: 'fe fe-plus	'
    },
    sort: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    type: {
        type: DataTypes.ENUM('main-menu', 'sub-menu', 'other'),
        defaultValue: 'other'
    },
    status: {
      type: Sequelize.TINYINT,
      defaultValue: 1
    },
    isDeleted: {
      type: Sequelize.TINYINT,
      defaultValue: 0
    },
  },
  { freezeTableName: true },
)

// Menus
Menu.hasMany(RoleMenu, { foreignKey: 'menu_id', as: 'role_menus' });
RoleMenu.belongsTo(Menu, { foreignKey: 'menu_id', as: 'menus' });

// subMenus
Menu.hasMany(Menu, { foreignKey: 'parent_id', as: 'submenus' });
// Menu.belongsTo(Menu, { foreignKey: 'parent_id', as: 'submenus' });

module.exports = Menu;
