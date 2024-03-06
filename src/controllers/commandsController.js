require('dotenv').config()
const constants = require('../constants/constant')
const transactions = require('../service/transactions')
const { validateCheckout, validateReturn } = require('../service/validateBook')
const { isAdmin } = require('../service/validateUser')
const { addBookToDatabase, deleteBookWithQuantity } = require('../service/databaseService')
const { log } = require('console')
const { DB_NAME, TABLE_NAME_USERS, TABLE_NAME_BOOKS, TABLE_NAME_ISSUED_BOOKS } = process.env;

exports.start = (message, connection) => {
    const id = message.author.id;
    const QUERY = `SELECT * FROM ${DB_NAME}.${TABLE_NAME_USERS} WHERE id = ${id}`;
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
    if (isAdmin(message)) {
        message.reply(`${constants.WELCOME_MESSAGE}, ${message.author.username}!\n${constants.ADMIN_OPTIONS}`);
        return;
    }
    message.reply(`${constants.WELCOME_MESSAGE}, ${message.author.username}!\n${constants.MENU_OPTIONS}`);

}

function addUserInfo(id, author, connection) {
    const QUERY = `INSERT INTO ${DB_NAME}.${TABLE_NAME_USERS} (id, name) VALUES (${id}, '${author}')`;
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

        const books = await queryPromise;

        bookMap.clear()
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

exports.checkoutBook = async (message, connection, bookMap) => {
    const content = message.content;
    const userId = message.author.id;
    const virtualId = parseInt(content.split(' ')[1]);
    const book = bookMap.get(virtualId);
    if (!book) {
        message.reply(constants.BOOK_WITH_THAT_ID_NOT_FOUND_MESSAGE);
        return;
    }
    const bookId = book.id

    const result = await validateCheckout(connection, userId, bookId)
    if (!result) {
        message.reply(constants.ALREADY_CHECKED_OUT_BOOK_MESSAGE);
        return;
    }

    const QUERY = `INSERT INTO ${DB_NAME}.${TABLE_NAME_ISSUED_BOOKS} (user_id, book_id, checked_out) VALUES ('${userId}', '${bookId}', NOW())`;
    try {
        await transactions.beginTransaction(connection);

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

        message.reply(`${constants.CHECKED_BOOK_SUCCUESSFULLY_MESSAGE} ${book.title}`);
    } catch (error) {
        await transactions.rollbackTransaction(connection);
        message.reply(constants.ERROR_CHECKED_OUT_MESSAGE);
    }
};

exports.getUserBooks = async (message, connection, checkedOutBooks) => {
    const userId = message.author.id;
    const QUERY = `SELECT * FROM ${DB_NAME}.${TABLE_NAME_BOOKS} WHERE id in (SELECT book_id FROM ${DB_NAME}.${TABLE_NAME_ISSUED_BOOKS} WHERE user_id = ${userId} GROUP BY book_id)`;
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
            message.reply(constants.NO_CHECKED_OUT_BOOK_MESSAGE);
            return;
        }

        checkedOutBooks.clear()
        let count = 1;
        books.forEach((book) => {
            checkedOutBooks.set(count++, book);
        });

        return books
    } catch (error) {
        message.reply(constants.ERROR_FETCHING_BOOKS);
        return null;
    }
};

exports.returnBook = async (message, connection, checkedOutBooks) => {
    const content = message.content;
    const userId = message.author.id;
    const virtualId = parseInt(content.split(' ')[1]);
    const book = checkedOutBooks.get(virtualId);
    if (!book) {
        message.reply(constants.BOOK_WITH_THAT_ID_NOT_FOUND_MESSAGE);
        return;
    }
    const bookId = book.id

    const result = await validateReturn(connection, userId, bookId)
    if (!result) {
        message.reply(constants.CANNOT_RETURN_BOOK_MESSAGE);
        return;
    }

    const QUERY = `DELETE FROM ${DB_NAME}.${TABLE_NAME_ISSUED_BOOKS} WHERE user_id = ${userId} AND book_id = ${bookId}`;
    try {
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

        message.reply(`${constants.RETURN_BOOK_SUCCUESSFULLY_MESSAGE}`);
    } catch (error) {
        await transactions.rollbackTransaction(connection);
        message.reply(constants.ERROR_RETURN_MESSAGE);
    }
};

exports.addBook = async (message, connection, userEventsMap) => {
    try {

        const authorId = message.author.id;
        await message.reply(constants.BOOK_DETAILS_PROMPT_MESSAGE);

        const collector = message.channel.createMessageCollector();
        let bookDetails = {}

        userEventsMap.get(authorId).messageCreate = false;

        collector.on('collect', async (response) => {
            const details = response.content.split(';').map(detail => detail.trim());
            const [title, author, publishedYear, quantityAvailable] = details;
            const parsedPublishedYear = parseInt(publishedYear);
            const parsedQuantityAvailable = parseInt(quantityAvailable);

            if ((title && author && publishedYear && quantityAvailable) && !Number.isNaN(parsedPublishedYear) && !Number.isNaN(parsedQuantityAvailable)) {
                bookDetails = {
                    title,
                    author,
                    published_year: parsedPublishedYear,
                    quantity_available: parsedQuantityAvailable,
                };

                message.reply(constants.ADD_BOOK_DETAILS_RECEIVED_MESSAGE);
                await addBookToDatabase(message, connection, bookDetails);
            } else {
                message.reply(constants.INVALID_DETAILS_MESSAGE);
            }
            collector.stop();
            userEventsMap.get(authorId).messageCreate = true;
        });

    } catch (error) {
        message.reply(constants.UNEXPECTED_ERROR_MESSAGE);
    }
};

exports.deleteBook = async (message, connection, bookMap, userEventsMap) => {
    try {
        const authorId = message.author.id;

        await message.reply(constants.DELETE_BOOK_PROMPT_MESSAGE);

        const collector = message.channel.createMessageCollector();

        userEventsMap.get(authorId).messageCreate = false;

        collector.on('collect', async (response) => {
            const details = response.content.split(';').map(detail => detail.trim());
            const [virtualId, quantity] = details;
            const parsedVirtualId = parseInt(virtualId);
            const parsedQuantity = parseInt(quantity);

            const book = bookMap.get(parsedVirtualId)

            if (Number.isNaN(parsedVirtualId) || Number.isNaN(parsedQuantity)) {
                message.reply(constants.INVALID_DETAILS_MESSAGE);
            }
            else if (!bookMap.has(parsedVirtualId)) {
                message.reply(constants.INVALID_BOOK_ID_MESSAGE);
            }
            else if (parsedQuantity > book.quantity_available) {
                message.reply(constants.QUANTITY_NOT_IN_LIMIT_MESSAGE);
            }
            else {
                message.reply(constants.DELETE_BOOK_DETAILS_RECEIVED_MESSAGE);

                await deleteBookWithQuantity(message, connection, book, parsedQuantity)
            }

            collector.stop();
            userEventsMap.get(authorId).messageCreate = true;
        });

    } catch (error) {
        message.reply(constants.UNEXPECTED_ERROR_MESSAGE);
    }
};

exports.help = (message, isAdmin) => {
    let helpMessage = '';

    if (isAdmin) {
        helpMessage = constants.ADMIN_COMMANDS;
    }

    helpMessage += constants.USER_COMMANDS
    message.reply(helpMessage);
};

