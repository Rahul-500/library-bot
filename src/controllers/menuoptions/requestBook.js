const constants = require('../../constants/constant');
const { isAdmin } = require('../../middleware/validateAdmin');
const { requestBook } = require('../commands/requestBook');

exports.requestBook = async (client, message, connection, userEventsMap) => {
  if (isAdmin(message)) {
    message.reply(constants.HELP_MESSAGE);
    return;
  }

  await requestBook(
    client,
    message,
    connection,
    userEventsMap
  );
};
