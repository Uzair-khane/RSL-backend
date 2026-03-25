const sequelize = require("../config/dbconfig");
const Sequelize = require("sequelize");
const Cars = require("./car");
const { DataTypes } = Sequelize;

const CarServices = sequelize.define('car_services',{
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,      
      primaryKey: true,
    },
    car_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    interior :{
        type: DataTypes.STRING,
        allowNull: false,
    },
    seat :{
        type: DataTypes.STRING,
        allowNull: false,
    },
    player  :{
        type: DataTypes.STRING,
        allowNull: false,
    },
    wifi:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    charger:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    desk:{
        type: DataTypes.STRING,
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

Cars.hasMany(CarServices, { foreignKey: 'car_id', as: 'car_services' });
CarServices.belongsTo(Cars, { foreignKey: 'car_id', as: 'car' });

module.exports = CarServices;
