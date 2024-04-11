require("dotenv").config();
const { DB_NAME } = process.env;

exports.getOverdueBookIntervalQuery = async (connection) => {
    return new Promise((resolve, reject) => {
        try {
            const QUERY = `
          SELECT setting_value
          FROM ${DB_NAME}.app_settings
          WHERE setting_name = 'overdue_books_interval'; `;
            connection.query(QUERY, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
};