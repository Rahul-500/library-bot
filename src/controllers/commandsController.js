require('dotenv').config()
const constants = require('../constants/constant')
const transactions = require('../service/transactions')
const { validateCheckout, validateReturn } = require('../service/validateBook')
const { addBookToDatabase, deleteBookWithQuantity, updateBookDetails,addUserInfo} = require('../service/databaseService')
const { DB_NAME, TABLE_NAME_USERS, TABLE_NAME_BOOKS, TABLE_NAME_ISSUED_BOOKS, TABLE_NAME_LIBRARY_HISTORY } = process.env;

exports.start = async (message, connection) => {
    try {
        const id = message.author.id;
        const QUERY = `SELECT * FROM ${DB_NAME}.${TABLE_NAME_USERS} WHERE id = ${id}`;
        const queryPromise = new Promise((resolve, reject) => {
            connection.query(QUERY, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
        const user = await queryPromise;
        if (user.length == 0) {
            const author = message.author.username;
            await addUserInfo(id, author, connection);
        }
        return user;
    } catch (error) {
        message.reply(constants.ERROR_FETCHING_USER);
        return null;
    }
}

exports.getAvailableBooks = async (message, connection, bookMap) => {
    try {
        const QUERY = `SELECT * FROM ${DB_NAME}.${TABLE_NAME_BOOKS} WHERE quantity_available > 0`;
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
    const QUERY = `
    SELECT b.*, i.checked_out 
    FROM ${DB_NAME}.${TABLE_NAME_BOOKS} AS b
    INNER JOIN ${DB_NAME}.${TABLE_NAME_ISSUED_BOOKS} AS i
    ON b.id = i.book_id
    WHERE i.user_id = ${userId}
`;
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
        let bookDetails = {};

        userEventsMap.get(authorId).messageCreate = false;

        collector.on('collect', async (response) => {
            if (response.content.toLowerCase() === 'exit') {
                message.reply(constants.EXIT_ADD_MESSAGE);
                collector.stop();
                return;
            }

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
            collector.stop()
        });

        collector.on('end', () => {
            userEventsMap.get(authorId).messageCreate = true;
        });

    } catch (error) {
        message.reply(constants.UNEXPECTED_ADD_ERROR_MESSAGE);
        collector.stop();
    }
};

exports.deleteBook = async (message, connection, bookMap, userEventsMap) => {
    try {
        const authorId = message.author.id;

        await message.reply(constants.DELETE_BOOK_PROMPT_MESSAGE);

        const collector = message.channel.createMessageCollector();

        userEventsMap.get(authorId).messageCreate = false;

        const regexPatternForNumber = /^\d+$/;
        collector.on('collect', async (response) => {
            if (response.content.toLowerCase() === 'exit') {
                message.reply(constants.EXIT_REMOVE_MESSAGE);
                collector.stop();
                return;
            }

            const details = response.content.split(';').map(detail => detail.trim());
            const [virtualId, quantity] = details;
            const parsedVirtualId = parseInt(virtualId);
            const parsedQuantity = parseInt(quantity);

            const book = bookMap.get(parsedVirtualId)

            if (!regexPatternForNumber.test(virtualId) || !regexPatternForNumber.test(quantity)) {
                message.reply(constants.INVALID_DELETE_DETAILS_MESSAGE);
            }
            else if (!bookMap.has(parsedVirtualId)) {
                message.reply(constants.INVALID_DELETE_BOOK_ID_MESSAGE);
            }
            else if (parsedQuantity > book.quantity_available) {
                message.reply(constants.QUANTITY_NOT_IN_LIMIT_MESSAGE);
            }
            else {
                message.reply(constants.DELETE_BOOK_DETAILS_RECEIVED_MESSAGE);

                await deleteBookWithQuantity(message, connection, book, parsedQuantity)
            }

            collector.stop();
        });

        collector.on('end', () => {
            userEventsMap.get(authorId).messageCreate = true;
        });

    } catch (error) {
        message.reply(constants.UNEXPECTED_DELETE_ERROR_MESSAGE);
        collector.stop();
    }
};

exports.updateBook = async (message, connection, books, userEventsMap) => {
    try {
        const authorId = message.author.id;

        await message.reply(constants.UPDATE_BOOK_ID_PROMPT_MESSAGE);
        const collector = message.channel.createMessageCollector();
        userEventsMap.get(authorId).messageCreate = false;
        const regexPatternForNumber = /^\d+$/;

        collector.on('collect', async (response) => {
            if (response.content.toLowerCase() === 'exit') {
                message.reply(constants.EXIT_REMOVE_MESSAGE);
                collector.stop();
                return;
            }

            const bookId = parseInt(response.content);
            const book = books.get(bookId);

            if (!book) {
                message.reply(constants.INVALID_BOOK_ID_MESSAGE);
                collector.stop();
                return;
            }

            collector.stop();
            userEventsMap.get(authorId).messageCreate = true;
            await message.reply(constants.UPDATE_BOOK_PROMPT_MESSAGE);
            userEventsMap.get(authorId).messageCreate = false;

            const updateCollector = message.channel.createMessageCollector();

            updateCollector.on('collect', async (updateResponse) => {
                if (updateResponse.content.toLowerCase() === 'exit') {
                    message.reply(constants.EXIT_UPDATE_MESSAGE);
                    updateCollector.stop();
                    return;
                }

                const details = updateResponse.content.split(';').map(detail => detail.trim());
                const [title, author, publishedYear, quantity] = details;

                const updatedTitle = title !== '' ? title : book.title;
                const updatedAuthor = author !== '' ? author : book.author;
                const updatedPublishedYear = publishedYear !== '' ? parseInt(publishedYear) : book.published_year;
                const updatedQuantity = quantity !== '' ? parseInt(quantity) : book.quantity_available;

                if (!regexPatternForNumber.test(updatedPublishedYear) || !regexPatternForNumber.test(updatedQuantity)) {
                    message.reply(constants.INVALID_UPDATE_DETAILS_MESSAGE);
                } else {
                    message.reply(constants.UPDATE_BOOK_DETAILS_RECEIVED_MESSAGE);
                    await updateBookDetails(message, connection, book, updatedTitle, updatedAuthor, updatedPublishedYear, updatedQuantity);
                }

                updateCollector.stop();
            });

            updateCollector.on('end', () => {
                userEventsMap.get(authorId).messageCreate = true;
            });
        });

        collector.on('end', () => {
            userEventsMap.get(authorId).messageCreate = true;
        });

    } catch (error) {
        message.reply(constants.UNEXPECTED_UPDATE_ERROR_MESSAGE);
    }
};

exports.getLibraryHistory = async (message, connection) => {
    try {

        const QUERY = `SELECT
        ${TABLE_NAME_USERS}.name,
        ${TABLE_NAME_BOOKS}.title,
        ${TABLE_NAME_LIBRARY_HISTORY}.checked_out,
        ${TABLE_NAME_LIBRARY_HISTORY}.returned
    FROM
        ${DB_NAME}.${TABLE_NAME_LIBRARY_HISTORY}
    JOIN
        books ON ${TABLE_NAME_LIBRARY_HISTORY}.book_id = ${TABLE_NAME_BOOKS}.id
    JOIN
        users ON ${TABLE_NAME_LIBRARY_HISTORY}.user_id = ${TABLE_NAME_USERS}.id;
    `;
        const queryPromise = new Promise((resolve, reject) => {
            connection.query(QUERY, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        const libraryHistory = await queryPromise;


        return libraryHistory;

    } catch (error) {
        message.reply(constants.ERROR_FETCHING_LIBRARY_HISTORY);
        return null;
    }
}

exports.help = (message, isAdmin) => {
    let helpMessage = '';

    if (isAdmin) {
        helpMessage = constants.ADMIN_COMMANDS;
    }

    helpMessage += constants.USER_COMMANDS
    message.reply(helpMessage);
};

