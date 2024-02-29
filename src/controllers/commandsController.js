const constants = require('../constants/constant')

exports.start = (message) => {
    message.reply(`${constants.WELCOME_MESSAGE}, ${message.author.username}!`);
    message.reply(constants.MENU_OPTIONS);
}

exports.getAvailableBooks = async (message, connection) => {
    try {
        const QUERY = 'SELECT * FROM library.books WHERE quantity_available > 0';
        const ERROR_FETCHING_BOOKS = "Error fetching available books. Please try again later.";
        const NO_BOOKS_FOUND = 'No available books found.';
        const AVAILABEL_BOOKS = "Available Books:";

        connection.query(QUERY, (error, results) => {
            if (error) {
                message.reply(ERROR_FETCHING_BOOKS);
                return;
            }
            const books = results;
            if (books.length === 0) {
                message.reply(NO_BOOKS_FOUND);
                return;
            }
            const bookList = books.map((book) => `- ${book.title}`).join('\n');
            message.reply(`${AVAILABEL_BOOKS}\n${bookList}`);


        });
    } catch (error) {
        console.error('Error:', error);
        message.reply(ERROR_FETCHING_BOOKS);
    }
};
