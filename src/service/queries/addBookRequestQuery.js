require("dotenv").config();
const transactions = require("../../service/transactions");
const { DB_NAME } = process.env;

exports.addBookRequestQuery = async (connection, bookRequest, message) => {
    try {
        const userId = message.author.id;
        await transactions.beginTransaction(connection);
        const QUERY = `INSERT INTO ${DB_NAME}.book_request_alerts(user_id, description) VALUES('${userId}', '${bookRequest}')`;
        const queryPromise = new Promise((resolve, reject) => {
            connection.query(QUERY, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
        await queryPromise;
        await transactions.commitTransaction(connection);
    } catch (error) {
        await transactions.rollbackTransaction(connection);
    }
};