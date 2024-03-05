const constants = require('../constants/constant');

exports.displayAvailableBooks = (message, books) => {
    if (books.length === 0) {
        message.reply(constants.NO_BOOKS_FOUND);
        return;
    }

    let count = 1;
    const bookList = books.map((book) => `${count++} - ${book.title}`).join('\n');

    message.reply(`${constants.AVAILABEL_BOOKS}\n${bookList}`);
}

exports.displayUserBooks = (message, books) => {
    if (books.length === 0) {
        message.reply(constants.NO_BOOKS_FOUND);
        return;
    }

    let count = 1;
    const bookList = books.map((book) => `${count++} - ${book.title}`).join('\n');

    message.reply(`${constants.MY_BOOKS}\n${bookList}`);
}