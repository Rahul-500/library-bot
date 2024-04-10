const constants = require("../../constants/constant");
const { EmbedBuilder } = require("discord.js");
const { pagination } = require("../../utils/pagination");

exports.displayBooksWithQuantity = async (message, books) => {
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
        const fields = currentBooks.map((book, index) => ({
            name: `**ID: ${i + index + 1}**`,
            value: `**Title:** ${book.title}\n**Author:** ${book.author}\n**Published Year:** ${book.published_year}\n**Quantity:** ${book.quantity_available}`,
            inline: false,
        }));

        const embed = new EmbedBuilder()
            .setTitle(
                `${constants.AVAILABEL_BOOKS} (Page ${Math.floor(i / itemsPerPage) + 1}/${totalPages})`,
            )
            .setColor("#00FF00")
            .addFields(fields);

        embeds.push(embed);
    }

    await pagination(message, embeds);
};