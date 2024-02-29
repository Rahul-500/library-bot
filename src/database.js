
const mysql = require('mysql2');
const dbConfig = require('../config/db.config');

exports.connect = () => {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection(dbConfig);

    connection.connect((error) => {
      if (error) {
        reject(error);
      } else {
        console.log('Connected to MySQL database!');
        resolve(connection);
      }
    });
  });
};
