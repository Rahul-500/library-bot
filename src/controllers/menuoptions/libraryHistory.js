const constants = require('../../constants/constant');
const { isAdmin } = require('../../middleware/validateAdmin');
const display = require('../../utils/display');
const { getLibraryHistory } = require('../commands/getLibraryHistory');

exports.libraryHistory = async (message, connection) => {
  if (!isAdmin(message)) {
    message.reply(constants.HELP_MESSAGE);
    return;
  }
  const library_history = await getLibraryHistory(
    message,
    connection
  );
  if (!library_history) return;
  display.libraryHistory(message, library_history);
};
