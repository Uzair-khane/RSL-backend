const sequelize = require("../config/dbconfig");
const Sequelize = require("sequelize");
const Bookings = require("./booking");
const { DataTypes } = Sequelize;

const Payment = sequelize.define('payments', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  booking_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  stripe_payment_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'PKR',
  },
  payment_status: {
    type: DataTypes.ENUM,
    values: ['pending', 'completed', 'failed'],
    defaultValue: 'pending',
  },
  payment_method: {
    type: DataTypes.STRING,
    defaultValue: 'card',
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

Bookings.hasMany(Payment, { foreignKey: 'booking_id', as: 'payments' });
Payment.belongsTo(Bookings, { foreignKey: 'booking_id', as: 'booking' });

module.exports = Payment;