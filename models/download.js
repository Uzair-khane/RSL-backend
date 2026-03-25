const sequelize = require('../config/dbconfig');
const Sequelize = require('sequelize');
const { DataTypes } = Sequelize;
const download = sequelize.define('downloads', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    fileUrl: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    author_id: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    popup: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      docType: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
    status: {
        type: Sequelize.TINYINT,
        defaultValue: 1
      },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
}, { freezeTableName: true });

module.exports = download;