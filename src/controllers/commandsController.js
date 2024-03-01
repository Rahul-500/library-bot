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
        if (user.length == 0) {
            const author = message.author.username;
            addUserInfo(id, author, connection);
        }
    });
    message.reply(`${constants.WELCOME_MESSAGE}, ${message.author.username}!`);
    message.reply(constants.MENU_OPTIONS);
}

function addUserInfo(id, author, connection) {
    const QUERY = `INSERT INTO library.users (id, name) VALUES (${id}, '${author}')`;
    connection.query(QUERY);
}

exports.getAvailableBooks = async (message, connection, bookMap) => {
    const QUERY = 'SELECT * FROM library.books WHERE quantity_available > 0';
    try {
        const queryPromise = new Promise((resolve, reject) => {
            connection.query(QUERY, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        const results = await queryPromise;

        const books = results;
        if (books.length === 0) {
            message.reply(constants.NO_BOOKS_FOUND);
            return;
        }

        let count = 1;
        const bookList = books.map((book) => `${count++} - ${book.title}`).join('\n');
        count = 1;

        books.forEach((book) => {
            bookMap.set(count++, book);
        });

        message.reply(`${constants.AVAILABEL_BOOKS}\n${bookList}`);
    } catch (error) {
        message.reply(constants.ERROR_FETCHING_BOOKS);
    }
};
