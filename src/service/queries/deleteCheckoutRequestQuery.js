require("dotenv").config();
const transactions = require("../../service/transactions");
const { DB_NAME } = process.env;

exports.deleteCheckoutRequestQuery = async (connection, checkoutRequestId) => {
    const QUERY = `DELETE FROM ${DB_NAME}.checkout_request_alerts WHERE id=${checkoutRequestId};`;
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