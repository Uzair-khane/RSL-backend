const sequelize = require("../config/dbconfig");
const Sequelize = require("sequelize");
const { DataTypes } = Sequelize;

const DriverApplication = sequelize.define('driver_applications', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },

    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    mobile_no: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    cnic: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    application_type: {
        type: DataTypes.ENUM('partner', 'rider'),
        allowNull: false,
        defaultValue: 'partner',
    },

    vehicle: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    passport_file: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    license_file: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    application_status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
    },

    status: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
    },

    isDeleted: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
    },
}, {
    freezeTableName: true
});

module.exports = DriverApplication;