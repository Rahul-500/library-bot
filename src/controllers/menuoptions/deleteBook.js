const constants = require('../../constants/constant');
const { isAdmin } = require('../../middleware/validateAdmin');
const { getAvailableBooks } = require('../commands/getAvailableBooks');
const display = require('../../utils/display');
const { deleteBook } = require('../commands/deleteBook');

exports.deleteBook = async (message, connection, bookMap, userEventsMap) => {
  if (!isAdmin(message)) {
    message.reply(constants.HELP_MESSAGE);
    return;
  }

  const books = await getAvailableBooks(
    message,
    connection,
    bookMap
  );
  if (!books) return;
  display.availableBooksWithQuantity(message, books);
  await deleteBook(
    message,
    connection,
    bookMap,
    userEventsMap
  );
}