const { isAdmin } = require('../../../src/middleware/validateAdmin');
const { getNewBookRequests } = require("../../service/databaseService");
const display = require("../../utils/display");
const { processBookRequest } = require("../commands/processBookRequest")
const constants = require('../../constants/constant');

exports.bookRequests = async (client, message, connection, userEventsMap) => {
  if (!isAdmin(message)) {
    message.reply(constants.HELP_MESSAGE);
    return;
  }

  const newBookRequests = await getNewBookRequests(connection);

  if (!newBookRequests) return;
  display.newBookRequests(message, newBookRequests);

  await processBookRequest(
    client,
    message,
    connection,
    newBookRequests,
    userEventsMap
  );
};
