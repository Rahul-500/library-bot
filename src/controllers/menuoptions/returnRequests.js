const constants = require('../../constants/constant');
const { isAdmin } = require('../../middleware/validateAdmin');
const { displayReturnRequests } = require('../../utils/display/displayReturnRequests');
const { processReturnRequest } = require('../commands/processReturnRequest');
const { getReturnRequestsQuery } = require("../../service/queries/getReturnRequestsQuery");

exports.returnRequests = async (client, message, connection, userEventsMap) => {
  if (!isAdmin(message)) {
    message.reply(constants.HELP_MESSAGE);
    return;
  }

  const returnRequests = await getReturnRequestsQuery(connection);
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
