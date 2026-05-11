const sequelize = require("../config/dbconfig");
const Sequelize = require("sequelize");
const Drivers = require("./driver");
const Bookings = require("./booking");
const { DataTypes } = Sequelize;

const DriverLocation = sequelize.define('driver_locations', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  driver_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  booking_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
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
}, { freezeTableName: true });

Drivers.hasMany(DriverLocation, { foreignKey: 'driver_id', as: 'locations' });
DriverLocation.belongsTo(Drivers, { foreignKey: 'driver_id', as: 'driver' });

Bookings.hasMany(DriverLocation, { foreignKey: 'booking_id', as: 'locations' });
DriverLocation.belongsTo(Bookings, { foreignKey: 'booking_id', as: 'booking' });

module.exports = DriverLocation;