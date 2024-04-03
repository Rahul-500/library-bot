const { getAvailableBooks } = require("../../service/databaseService");
const constants = require("../../constants/constant")
exports.getAvailableBooks = async (message, connection, bookMap) => {
    try {
        const books = await getAvailableBooks(connection)
        if (!books) {
            throw new Error('Error: executing book query')
        }
        bookMap.clear();
        let count = 1;
        books.forEach((book) => {
            bookMap.set(count++, book);
        });

        return books;
    } catch (error) {
        message.reply(constants.ERROR_FETCHING_BOOKS);
        return null;
    }
};
