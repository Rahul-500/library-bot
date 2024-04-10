const {displayAvailableBooks} = require("../../utils/display/displayAvailableBooks");
const { getAvailableBooks } = require("../commands/getAvailableBooks");

exports.availableBooks = async (message, connection, bookMap) => {
  const availableBooks = await getAvailableBooks(
    message,
    connection,
    bookMap
  );

  if (!availableBooks) return;
  displayAvailableBooks(message, availableBooks);
};
