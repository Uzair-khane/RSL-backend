const sequelize = require("../config/dbconfig");
const Sequelize = require("sequelize");
const Bookings = require("./booking");

const { DataTypes } = Sequelize;

const RideRoute = sequelize.define("ride_routes", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    booking_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    start_latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
    },

    start_longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
    },

    end_latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
    },

    end_longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
    },

    distance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },

    duration: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    route_polyline: {
        type: DataTypes.TEXT,
        allowNull: true,
    },

    status: {
        type: DataTypes.ENUM("pending", "started", "completed"),
        defaultValue: "pending",
    },

    isDeleted: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
    },
}, {
    freezeTableName: true
});

Bookings.hasMany(RideRoute, {
    foreignKey: "booking_id",
    as: "ride_routes"
});

RideRoute.belongsTo(Bookings, {
    foreignKey: "booking_id",
    as: "booking"
});

module.exports = RideRoute;