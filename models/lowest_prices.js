const sequelize = require("../config/dbconfig");
const Sequelize = require("sequelize");
const { DataTypes } = Sequelize;

const Lowest_Prices = sequelize.define('lowest_prices', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  price_km : {
    type :DataTypes.INTEGER,
    allowNull: false
  },
  price_hourly :  {
    type :DataTypes.INTEGER,
    allowNull: false
  }
 
}, { freezeTableName: true });

module.exports = Lowest_Prices;
