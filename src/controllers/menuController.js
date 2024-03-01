const constants = require('../constants/constant')

exports.menu = async (dependencies) => {

    const { message, commandsController, connection, validateUser, bookMap } = dependencies;

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
    const checkoutPattern = /^\/checkout\s\d{1,}$/;

    switch (true) {
        case command === ('/start'):
            commandsController.start(message, connection);
            break;
        case command === ('/1'):
            await commandsController.getAvailableBooks(message, connection, bookMap);
            break;
        case checkoutPattern.test(command):
            if ((bookMap).size == 0) {
                message.reply(constants.GET_AVAILABLE_BEFORE_CHECKOUT_MESSAGE);
                break;
            }
            await commandsController.checkoutBook(message, connection, bookMap);
            break;
        default:
            message.reply(constants.HELP_MESSAGE);
    }

}