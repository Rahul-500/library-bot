require('dotenv').config()
const transactions = require('../service/transactions')
const { DB_NAME, TABLE_NAME_BOOKS } = process.env;

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
                    message.reply(`Book added successfully! ID: ${result.insertId}, Title: ${title}`);
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
