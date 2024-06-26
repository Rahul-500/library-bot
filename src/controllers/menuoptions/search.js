const { displayAvailableBooks } = require('../../utils/display/displayAvailableBooks');
const { searchBooks } = require('../commands/searchBooks');

exports.search = async (message, connection, userEventsMap, bookMap) => {
  const booksFound = await searchBooks(
    message,
    connection,
    userEventsMap,
    bookMap
  );
  if (!booksFound) return;
  await displayAvailableBooks(message, booksFound);
};
