const sequelize = require('../config/dbconfig');
const Sequelize = require('sequelize');
const { DataTypes } = Sequelize;

const SettingImage = sequelize.define(
  'setting_images',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    image_url: {
      type: DataTypes.STRING(255),
      required: true,
      allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('image', 'section1', 'section2', 'section3', 'section4', 'section5'),
        defaultValue: 'image'
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

module.exports = SettingImage;
