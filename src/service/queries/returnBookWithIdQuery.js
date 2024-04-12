require("dotenv").config();
const transactions = require("../../service/transactions");
const { DB_NAME } = process.env;

exports.returnBookWithIdQuery = async (connection, userId, bookId) => {
    try {
        const QUERY = `DELETE FROM ${DB_NAME}.${"issued_books"} WHERE user_id = ${userId} AND book_id = ${bookId}`;
        await transactions.beginTransaction(connection);

        const queryPromise = new Promise((resolve, reject) => {
            connection.query(QUERY, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });

        await queryPromise;
        await transactions.commitTransaction(connection);
        return true;
    } catch (error) {
        await transactions.rollbackTransaction(connection);
        return null;
    }
};