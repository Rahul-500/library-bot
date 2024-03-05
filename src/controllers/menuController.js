const { user } = require('../../config/db.config');
const constants = require('../constants/constant')

exports.menu = async (dependencies) => {

    const { message, commandsController, connection, validateUser, bookMap, checkedOutBooks, messageCreateHandler, client, display } = dependencies;

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
    const returnPattern = /^\/return\s\d{1,}$/;

    switch (true) {
        case command === ('/start'):
            commandsController.start(message, connection);
            break;

        case command === ('/1'):
            const availableBooks = await commandsController.getAvailableBooks(message, connection, bookMap);
            if (!availableBooks) return
            display.availableBooks(message, availableBooks)
            break;

        case checkoutPattern.test(command):
            if ((bookMap).size == 0) {
                message.reply(constants.GET_AVAILABLE_BEFORE_CHECKOUT_MESSAGE);
                break;
            }
            await commandsController.checkoutBook(message, connection, bookMap);
            break;

        case command === ('/2'):
            const userBooks = await commandsController.getUserBooks(message, connection, checkedOutBooks)
            if (!userBooks) return
            display.userBooks(message, userBooks)
            break;

        case returnPattern.test(command):
            if ((checkedOutBooks).size == 0) {
                message.reply(constants.GET_AVAILABLE_BEFORE_RETURN_MESSAGE);
                break;
            }
            await commandsController.returnBook(message, connection, checkedOutBooks);
            break;

        case command === ('/3'):
            if (!validateUser.isAdmin(message)) {
                message.reply(constants.HELP_MESSAGE);
                break;
            }
            await commandsController.addBook(message, connection, messageCreateHandler, client)
            break;

        case command === ('/4'):
            if (!validateUser.isAdmin(message)) {
                message.reply(constants.HELP_MESSAGE);
                break;
            }
            
            const books = await commandsController.getAvailableBooks(message, connection, bookMap)
            if (!books) return
            display.availableBooksWithQuantity(message, books)
            
            await commandsController.deleteBook(message, connection, bookMap, messageCreateHandler, client)
            break;

        case command === '!help':
            commandsController.help(message, validateUser.isAdmin(message));
            break;

        default:
            message.reply(constants.HELP_MESSAGE);
    }

}