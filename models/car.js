const sequelize = require("../config/dbconfig");
const Sequelize = require("sequelize");
const { DataTypes } = Sequelize;

const Cars = sequelize.define(
  "cars",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    registration_no: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vehicle_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    model_year: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passengers: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    luggage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    banner_image_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    car_status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
    isDeleted: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },
  },
  { freezeTableName: true }
);

module.exports = Cars;
