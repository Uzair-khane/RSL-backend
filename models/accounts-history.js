const sequelize = require("../config/dbconfig");
const Sequelize = require("sequelize");
const Drivers = require("./driver");
const { DataTypes } = Sequelize;

const AccountHistory = sequelize.define(
  "accounts-history",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    driver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_amount: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    received_amount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    remaining_amount: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    is_remaining: {
      type: DataTypes.TINYINT,
      default: 1,
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
  },
  { freezeTableName: true }
);

AccountHistory.belongsTo(Drivers, { foreignKey: "driver_id", as: "driver" });
Drivers.hasMany(AccountHistory, { foreignKey: "driver_id", as: "histories" });
module.exports = AccountHistory;
