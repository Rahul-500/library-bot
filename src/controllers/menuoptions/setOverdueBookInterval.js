const { setOverdueBookInterval } = require("../commands/setOverdueBookInterval")
const { isAdmin } = require("../../middleware/validateAdmin");
const constants = require('../../constants/constant');

exports.setOverdueBookInterval = async (connection, client, message) => {
    if (!isAdmin(message)) {
        message.reply(constants.HELP_MESSAGE);
        return;
      }
    await setOverdueBookInterval(connection, client, message)
}