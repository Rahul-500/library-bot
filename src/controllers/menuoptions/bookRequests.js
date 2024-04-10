const { isAdmin } = require('../../../src/middleware/validateAdmin');
const { getNewBookRequests } = require("../../service/databaseService");
const { processBookRequest } = require("../commands/processBookRequest")
const constants = require('../../constants/constant');
const { displayNewBookRequests } = require('../../utils/display/displayNewBookRequests');

exports.bookRequests = async (client, message, connection, userEventsMap) => {
  if (!isAdmin(message)) {
    message.reply(constants.HELP_MESSAGE);
    return;
  }

  const newBookRequests = await getNewBookRequests(connection);

  if (!newBookRequests) return;
  displayNewBookRequests(message, newBookRequests);

  await processBookRequest(
    client,
    message,
    connection,
    newBookRequests,
    userEventsMap
  );
};
