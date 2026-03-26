const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
// DB conn. of node with mysql using sequelize
const db = {};
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  logging: config.logging
});
  sequelize
    .authenticate()
    .then(() => {
      console.log('Connected successfully to the database.');
    })
    .catch(err => {
      console.error('Unable to connect to the database.');
    });

db.sequelize = sequelize;

module.exports = sequelize;
