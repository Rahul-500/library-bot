const constants = require("../../constants/constant");
const { EmbedBuilder } = require("discord.js");
const { pagination } = require("../../utils/pagination");

exports.displayNewBookRequests = async (message, bookRequests) => {
    if (bookRequests.length === 0) {
      const embed = new EmbedBuilder()
        .setTitle(constants.NO_BOOK_REQUESTS_FOUND)
        .setColor("#FF0000")
        .setDescription(constants.SORRY_MESSAGE_FOR_NO_BOOK_REQUEST);
  
      message.reply({ embeds: [embed] });
      return;
    }
    const itemsPerPage = constants.itemsPerPage;
    const totalPages = Math.ceil(bookRequests.length / itemsPerPage);
    const embeds = [];
  
    for (let i = 0; i < bookRequests.length; i += itemsPerPage) {
      const currentBookRequests = bookRequests.slice(i, i + itemsPerPage);
      const fields = currentBookRequests.map((bookRequest, index) => ({
        name: `**ID:** ${i + index + 1}`,
        value: `**Name:** ${bookRequest.name}\n**Request:** ${bookRequest.description}\n**Status:** ${bookRequest.status}`,
        inline: false,
      }));
  
      const embed = new EmbedBuilder()
        .setTitle(
          `${constants.BOOK_REQUESTS} (Page ${Math.floor(i / itemsPerPage) + 1}/${totalPages})`,
        )
        .setColor("#00FF00")
        .addFields(fields);
  
      embeds.push(embed);
    }
  
    await pagination(message, embeds);
  };