const fs = require('fs');

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: 3306,
    dialect: 'mysql',
    logging: true,
    dialectOptions: {
      bigNumberStrings: true
    }
  },
  development_server: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      bigNumberStrings: true
    }
  },
  production: {
    username: process.env.PROD_DB_USER,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOST,
    port: 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      bigNumberStrings: true
    }
  }
};