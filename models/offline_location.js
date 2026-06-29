const sequelize = require("../config/dbconfig");
const Sequelize = require("sequelize");
const Drivers = require("./driver");
const Bookings = require("./booking");
const { DataTypes } = Sequelize;

const OfflineLocation = sequelize.define('offline_locations', {
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
    accuracy: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    recorded_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    synced_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
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

Drivers.hasMany(OfflineLocation, { foreignKey: 'driver_id', as: 'offline_locations' });
OfflineLocation.belongsTo(Drivers, { foreignKey: 'driver_id', as: 'driver' });

Bookings.hasMany(OfflineLocation, { foreignKey: 'booking_id', as: 'offline_locations' });
OfflineLocation.belongsTo(Bookings, { foreignKey: 'booking_id', as: 'booking' });

module.exports = OfflineLocation;