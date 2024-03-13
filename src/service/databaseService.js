require('dotenv').config()
const transactions = require('../service/transactions')
const { DB_NAME, TABLE_NAME_BOOKS } = process.env;
const constants = require('../constants/constant')

exports.addBookToDatabase = async (message, connection, bookDetails) => {

    const { title, author, published_year, quantity_available } = bookDetails;
    const QUERY = `INSERT INTO ${DB_NAME}.${TABLE_NAME_BOOKS} (title, author, published_year, quantity_available) VALUES (?, ?, ?, ?)`;
    try {

        await transactions.beginTransaction(connection);

        const queryPromise = new Promise((resolve, reject) => {
            connection.query(QUERY, [title, author, published_year, quantity_available], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    message.reply(`Book added successfully! Title: ${title}`);
                    resolve(result);
                }
            });
        });

        await queryPromise;

        await transactions.commitTransaction(connection);

    } catch (error) {
        await transactions.rollbackTransaction(connection);
        message.reply("An unexpected error occurred while processing the command.");
    }
}

exports.deleteBookWithQuantity = async (message, connection, book, quantity) => {

    const QUERY = `UPDATE ${TABLE_NAME_BOOKS} SET quantity_available = quantity_available - ${quantity} where id = ${book.id}`
    try {

        await transactions.beginTransaction(connection)

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
        message.reply("An unexpected error occurred while processing the command.");
    }
}

exports.updateBookDetails = async (message, connection, book, title, author, publishedYear, quantity) => {
    try {
        await transactions.beginTransaction(connection)
        const QUERY = `
                UPDATE ${DB_NAME}.${TABLE_NAME_BOOKS}
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
        const updatedResult = await queryPromise

        await transactions.commitTransaction(connection);
        
        message.reply(constants.BOOK_UPDATED_MESSAGE);
    } catch (error) {
        await transactions.rollbackTransaction(connection);
        message.reply(constants.ERROR_UPDATE_BOOK_MESSAGE);
    }
}
