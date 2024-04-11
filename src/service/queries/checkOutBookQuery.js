require("dotenv").config();
const transactions = require("../../service/transactions");
const { DB_NAME } = process.env;

exports.checkOutBookQuery = async (connection, userId, bookId) => {
    const QUERY = `INSERT INTO ${DB_NAME}.${"issued_books"} (user_id, book_id, checked_out) VALUES ('${userId}', '${bookId}', NOW())`;
    try {
      await transactions.beginTransaction(connection);
  
      const queryPromise = new Promise((resolve, reject) => {
        connection.query(QUERY, (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
      });
  
      const checkout = await queryPromise;
      await transactions.commitTransaction(connection);
      return checkout;
    } catch (error) {
      await transactions.rollbackTransaction(connection);
      return null;
    }
  };