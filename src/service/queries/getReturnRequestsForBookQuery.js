require("dotenv").config();
const { DB_NAME } = process.env;

exports.getReturnRequestsForBookQuery = async (connection, bookId) => {
    try {
      const QUERY = `SELECT user_id from ${DB_NAME}.return_request_alerts where book_id = ${bookId} and status = 'pending'`;
  
      const queryPromise = new Promise((resolve, reject) => {
        connection.query(QUERY, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
      const userIds = await queryPromise;
      return userIds;
    } catch (error) {
      return null;
    }
  };