const constants = require("../../constants/constant");

exports.help = (message, isAdmin) => {
    let helpMessage = "";

    if (isAdmin) {
        helpMessage = constants.ADMIN_COMMANDS;
    }

    helpMessage += constants.USER_COMMANDS;
    message.reply(helpMessage);
};
