const sequelize = require("../config/dbconfig");
const Sequelize = require("sequelize");
const { DataTypes } = Sequelize;

const SafetyAlert = sequelize.define('safety_alerts', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  booking_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  driver_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  alert_type: {
    type: DataTypes.ENUM('sos', 'breakdown', 'misbehaviour'),
    allowNull: false,
  },

  message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  reason: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  driver_phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },

  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },

  status: {
    type: DataTypes.ENUM('pending', 'resolved'),
    defaultValue: 'pending',
  },
}, {
  freezeTableName: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = SafetyAlert;