const { isAdmin } = require("../../middleware/validateAdmin");
const { addBook } = require("../commands/addBook");
const constants = require('../../constants/constant');

exports.addBook = async (message, connection, userEventsMap) => {
  if (!isAdmin(message)) {
    message.reply(constants.HELP_MESSAGE);
    return;
  }
  await addBook(message, connection, userEventsMap);
};
