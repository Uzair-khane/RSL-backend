const sequelize = require("../config/dbconfig");
const Sequelize = require("sequelize");
const Cars = require("./car");
const { DataTypes } = Sequelize;

const Bookings = sequelize.define('bookings', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  car_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contact_no: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  from_location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  to_location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pickup_time: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pickup_date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ride_type: {
    type: DataTypes.ENUM,
    values: ["hourly", "pr_km"],
    defaultValue: 'hourly',
  },

  price: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  distance: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  hours: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  amount_status: {
    type: DataTypes.ENUM,
    values: ["withdriver", "collected"],
    defaultValue: 'withdriver',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  booking_status: {
    type: DataTypes.ENUM,
    values: ["pending", "process","completed"],
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
}, { freezeTableName: true });

Cars.hasMany(Bookings, { foreignKey: 'car_id', as: 'car_bookings' });
Bookings.belongsTo(Cars, { foreignKey: 'car_id', as: 'car' });

module.exports = Bookings;
