const constants = require("../../constants/constant");
const { EmbedBuilder } = require("discord.js");
const { pagination } = require("../../utils/pagination");

exports.displayAvailableBooksWithQuantity = async (
    message,
    books,
) => {
    if (books.length === 0) {
        const embed = new EmbedBuilder()
            .setTitle(constants.NO_BOOKS_FOUND)
            .setColor("#FF0000")
            .setDescription(constants.SORRY_MESSAGE);

        message.reply({ embeds: [embed] });
        return;
    }

    const itemsPerPage = constants.itemsPerPage;
    const totalPages = Math.ceil(books.length / itemsPerPage);
    const embeds = [];

    for (let i = 0; i < books.length; i += itemsPerPage) {
        const currentBooks = books.slice(i, i + itemsPerPage);
        let formattedBooks = "";

        currentBooks.forEach((book, index) => {
            formattedBooks += `**ID:**\t${i + index + 1}\n**Title:**\t${book.title}\n**Quantity:**\t${book.quantity_available}\n\n`;
        });

        const embed = new EmbedBuilder()
            .setTitle(
                `${constants.AVAILABEL_BOOKS} (Page ${Math.floor(i / itemsPerPage) + 1}/${totalPages})`,
            )
            .setColor("#00FF00")
            .setDescription(formattedBooks);

        embeds.push(embed);
    }

    await pagination(message, embeds);
};