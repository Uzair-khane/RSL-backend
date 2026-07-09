const sequelize = require("../config/dbconfig");
const Sequelize = require("sequelize");

const { DataTypes } = Sequelize;

const AiRecommendationLog = sequelize.define(
    "ai_recommendation_logs",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        ride_type: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        from_location: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        to_location: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        recommendation_type: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        recommended_car_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        recommended_car_title: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        confidence: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },

        reasons: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        previous_bookings_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        freezeTableName: true,
    }
);

module.exports = AiRecommendationLog;