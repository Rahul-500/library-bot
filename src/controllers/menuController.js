const constants = require('../constants/constant')

exports.menu = async (message, commandsController, connection, validateUser) => {

    if (message.author.bot || !message.content.startsWith('/')) return;

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
    
    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase()
    switch (command) {
        case 'start':
            commandsController.start(message, connection)
            break;
        case '1':
            commandsController.getAvailableBooks(message, connection)
            break;
    }
}