const constants = require('../constants/constant')

exports.start = (message, connection) => {
    const id = message.author.id;
    const QUERY = `SELECT * FROM library.users WHERE id = ${id}`;
    connection.query(QUERY, (error, result) => {
        if (error) {
            message.reply(constants.ERROR_FETCHING_USER);
            return;
        }
        const user = result;
        if(user.length == 0){
            const author = message.author.username;
            addUserInfo(id, author, connection);   
        }
    });
    message.reply(`${constants.WELCOME_MESSAGE}, ${message.author.username}!`);
    message.reply(constants.MENU_OPTIONS);
}

function addUserInfo(id, author, connection){
    const QUERY = `INSERT INTO library.users (id, name) VALUES (${id}, '${author}')`;
    connection.query(QUERY);
}

exports.getAvailableBooks = (message, connection) => {
    const QUERY = 'SELECT * FROM library.books WHERE quantity_available > 0';
    try {
        connection.query(QUERY, (error, results) => {
            if (error) {
                message.reply(constants.ERROR_FETCHING_BOOKS);
                return;
            }
            const books = results;
            if (books.length === 0) {
                message.reply(constants.NO_BOOKS_FOUND);
                return;
            }
            const bookList = books.map((book) => `- ${book.title}`).join('\n');
            message.reply(`${constants.AVAILABEL_BOOKS}\n${bookList}`);
        });
    } catch (error) {
        console.error('Error:', error);
        message.reply(constants.ERROR_FETCHING_BOOKS);
    }
};
