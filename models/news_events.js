const sequelize = require("../config/dbconfig");
const Sequelize = require("sequelize");
const { DataTypes } = Sequelize;

const News_Events = sequelize.define('news_events', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },  
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  }, 
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  }, 
  type: {
    type: DataTypes.ENUM,
    values: ["news", "event"],
    defaultValue: 'news',
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

module.exports = News_Events;
