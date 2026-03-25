const sequelize = require("../config/dbconfig");
const Sequelize = require("sequelize");
const Drivers_Cars = require("./drivers_cars");
const Bookings = require("./booking");
const { DataTypes } = Sequelize;

const DriverRides = sequelize.define('driver_rides',{
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,     
      primaryKey: true,
    },
    driver_car_id:{
        type: DataTypes.STRING,
        allowNull: false
    },
    booking_id:{
        type: DataTypes.STRING,
        allowNull: false
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

  Drivers_Cars.hasMany(DriverRides, { foreignKey: 'driver_car_id', as: 'rides' });
  DriverRides.belongsTo(Drivers_Cars, { foreignKey: 'driver_car_id', as: 'driver_car' });
  
  Bookings.hasMany(DriverRides, { foreignKey: 'booking_id', as: 'driver_rides' });
  DriverRides.belongsTo(Bookings, { foreignKey: 'booking_id', as: 'booking' });

module.exports = DriverRides;
