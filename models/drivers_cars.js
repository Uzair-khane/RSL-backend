const sequelize = require("../config/dbconfig");
const Sequelize = require("sequelize");
const Drivers = require("./driver");
const Cars = require("./car");
const { DataTypes } = Sequelize;

const Drivers_Cars = sequelize.define('drivers_cars', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  car_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  driver_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  is_available: {
    type: Sequelize.TINYINT,
    defaultValue: true,
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

Drivers.hasMany(Drivers_Cars, { foreignKey: 'driver_id', as: 'driver_cars' });
Drivers_Cars.belongsTo(Drivers, { foreignKey: 'driver_id', as: 'driver' });

Cars.hasMany(Drivers_Cars, { foreignKey: 'car_id', as: 'driver_cars' });
Drivers_Cars.belongsTo(Cars, { foreignKey: 'car_id', as: 'car' });

module.exports = Drivers_Cars;
