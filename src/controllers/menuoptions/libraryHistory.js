const constants = require('../../constants/constant');
const { isAdmin } = require('../../middleware/validateAdmin');
const { displayLibraryHistory } = require('../../utils/display/displayLibraryHistory');
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
  displayLibraryHistory(message, library_history);
};
