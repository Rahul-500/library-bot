const display = require("../../utils/display");
const { getAvailableBooks } = require("../commands/getAvailableBooks");

exports.availableBooks = async (message, connection, bookMap) => {
  const availableBooks = await getAvailableBooks(
    message,
    connection,
    bookMap
  );

  if (!availableBooks) return;
  display.availableBooks(message, availableBooks);
};
