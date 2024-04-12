const constants = require("../../constants/constant")
const { getAvailableBooksQuery } = require("../../service/queries/getAvailableBooksQuery");

exports.getAvailableBooks = async (message, connection, bookMap) => {
    try {
        const books = await getAvailableBooksQuery(connection)
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
