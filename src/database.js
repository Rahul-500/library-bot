const mysql = require("mysql2");
const dbConfig = require("../config/db.config");

exports.connect = () => {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection(dbConfig);

    const keepAlive = () => {
      connection.query("SELECT 1", (error) => {
        if (error) {
          console.error("Error keeping connection alive:", error);
        }
      });
    };

    const keepAliveInterval = setInterval(keepAlive, 0.5 * 60 * 60 * 1000);

    connection.connect((error) => {
      if (error) {
        reject(error);
      } else {
        resolve(connection);
      }
    });

    process.on("exit", () => {
      clearInterval(keepAliveInterval);
      connection.end();
    });
  });
};
