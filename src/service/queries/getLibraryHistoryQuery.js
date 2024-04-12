require("dotenv").config();
const { DB_NAME } = process.env;

exports.getLibraryHistoryQuery = async (connection) => {
    try {
        const QUERY = `SELECT
      ${"users"}.name,
      ${"books"}.title,
      ${"library_history"}.checked_out,
      ${"library_history"}.returned
  FROM
      ${DB_NAME}.${"library_history"}
  JOIN
      books ON ${"library_history"}.book_id = ${"books"}.id
  JOIN
      users ON ${"library_history"}.user_id = ${"users"}.id;
  `;
        const queryPromise = new Promise((resolve, reject) => {
            connection.query(QUERY, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
        const libraryHistory = await queryPromise;
        return libraryHistory;
    } catch (error) {
        return null;
    }
};