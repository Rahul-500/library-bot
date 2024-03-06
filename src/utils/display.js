const constants = require('../constants/constant');
const {isAdmin} = require('../service/validateUser')
const {EmbedBuilder} = require('discord.js')

exports.welcomeMessage = (message,) =>{

        const embedColor = 0x0099FF;
        const menuOptions = isAdmin(message)
            ? constants.ADMIN_OPTIONS
            : constants.MENU_OPTIONS;

        const welcomeMessage = `${constants.WELCOME_MESSAGE}, ${message.author.username}!`;

        const embed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle('📚 Book Library Menu')
            .setDescription(welcomeMessage)
            .addFields(
                { name: 'Options', value: menuOptions, inline: false },
                { name: 'How to use', value: 'Type `!help` to get list of commands' }
            )
            .setFooter({ text: 'Enjoy your time in the Book Library!' });

        message.reply({ embeds: [embed] });
}

exports.availableBooks = (message, books) => {
    if (books.length === 0) {
        message.reply(constants.NO_BOOKS_FOUND);
        return;
    }

    let count = 1;
    const bookList = books.map((book) => `${count++} - ${book.title}`).join('\n');

    message.reply(`${constants.AVAILABEL_BOOKS}\n${bookList}`);
}

exports.userBooks = (message, books) => {
    if (books.length === 0) {
        message.reply(constants.NO_BOOKS_FOUND);
        return;
    }

    let count = 1;
    const bookList = books.map((book) => `${count++} - ${book.title}`).join('\n');

    message.reply(`${constants.MY_BOOKS}\n${bookList}`);
}

exports.availableBooksWithQuantity = (message, books) => {
    if (books.length === 0) {
        message.reply(constants.NO_BOOKS_FOUND);
        return;
    }

    let count = 1;
    const bookList = books.map((book) => `${count++} - ${book.title} - ${book.quantity_available}`).join('\n');

    message.reply(`${constants.MY_BOOKS}\n${bookList}`);
}