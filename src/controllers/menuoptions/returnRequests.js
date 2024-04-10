const constants = require('../../constants/constant');
const { isAdmin } = require('../../middleware/validateAdmin');
const { getReturnRequests } = require('../../service/databaseService');
const { displayReturnRequests } = require('../../utils/display/displayReturnRequests');
const { processReturnRequest } = require('../commands/processReturnRequest');

exports.returnRequests = async (client, message, connection, userEventsMap) => {
  if (!isAdmin(message)) {
    message.reply(constants.HELP_MESSAGE);
    return;
  }

  const returnRequests = await getReturnRequests(connection);
  if (!returnRequests) return;
  displayReturnRequests(message, returnRequests);
  await processReturnRequest(
    client,
    message,
    connection,
    returnRequests,
    userEventsMap
  );
};
