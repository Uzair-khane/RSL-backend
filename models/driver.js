const sequelize = require("../config/dbconfig");
const Sequelize = require("sequelize");
const { DataTypes } = Sequelize;

const Drivers = sequelize.define('drivers', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  contact: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  license_no: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  id_card_no: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  passport_no: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dob: {
    type: DataTypes.STRING,
    allowNull: true
  },
  driver_status:{
    type: DataTypes.TINYINT,
    defaultValue: 1,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
  },
  isDeleted: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
  },
}, { freezeTableName: true });



module.exports = Drivers;
