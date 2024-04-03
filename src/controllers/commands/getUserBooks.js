const { getUserBooks } = require("../../service/databaseService");
const constants = require("../../constants/constant")

exports.getUserBooks = async (message, connection, checkedOutBooks) => {
    try {
        const userId = message.author.id;
        const books = await getUserBooks(connection, userId)
        if (!books) {
            throw new Error("Error: executing user book query")
        }
        if (books.length === 0) {
            message.reply(constants.NO_CHECKED_OUT_BOOK_MESSAGE);
            return;
        }
        checkedOutBooks.clear();
        let count = 1;
        books.forEach((book) => {
            checkedOutBooks.set(count++, book);
        });

        return books;
    } catch (error) {
        message.reply(constants.ERROR_FETCHING_BOOKS);
        return null;
    }
};
