require("dotenv").config();
const transactions = require("../../service/transactions");
const { DB_NAME } = process.env;

exports.deleteReturnRequestQuery = async (connection, returnRequestId) => {
    const QUERY = `DELETE FROM ${DB_NAME}.return_request_alerts WHERE id=${returnRequestId};`;
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
  
      const result = await queryPromise;
      await transactions.commitTransaction(connection);
      return result;
    } catch (error) {
      await transactions.rollbackTransaction(connection);
      return null;
    }
  };