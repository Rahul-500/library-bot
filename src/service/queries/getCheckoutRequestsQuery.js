require("dotenv").config();
const { DB_NAME } = process.env;

exports.getCheckoutRequestsQuery = async (connection) => {
    try {
      const QUERY = `SELECT cr.id, u.id as user_id, u.name, b.id as book_id, b.title, cr.status FROM ${DB_NAME}.checkout_request_alerts cr JOIN ${DB_NAME}.${"users"} u ON cr.user_id = u.id JOIN ${DB_NAME}.${"books"} b ON cr.book_id = b.id;`;
      const queryPromise = new Promise((resolve, reject) => {
        connection.query(QUERY, (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
      });
  
      const newCheckoutRequests = await queryPromise;
      return newCheckoutRequests;
    } catch (error) {
      return null;
    }
  };