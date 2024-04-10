const { formatDate } = require("../formatDate");
const constants = require("../../constants/constant");
const { EmbedBuilder } = require("discord.js");
const { pagination } = require("../../utils/pagination");

exports.displayLibraryHistory = async (message, libraryhistory) => {
    if (libraryhistory.length === 0) {
        const embed = new EmbedBuilder()
            .setTitle(constants.NO_HISTORY_FOUND)
            .setColor("#FF0000")
            .setDescription(constants.SORRY_MESSAGE_FOR_NO_HISTORY);

        message.reply({ embeds: [embed] });
        return;
    }

    const itemsPerPage = constants.itemsPerPage;
    const totalPages = Math.ceil(libraryhistory.length / itemsPerPage);
    const embeds = [];

    for (let i = 0; i < libraryhistory.length; i += itemsPerPage) {
        const currentHistory = libraryhistory.slice(i, i + itemsPerPage);
        let formattedLibraryhistory = "";

        currentHistory.forEach((history, index) => {
            const checkedOut = formatDate(history.checked_out);
            const returned = formatDate(history.returned);

            formattedLibraryhistory += `**ID:**\t${i + index + 1}\n**User:**\t${history.name}\n**Book:**\t${history.title}\n**Checked-out:**\t${checkedOut}\n**Returned:**\t${returned}\n\n`;
        });

        const embed = new EmbedBuilder()
            .setTitle(
                `${constants.LIBRARY_HISTORY} (Page ${Math.floor(i / itemsPerPage) + 1}/${totalPages})`,
            )
            .setColor("#00FF00")
            .setDescription(formattedLibraryhistory);

        embeds.push(embed);
    }

    await pagination(message, embeds);
};