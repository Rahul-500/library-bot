const constants = require("../../constants/constant");
const { EmbedBuilder } = require("discord.js");
const { formatDate } = require("../formatDate");
const { pagination } = require("../../utils/pagination");

exports.displayUserBooks = async (message, books) => {
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
        const fields = currentBooks.map((book, index) => {
            const checkedOutDate = formatDate(book.checked_out);
            return {
                name: `**ID: ${i + index + 1}**`,
                value: `**Title:** ${book.title}\n**Author:** ${book.author}\n**Checked-Out-Date:** ${checkedOutDate}`,
                inline: false,
            };
        });

        const embed = new EmbedBuilder()
            .setTitle(
                `${constants.MY_BOOKS} (Page ${Math.floor(i / itemsPerPage) + 1}/${totalPages})`,
            )
            .setColor(constants.EMBED_COLOR)
            .addFields(fields);

        embeds.push(embed);
    }

    await pagination(message, embeds);
};