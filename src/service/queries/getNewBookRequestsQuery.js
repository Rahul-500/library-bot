require("dotenv").config();
const { DB_NAME } = process.env;

exports.getNewBookRequestsQuery = async (connection) => {
  try {
    const QUERY = `SELECT br.id,br.user_id,u.name,br.description,br.status
          FROM ${DB_NAME}.${"users"} u
          INNER JOIN ${DB_NAME}.book_request_alerts br ON u.id = br.user_id;`;
    const queryPromise = new Promise((resolve, reject) => {
      connection.query(QUERY, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    const newBookRequests = await queryPromise;
    return newBookRequests;
  } catch (error) {
    return null;
  }
};