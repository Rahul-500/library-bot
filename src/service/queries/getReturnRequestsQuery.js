require("dotenv").config();
const { DB_NAME } = process.env;

exports.getReturnRequestsQuery = async (connection) => {
    try {
      const QUERY = `SELECT rr.id, u.id as user_id, u.name, b.id as book_id, b.title, rr.status FROM ${DB_NAME}.return_request_alerts rr JOIN ${DB_NAME}.${"users"} u ON rr.user_id = u.id JOIN ${DB_NAME}.${"books"} b ON rr.book_id = b.id;`;
      const queryPromise = new Promise((resolve, reject) => {
        connection.query(QUERY, (error, results) => {
          if (error) {
            reject(eaddReturnRequestrror);
          } else {
            resolve(results);
          }
        });addReturnRequest
      });
  
      const newReturnRequests = await queryPromise;
      return newReturnRequests;
    } catch (error) {
      return null;
    }
  };