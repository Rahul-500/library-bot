const constants = require('../constants/constant');

const { ActionRowBuilder, EmbedBuilder, ButtonStyle, ComponentType } = require('discord.js')


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

exports.availableBooks = async (message, books) => {
    if (books.length === 0) {
        const embed = new EmbedBuilder()
            .setTitle(constants.NO_BOOKS_FOUND)
            .setColor('#FF0000')
            .setDescription(constants.SORRY_MESSAGE);

        message.reply({ embeds: [embed] });
        return;
    }

    let formattedBooks = '';
    books.forEach((book, index) => {
        formattedBooks += `ID: ${index + 1}\nTitle: ${book.title}\nAuthor: ${book.author}\n\n`;
    });

    const embed = new EmbedBuilder()
        .setTitle(constants.AVAILABEL_BOOKS)
        .setColor('#00FF00')
        .setDescription(formattedBooks);

    await message.channel.send({ embeds: [embed] });
};
exports.userBooks = (message, books) => {
    if (books.length === 0) {
        const embed = new EmbedBuilder()
            .setTitle(constants.NO_BOOKS_FOUND)
            .setColor('#FF0000')
            .setDescription(constants.SORRY_MESSAGE);

        message.reply({ embeds: [embed] });
        return;
    }

    const formattedBooks = books.map((book, index) => {
        return `ID: ${index + 1}\nTitle: ${book.title}\nAuthor: ${book.author}\n`;
    }).join('\n');

    const embed = new EmbedBuilder()
        .setTitle(constants.MY_BOOKS)
        .setColor('#00FF00')
        .setDescription(formattedBooks);

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

    let formattedBooks = '';
    books.forEach((book, index) => {
        formattedBooks += `ID: ${index + 1}\nTitle: ${book.title}\nQuantity: ${book.quantity_available}\n\n`;
    });

    const embed = new EmbedBuilder()
        .setTitle(constants.AVAILABEL_BOOKS)
        .setColor('#00FF00')
        .setDescription(formattedBooks);
        
    message.reply({ embeds: [embed] });
}