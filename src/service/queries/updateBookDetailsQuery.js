require("dotenv").config();
const transactions = require("../../service/transactions");
const { DB_NAME } = process.env;
const constants = require("../../constants/constant");

exports.updateBookDetailsQuery = async (
    message,
    connection,
    book,
    title,
    author,
    publishedYear,
    quantity
) => {
    try {
        await transactions.beginTransaction(connection);
        const QUERY = `
                  UPDATE ${DB_NAME}.${"books"}
                  SET title = '${title}', 
                      author = '${author}', 
                      published_year = ${publishedYear}, 
                      quantity_available = ${quantity}
                  WHERE id = ${book.id};
              `;

        const queryPromise = new Promise((resolve, reject) => {
            connection.query(QUERY, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
        const updatedResult = await queryPromise;

        await transactions.commitTransaction(connection);

        message.reply(constants.BOOK_UPDATED_MESSAGE);
    } catch (error) {
        await transactions.rollbackTransaction(connection);
        message.reply(constants.ERROR_UPDATE_BOOK_MESSAGE);
    }
};