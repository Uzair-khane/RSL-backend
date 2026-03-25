const sequelize = require('../config/dbconfig');
const Sequelize = require('sequelize');
const { DataTypes } = Sequelize;

const Page = sequelize.define(
  'pages',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    type: {
      type: DataTypes.ENUM('header','footer','page'),
      defaultValue: 'footer'
    },
    views_counter: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: Sequelize.TINYINT,
      defaultValue: 1
    },
    isDeleted: {
      type: Sequelize.TINYINT,
      defaultValue: 0
    },
    createdAt: {
      type: DataTypes.DATE,
      get() {
          return moment(this.getDataValue('createdAt')).fromNow();
      }
    },
    // Virutal Fields
    last_updated: {
      type: DataTypes.VIRTUAL,
      get() {
          return moment(this.getDataValue('updatedAt')).fromNow();
      }
    }
  },
  { freezeTableName: true },
)

module.exports = Page;
