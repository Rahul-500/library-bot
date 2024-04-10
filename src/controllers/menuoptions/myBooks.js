const { displayUserBooks } = require('../../utils/display/displayUserBooks');
const { getUserBooks } = require('../commands/getUserBooks');

exports.myBooks = async (message, connection, checkedOutBooks) => {
  const userBooks = await getUserBooks(
    message,
    connection,
    checkedOutBooks
  );
  if (!userBooks) return;
  displayUserBooks(message, userBooks);
};
