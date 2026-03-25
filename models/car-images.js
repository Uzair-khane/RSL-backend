const sequelize = require("../config/dbconfig");
const Sequelize = require("sequelize");
const Cars = require("./car");
const { DataTypes } = Sequelize;

const CarImages = sequelize.define(
  "car_images",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    car_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    image: {
      type: DataTypes.JSON,
      allowNull: false,
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
  },
  { freezeTableName: true }
);

Cars.hasMany(CarImages, { foreignKey: "car_id", as: "car_images" });
CarImages.belongsTo(Cars, { foreignKey: "car_id", as: "car" });

module.exports = CarImages;
