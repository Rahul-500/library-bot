require("dotenv").config();
const { DB_NAME } = process.env;

exports.getUserIdByUsernameQuery = async (connection, username) => {
  const QUERY = `SELECT id FROM ${DB_NAME}.${"users"} WHERE name IN (${username})`;
  try {
    const queryPromise = new Promise((resolve, reject) => {
      connection.query(QUERY, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    const userIdList = await queryPromise;
    return userIdList;
  } catch (error) {
    return null;
  }
};