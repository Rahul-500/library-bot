const transactions = require("../../service/transactions");
const { DB_NAME } = process.env;
const constants = require("../../constants/constant");

exports.setOverdueBookIntervalQuery = async (connection, timeInterval) => {
    try {
        await transactions.beginTransaction(connection);

        const QUERY = `
            UPDATE ${DB_NAME}.app_settings
            SET setting_value = ${timeInterval}
            WHERE setting_name = 'overdue_books_interval';
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

        const updatedResult = await queryPromise;

        await transactions.commitTransaction(connection);

        return updatedResult;
    } catch (error) {
        await transactions.rollbackTransaction(connection);
        throw error;
    }
};
