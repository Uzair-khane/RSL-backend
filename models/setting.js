const sequelize = require('../config/dbconfig');
const Sequelize = require('sequelize');
const { DataTypes } = Sequelize;

const Setting = sequelize.define(
  'settings',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    /********************Logo***********************************/
    logo_color: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    logo_white: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    mobile_logo_small: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    mobile_logo_large: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    /********************./Logo*********************************/

    /********************Home page Section1**********************/
    section1_text: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    section1_description: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    /********************./Home page Section1********************/

    /*********************ContactInfo ***************************/
    email1: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    email2: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    address1: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    address2: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    contact_no: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    map_address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    /*********************./ContactInfo *************************/

    /****************Social Media Links *************************/
    twitter_link: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    facebook_link: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    youtube_link: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    instagram_link: {
        type: DataTypes.STRING(255),
        allowNull: true
    },

    /*******************./Mobile App link ************************/
    andriod_app_link: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    ios_app_link: {
        type: DataTypes.STRING(255),
        allowNull: true
    },

    /****************./footer text and site title ***********************/

    copyright_text: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    organization_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1
    },
    isDeleted: {
      type: DataTypes.TINYINT,
      defaultValue: 0
    },
  },
  { freezeTableName: true },
)

module.exports = Setting;
