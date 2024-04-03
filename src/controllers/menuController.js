const constants = require("../constants/constant");
const { isAdmin } = require("../middleware/validateAdmin");
const { createUserIfNotExists } = require("../middleware/validateUser");
const commandsController = require("./commandsController")
const display = require("../utils/display")

const {
  getNewBookRequests,
  getCheckoutRequests,
  getReturnRequests
} = require("../service/databaseService");

exports.menu = async (dependencies) => {
  const {
    message,
    connection,
    bookMap,
    checkedOutBooks,
    userEventsMap,
    client,
  } = dependencies;

  if (message.author.bot) return;

  const user = await createUserIfNotExists(connection, message)
  if (!user) return

  const command = message.content;
  const checkoutPattern = /^\/checkout\s\d{1,}$/;
  const returnPattern = /^\/return\s\d{1,}$/;

  switch (true) {
    case command === "/menu":
      display.menu(message, validateUser);
      break;

    case command === "/available-books":
      const availableBooks = await commandsController.getAvailableBooks(
        message,
        connection,
        bookMap
      );
      
      if (!availableBooks) return;
      display.availableBooks(message, availableBooks);
      break;

    case checkoutPattern.test(command):
      if (bookMap.size == 0) {
        message.reply(constants.GET_AVAILABLE_BEFORE_CHECKOUT_MESSAGE);
        break;
      }
      await commandsController.checkoutBook(
        message,
        connection,
        bookMap,
        client
      );
      break;

    case command === "/my-books":
      const userBooks = await commandsController.getUserBooks(
        message,
        connection,
        checkedOutBooks
      );
      if (!userBooks) return;
      display.userBooks(message, userBooks);
      break;

    case command === "/view-return-requests":
      if (!isAdmin(message)) {
        message.reply(constants.HELP_MESSAGE);
        break;
      }

      const returnRequests = await getReturnRequests(connection);
      if (!returnRequests) return;
      display.returnRequests(message, returnRequests);
      await commandsController.processReturnRequest(
        client,
        message,
        connection,
        returnRequests,
        userEventsMap
      );
      break;

    case command === "/search":
      const booksFound = await commandsController.searchBooks(
        message,
        connection,
        userEventsMap,
        bookMap
      );
      if (!booksFound) return;
      await display.availableBooks(message, booksFound);
      break;

    case returnPattern.test(command):
      if (checkedOutBooks.size == 0) {
        message.reply(constants.GET_AVAILABLE_BEFORE_RETURN_MESSAGE);
        break;
      }
      await commandsController.returnBook(
        message,
        client,
        connection,
        checkedOutBooks
      );
      break;

    case command === "/request-new-book":
      if (isAdmin(message)) {
        message.reply(constants.HELP_MESSAGE);
        break;
      }

      await commandsController.requestBook(
        client,
        message,
        connection,
        userEventsMap
      );

      break;

    case command === "/add-book":
      if (!isAdmin(message)) {
        message.reply(constants.HELP_MESSAGE);
        break;
      }
      await commandsController.addBook(message, connection, userEventsMap);

      break;

    case command === "/update-book":
      if (!isAdmin(message)) {
        message.reply(constants.HELP_MESSAGE);
        break;
      }

      const booksForUpdate = await commandsController.getAvailableBooks(
        message,
        connection,
        bookMap
      );

      if (!booksForUpdate) return;
      display.books(message, booksForUpdate);

      await commandsController.updateBook(
        message,
        connection,
        bookMap,
        userEventsMap
      );
      break;

    case command === "/view-book-requests":
      if (!isAdmin(message)) {
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
        userEventsMap
      );
      break;

    case command === "/view-checkout-requests":
      if (!isAdmin(message)) {
        message.reply(constants.HELP_MESSAGE);
        break;
      }

      const checkoutRequests = await getCheckoutRequests(connection);
      if (!checkoutRequests) return;
      display.checkoutRequests(message, checkoutRequests);

      await commandsController.processCheckoutRequest(
        client,
        message,
        connection,
        checkoutRequests,
        userEventsMap
      );
      break;

    case command === "/delete-book":
      if (!isAdmin(message)) {
        message.reply(constants.HELP_MESSAGE);
        break;
      }

      const books = await commandsController.getAvailableBooks(
        message,
        connection,
        bookMap
      );
      if (!books) return;
      display.availableBooksWithQuantity(message, books);
      await commandsController.deleteBook(
        message,
        connection,
        bookMap,
        userEventsMap
      );
      break;

    case command === "/library-history":
      if (!isAdmin(message)) {
        message.reply(constants.HELP_MESSAGE);
        break;
      }
      const library_history = await commandsController.getLibraryHistory(
        message,
        connection
      );
      if (!library_history) return;
      display.libraryHistory(message, library_history);
      break;

    case command === "!help":
      commandsController.help(message, isAdmin(message));
      break;

    default:
      message.reply(constants.HELP_MESSAGE);
  }
};