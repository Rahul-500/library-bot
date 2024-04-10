const constants = require("../../constants/constant");
const { EmbedBuilder } = require("discord.js");
const { pagination } = require("../../utils/pagination");

exports.displayReturnRequests = async (message, returnRequests) => {
    if (returnRequests.length === 0) {
      const embed = new EmbedBuilder()
        .setTitle(constants.NO_RETURN_REQUEST_FOUND)
        .setColor("#FF0000")
        .setDescription(constants.SORRY_MESSAGE_FOR_NO_RETURN_REQUEST);
  
      message.reply({ embeds: [embed] });
      return;
    }
    const itemsPerPage = constants.itemsPerPage;
    const totalPages = Math.ceil(returnRequests.length / itemsPerPage);
    const embeds = [];
  
    for (let i = 0; i < returnRequests.length; i += itemsPerPage) {
      const currentReturnRequest = returnRequests.slice(i, i + itemsPerPage);
      const fields = currentReturnRequest.map((returnRequest, index) => ({
        name: `**ID:** ${i + index + 1}`,
        value: `**Name:** ${returnRequest.name}\n**Title:** ${returnRequest.title}\n**Status:** ${returnRequest.status}`,
        inline: false,
      }));
  
      const embed = new EmbedBuilder()
        .setTitle(
          `${constants.RETURN_REQUESTS} (Page ${Math.floor(i / itemsPerPage) + 1}/${totalPages})`,
        )
        .setColor("#00FF00")
        .addFields(fields);
  
      embeds.push(embed);
    }
  
    await pagination(message, embeds);
  }