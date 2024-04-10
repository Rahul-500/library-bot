const constants = require("../../constants/constant");
const { EmbedBuilder } = require("discord.js");
const { pagination } = require("../../utils/pagination");

exports.displayCheckoutRequests = async (message, checkoutRequests) => {
    if (checkoutRequests.length === 0) {
      const embed = new EmbedBuilder()
        .setTitle(constants.NO_CHECKOUT_REQUEST_FOUND)
        .setColor("#FF0000")
        .setDescription(constants.SORRY_MESSAGE_FOR_NO_CHECKOUT_REQUEST);
  
      message.reply({ embeds: [embed] });
      return;
    }
    const itemsPerPage = constants.itemsPerPage;
    const totalPages = Math.ceil(checkoutRequests.length / itemsPerPage);
    const embeds = [];
  
    for (let i = 0; i < checkoutRequests.length; i += itemsPerPage) {
      const currentCheckoutRequest = checkoutRequests.slice(i, i + itemsPerPage);
      const fields = currentCheckoutRequest.map((checkoutRequest, index) => ({
        name: `**ID:** ${i + index + 1}`,
        value: `**Name:** ${checkoutRequest.name}\n**Title:** ${checkoutRequest.title}\n**Status:** ${checkoutRequest.status}`,
        inline: false,
      }));
  
      const embed = new EmbedBuilder()
        .setTitle(
          `${constants.CHECKOUT_REQUESTS} (Page ${Math.floor(i / itemsPerPage) + 1}/${totalPages})`,
        )
        .setColor("#00FF00")
        .addFields(fields);
  
      embeds.push(embed);
    }
  
    await pagination(message, embeds);
  };