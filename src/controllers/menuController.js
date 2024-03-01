const constants = require('../constants/constant')

exports.menu = async (message, commandsController, connection, validateUser) => {

    if (message.author.bot) return;

    if (message.content !== '/start') {
        try {
            const isUserExisting = await validateUser.checkForExistingUser(message, connection);
            if (!isUserExisting) {
                message.reply(constants.USE_START_COMMAND_MESSAGE);
                return;
            }
        } catch (error) {
            message.reply(constants.ERROR_DURING_USER_CHECK)
            return;
        }
    }
    const command = message.content;
    const checkoutPattern = /^\/checkout\s+\S+$/;
    
    switch (true) {
        case command === ('/start'):
            commandsController.start(message, connection);
            break;

        case command === ('/1'):
            commandsController.getAvailableBooks(message, connection);
            break;
        case checkoutPattern.test(command):
            message.reply("you got it man")
            break;
        default:
            message.reply(constants.HELP_MESSAGE);
    }

}