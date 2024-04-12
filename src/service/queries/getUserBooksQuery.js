require("dotenv").config();
const { DB_NAME } = process.env;

exports.getUserBooksQuery = async (connection, userId) => {
    try {
      const QUERY = `
  SELECT b.*, i.checked_out 
  FROM ${DB_NAME}.${"books"} AS b
  INNER JOIN ${DB_NAME}.${"issued_books"} AS i
  ON b.id = i.book_id
  WHERE i.user_id = ${userId}
  `;
      const queryPromise = new Promise((resolve, reject) => {
        connection.query(QUERY, (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
      });
      const books = await queryPromise;
      return books;
    } catch (error) {
      return null;
    }
  };
  