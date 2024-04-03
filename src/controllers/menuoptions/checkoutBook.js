const constants = require('../../constants/constant');
const { checkoutBook } = require('../commands/checkoutBook');

exports.checkoutBook = async (message, connection, bookMap, client) => {
  if (bookMap.size == 0) {
    message.reply(constants.GET_AVAILABLE_BEFORE_CHECKOUT_MESSAGE);
    return;
  }
  await checkoutBook(message, connection, bookMap, client);
};
