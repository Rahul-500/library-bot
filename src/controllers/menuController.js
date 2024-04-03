const constants = require("../constants/constant");
const { createUserIfNotExists } = require("../middleware/validateUser");
const display = require("../utils/display");
const { addBook } = require("./menuoptions/addBook");
const { availableBooks } = require("./menuoptions/availableBooks");
const { bookRequests } = require("./menuoptions/bookRequests");
const { checkoutBook } = require("./menuoptions/checkoutBook");
const { checkoutRequests } = require("./menuoptions/checkoutRequests");
const { deleteBook } = require("./menuoptions/deleteBook");
const { help } = require("./menuoptions/help");
const { libraryHistory } = require("./menuoptions/libraryHistory");
const { myBooks } = require("./menuoptions/myBooks");
const { requestBook } = require("./menuoptions/requestBook");
const { returnBook } = require("./menuoptions/returnBook");
const { returnRequests } = require("./menuoptions/returnRequests");
const { search } = require("./menuoptions/search");
const { updateBook } = require("./menuoptions/updateBook");

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

  const user = await createUserIfNotExists(message, connection)
  if (!user) return

  const command = message.content;
  const checkoutPattern = /^\/checkout\s\d{1,}$/;
  const returnPattern = /^\/return\s\d{1,}$/;

  switch (true) {
    case command === "/menu":
      display.menu(message);
      break;

    case command === "/available-books":
      await availableBooks(message, connection, bookMap);
      break;

    case checkoutPattern.test(command):
      await checkoutBook(message, connection, bookMap, client);
      break;

    case command === "/my-books":
      await myBooks(message, connection, checkedOutBooks);
      break;

    case command === "/view-return-requests":
      await returnRequests(client, message, connection, userEventsMap);
      break;

    case command === "/search":
      await search(message, connection, userEventsMap, bookMap);
      break;

    case returnPattern.test(command):
      await returnBook(message, client, connection, checkedOutBooks);
      break;

    case command === "/request-new-book":
      await requestBook(client, message, connection, userEventsMap);
      break;

    case command === "/add-book":
      await addBook(message, connection, userEventsMap);
      break;

    case command === "/update-book":
      await updateBook(message, connection, bookMap, userEventsMap);
      break;

    case command === "/view-book-requests":
      await bookRequests(client, message, connection, userEventsMap);
      break;

    case command === "/view-checkout-requests":
      await checkoutRequests(client, message, connection, userEventsMap);
      break;

    case command === "/delete-book":
      await deleteBook(message, connection, bookMap, userEventsMap);
      break;

    case command === "/library-history":
      await libraryHistory(message, connection);
      break;

    case command === "!help":
      await help(message);
      break;

    default:
      message.reply(constants.HELP_MESSAGE);
  }
};