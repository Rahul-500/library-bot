const constants = require('../constants/constant');
const { EmbedBuilder } = require('discord.js')

exports.welcomeMessage = (message, validateUser) => {

    const menuOptions = validateUser.isAdmin(message) ? constants.ADMIN_OPTIONS : constants.MENU_OPTIONS;
    const welcomeMessage = `${constants.WELCOME_MESSAGE}, ${message.author.username}!`;

    const embed = new EmbedBuilder()
        .setColor(constants.EMBED_COLOR)
        .setTitle(constants.MENU_TITLE)
        .setDescription(welcomeMessage)
        .addFields(
            { name: 'Options', value: menuOptions, inline: false },
            { name: 'How to use', value: constants.HELP_MESSAGE }
        )
        .setFooter({ text: constants.FOOTER_TEXT });

    message.reply({ embeds: [embed] });
};


exports.availableBooks = (message, books) => {
    if (books.length === 0) {
        const embed = new EmbedBuilder()
            .setTitle(constants.NO_BOOKS_FOUND)
            .setColor('#FF0000')
            .setDescription(constants.SORRY_MESSAGE);

        message.reply({ embeds: [embed] });
        return;
    }

    const formattedBooks = books.map((book, index) => `${index + 1}. \u2003\u2003${book.title}`).join('\n');

    const embed = new EmbedBuilder()
        .setTitle(constants.AVAILABEL_BOOKS)
        .setColor('#00FF00')
        .addFields({
            name: `ID\u2003\u2003Title`,
            value: formattedBooks,
            inline: true
        });

    message.reply({ embeds: [embed] });
}

exports.userBooks = (message, books) => {
    if (books.length === 0) {
        const embed = new EmbedBuilder()
            .setTitle(constants.NO_BOOKS_FOUND)
            .setColor('#FF0000')
            .setDescription(constants.SORRY_MESSAGE);

        message.reply({ embeds: [embed] });
        return;
    }

    const formattedBooks = books.map((book, index) => `${index + 1}. \u2003\u2003${book.title}`).join('\n');

    const embed = new EmbedBuilder()
        .setTitle(constants.MY_BOOKS)
        .setColor('#00FF00')
        .addFields({
            name: `ID\u2003\u2003Title`,
            value: formattedBooks,
            inline: true
        });

    message.reply({ embeds: [embed] });
}

exports.availableBooksWithQuantity = (message, books) => {
    if (books.length === 0) {
        const embed = new EmbedBuilder()
            .setTitle(constants.NO_BOOKS_FOUND)
            .setColor('#FF0000')
            .setDescription(constants.SORRY_MESSAGE);

        message.reply({ embeds: [embed] });
        return;
    }

    const data = [];
    data.push(['ID', 'Title', 'Quantity']);

    books.forEach((book, index) => {
        data.push([`${index + 1}.`, book.title, book.quantity_available]);
    });

    const embed = new EmbedBuilder()
        .setTitle(constants.AVAILABEL_BOOKS)
        .setColor('#00FF00')
        .addFields({ name: '\u200B', value: '```\n' + this.createTable(data) + '```' });

    message.reply({ embeds: [embed] });
}

exports.createTable = (data) => {
    const columnWidths = [];
    for (let i = 0; i < data[0].length; i++) {
        let maxWidth = 0;
        for (let j = 0; j < data.length; j++) {
            const cellWidth = data[j][i].toString().length;
            if (cellWidth > maxWidth) {
                maxWidth = cellWidth;
            }
        }
        columnWidths.push(maxWidth);
    }

    let table = '';
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            const cell = data[i][j].toString().padEnd(columnWidths[j], ' ');
            table += cell + ' '.repeat(2);
        }
        table += '\n';
    }

    return table;
}