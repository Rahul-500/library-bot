require("dotenv").config();
const { DB_NAME } = process.env;

exports.getBooksByTitleQuery = async (connection, title) => {
    const QUERY = `SELECT * FROM ${DB_NAME}.${"books"} WHERE LOWER(title) LIKE LOWER('%${title}%')`;
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
  
      const books = await queryPromise;
      return books;
    } catch (error) {
      return null;
    }
  };