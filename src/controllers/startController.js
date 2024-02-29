const constants = require('../constants/constant')

exports.start = (message) => {
    message.reply(`${constants.WELCOME_MESSAGE}, ${message.author.username}!`);
    message.reply(constants.MENU_OPTIONS);
}
