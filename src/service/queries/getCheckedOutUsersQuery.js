require("dotenv").config();
const { DB_NAME } = process.env;

exports.getCheckedOutUsersQuery = async (connection, book) => {
  try {
    const bookId = book.id;

    const QUERY = `SELECT name from ${DB_NAME}.${"users"} where id IN (SELECT user_id FROM ${DB_NAME}.${"issued_books"} WHERE book_id = ${bookId})`;

    const queryPromise = new Promise((resolve, reject) => {
      connection.query(QUERY, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
    const users = await queryPromise;
    return users;
  } catch (error) {
    return null;
  }
};