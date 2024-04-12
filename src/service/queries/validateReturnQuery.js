require("dotenv").config();
const { DB_NAME } = process.env;

exports.validateReturnQuery = (connection, userId, bookId) => {
    const QUERY = `SELECT COUNT(book_id) AS bookCount
      FROM (
          SELECT book_id
          FROM ${DB_NAME}.${"issued_books"}
          WHERE user_id = ${userId}
          GROUP BY book_id
      ) AS subquery
      WHERE book_id = ${bookId};
      `;
    return new Promise((resolve, reject) => {
      connection.query(QUERY, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result[0].bookCount > 0);
        }
      });
    });
  };