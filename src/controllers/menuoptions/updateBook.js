const { isAdmin } = require("../../middleware/validateAdmin");
const { getAvailableBooks } = require("../commands/getAvailableBooks");
const display = require('../../utils/display');
const { updateBook } = require("../commands/updateBook");
const constants = require('../../constants/constant');

exports.updateBook = async (message, connection, bookMap, userEventsMap) => {
  if (!isAdmin(message)) {
    message.reply(constants.HELP_MESSAGE);
    return;
  }

  const booksForUpdate = await getAvailableBooks(
    message,
    connection,
    bookMap
  );

  if (!booksForUpdate) return;
  display.books(message, booksForUpdate);

  await updateBook(
    message,
    connection,
    bookMap,
    userEventsMap
  );
};
