require("dotenv").config();
const { DB_NAME } = process.env;
const transactions = require("../../service/transactions");
const constants = require("../../constants/constant");

exports.deleteBookWithQuantityQuery = async (
    message,
    connection,
    book,
    quantity
) => {
    const QUERY = `UPDATE ${DB_NAME}.${"books"} SET quantity_available = quantity_available - ${quantity} where id = ${book.id}`;
    try {
        await transactions.beginTransaction(connection);

        const queryPromise = new Promise((resolve, reject) => {
            connection.query(QUERY, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    message.reply(`Book quantity deleted successfully!`);
                    resolve(result);
                }
            });
        });

        await queryPromise;

        await transactions.commitTransaction(connection);
    } catch (error) {
        await transactions.rollbackTransaction(connection);
        message.reply(constants.UNEXPECTED_ERROR_PROCESSING_COMMAND_MESSAGE);
    }
};