const { user } = require("../../config/db.config");
const constants = require("../constants/constant");
const { getNewBookRequests } = require("../service/databaseService");

exports.menu = async (dependencies) => {
  const {
    message,
    commandsController,
    connection,
    validateUser,
    bookMap,
    checkedOutBooks,
    display,
    userEventsMap,
    client,
  } = dependencies;

  if (message.author.bot) return;

  if (message.content !== "/start") {
    try {
      const isUserExisting = await validateUser.checkForExistingUser(
        message,
        connection,
      );
      if (!isUserExisting) {
        message.reply(constants.USE_START_COMMAND_MESSAGE);
        return;
      }
    } catch (error) {
      message.reply(constants.ERROR_DURING_USER_CHECK);
      return;
    }
  }

  const command = message.content;
  const checkoutPattern = /^\/checkout\s\d{1,}$/;
  const returnPattern = /^\/return\s\d{1,}$/;

  switch (true) {
    case command === "/start":
      const result = await commandsController.start(message, connection);
      if (!result) return;
      display.welcomeMessage(message, validateUser);
      break;

    case command === "/available-books":
      const availableBooks = await commandsController.getAvailableBooks(
        message,
        connection,
        bookMap,
      );
      if (!availableBooks) return;
      display.availableBooks(message, availableBooks);
      break;

    case checkoutPattern.test(command):
      if (bookMap.size == 0) {
        message.reply(constants.GET_AVAILABLE_BEFORE_CHECKOUT_MESSAGE);
        break;
      }
      await commandsController.checkoutBook(message, connection, bookMap,client);
      break;

    case command === "/my-books":
      const userBooks = await commandsController.getUserBooks(
        message,
        connection,
        checkedOutBooks,
      );
      if (!userBooks) return;
      display.userBooks(message, userBooks);
      break;

    case returnPattern.test(command):
      if (checkedOutBooks.size == 0) {
        message.reply(constants.GET_AVAILABLE_BEFORE_RETURN_MESSAGE);
        break;
      }
      await commandsController.returnBook(message, connection, checkedOutBooks);
      break;

    case command === "/request-new-book":
      await commandsController.requestBook(
        client,
        message,
        connection,
        userEventsMap,
      );

      break;

    case command === "/add-book":
      if (!validateUser.isAdmin(message)) {
        message.reply(constants.HELP_MESSAGE);
        break;
      }
      await commandsController.addBook(message, connection, userEventsMap);

      break;

    case command === "/update-book":
      if (!validateUser.isAdmin(message)) {
        message.reply(constants.HELP_MESSAGE);
        break;
      }

      const booksForUpdate = await commandsController.getAvailableBooks(
        message,
        connection,
        bookMap,
      );

      if (!booksForUpdate) return;
      display.books(message, booksForUpdate);

      await commandsController.updateBook(
        message,
        connection,
        bookMap,
        userEventsMap,
      );
      break;

    case command === "/view-book-requests":
      if (!validateUser.isAdmin(message)) {
        message.reply(constants.HELP_MESSAGE);
        break;
      }

      const newBookRequests = await getNewBookRequests(connection);

      if (!newBookRequests) return;
      display.newBookRequests(message, newBookRequests);

      await commandsController.processBookRequest(
        client,
        message,
        connection,
        newBookRequests,
        userEventsMap,
      );
      break;

    case command === "/delete-book":
      if (!validateUser.isAdmin(message)) {
        message.reply(constants.HELP_MESSAGE);
        break;
      }

      const books = await commandsController.getAvailableBooks(
        message,
        connection,
        bookMap,
      );
      if (!books) return;
      display.availableBooksWithQuantity(message, books);
      await commandsController.deleteBook(
        message,
        connection,
        bookMap,
        userEventsMap,
      );
      break;

    case command === "/library-history":
      if (!validateUser.isAdmin(message)) {
        message.reply(constants.HELP_MESSAGE);
        break;
      }
      const library_history = await commandsController.getLibraryHistory(
        message,
        connection,
      );
      if (!library_history) return;
      display.libraryHistory(message, library_history);
      break;

    case command === "!help":
      commandsController.help(message, validateUser.isAdmin(message));
      break;

    default:
      message.reply(constants.HELP_MESSAGE);
  }
};
