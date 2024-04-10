const constants = require("../../constants/constant");
const { EmbedBuilder } = require("discord.js");
const { isAdmin } = require("../../middleware/validateAdmin");

exports.displayMenu = (message) => {
    const menuOptions = isAdmin(message)
        ? constants.ADMIN_OPTIONS
        : constants.MENU_OPTIONS;
    const welcomeMessage = `${constants.WELCOME_MESSAGE}, ${message.author.username}!`;

    const embed = new EmbedBuilder()
        .setColor(constants.EMBED_COLOR)
        .setTitle(constants.MENU_TITLE)
        .setDescription(welcomeMessage)
        .addFields(
            { name: "Options", value: menuOptions, inline: false },
            { name: "How to use", value: constants.HELP_MESSAGE },
        )
        .setFooter({ text: constants.FOOTER_TEXT });

    message.reply({ embeds: [embed] });
};