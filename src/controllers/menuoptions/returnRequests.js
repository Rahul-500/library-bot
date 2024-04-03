const constants = require('../../constants/constant');
const { isAdmin } = require('../../middleware/validateAdmin');
const { getReturnRequests } = require('../../service/databaseService');
const { processReturnRequest } = require('../commands/processReturnRequest');
const display = require('../../utils/display');

exports.returnRequests = async (client, message, connection, userEventsMap) => {
  if (!isAdmin(message)) {
    message.reply(constants.HELP_MESSAGE);
    return;
  }

  const returnRequests = await getReturnRequests(connection);
  if (!returnRequests) return;
  display.returnRequests(message, returnRequests);
  await processReturnRequest(
    client,
    message,
    connection,
    returnRequests,
    userEventsMap
  );
};
