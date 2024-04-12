require("dotenv").config();
const transactions = require("../../service/transactions");
const { DB_NAME } = process.env;

exports.addReturnRequestQuery = async (connection, userId, bookId) => {
    try {
      const QUERY = `INSERT INTO ${DB_NAME}.return_request_alerts  (book_id,user_id) VALUES ('${bookId}', '${userId}')`;
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
  
      const result = await queryPromise;
      await transactions.commitTransaction(connection);
  
      return result;
    } catch (error) {
      await transactions.rollbackTransaction(connection);
      return null;
    }
  };