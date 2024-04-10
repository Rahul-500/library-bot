require("dotenv").config();
const { DB_NAME } = process.env;

exports.getOverdueBooksQuery = (connection, timeInterval) => {
  return new Promise((resolve, reject) => {
    try {
      const QUERY = `
                SELECT ib.*, b.title
                FROM ${DB_NAME}.${"issued_books"} ib
                JOIN ${DB_NAME}.${"books"} b ON ib.book_id = b.id
                WHERE ib.checked_out < DATE_SUB(NOW(), INTERVAL ${timeInterval} DAY)
            `;
      connection.query(QUERY, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};