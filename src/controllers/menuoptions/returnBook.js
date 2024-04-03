const constants = require('../../constants/constant');
const { returnBook } = require('../commands/returnBook');

exports.returnBook = async (message, client, connection, checkedOutBooks) => {
  if (checkedOutBooks.size == 0) {
    message.reply(constants.GET_AVAILABLE_BEFORE_RETURN_MESSAGE);
    return;
  }
  await returnBook(
    message,
    client,
    connection,
    checkedOutBooks
  );
};
