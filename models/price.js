const sequelize = require("../config/dbconfig");
const Sequelize = require("sequelize");
const Cars = require("./car");
const { DataTypes } = Sequelize;

const Price = sequelize.define('prices',{
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,      
      primaryKey: true,
    },
    car_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    km_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    hourly_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },   
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
    isDeleted: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },
  },{ freezeTableName: true });

Cars.hasMany(Price, { foreignKey: 'car_id', as: 'car_price' });
Price.belongsTo(Cars, { foreignKey: 'car_id', as: 'car' });

module.exports = Price;
