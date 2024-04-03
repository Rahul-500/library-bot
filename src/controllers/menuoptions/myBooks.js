const display = require('../../utils/display');
const { getUserBooks } = require('../commands/getUserBooks');

exports.myBooks = async (message, connection, checkedOutBooks) => {
  const userBooks = await getUserBooks(
    message,
    connection,
    checkedOutBooks
  );
  if (!userBooks) return;
  display.userBooks(message, userBooks);
};
