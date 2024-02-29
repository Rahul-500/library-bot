const { default: axios } = require('axios');
require('dotenv').config();
async function handleStart(message) {
    console.log(message);
    message.reply(`Welcome to the Book Library, ${message.author.username}!`);
    message.reply('Menu:\n1. Display all available books');
}

async function handleDisplayAllAvailableBooks(message) {
    try {
        const apiUrl = process.env.API_URL;
        const response = await axios.get(`${apiUrl}/api/books/available`);
        const books = response.data.data;
        const bookList = books.map((book) => `- ${book.title}`).join('\n');

        message.reply(`Available Books:\n${bookList}`);
    } catch (error) {
        message.reply('Error fetching available books. Please try again later.');
    }
}

module.exports = {
    handleStart,
    handleDisplayAllAvailableBooks
};
