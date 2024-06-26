const constants = require('../../constants/constant');
const { isAdmin } = require('../../middleware/validateAdmin');
const { displayCheckoutRequests } = require('../../utils/display/displayCheckoutRequests');
const { processCheckoutRequest } = require('../commands/processCheckoutRequest');
const { getCheckoutRequestsQuery } = require("../../service/queries/getCheckoutRequestsQuery");

exports.checkoutRequests = async (client, message, connection, userEventsMap) => {
  if (!isAdmin(message)) {
    message.reply(constants.HELP_MESSAGE);
    return;
  }

  const checkoutRequests = await getCheckoutRequestsQuery(connection);
  if (!checkoutRequests) return;
  displayCheckoutRequests(message, checkoutRequests);

  await processCheckoutRequest(
    client,
    message,
    connection,
    checkoutRequests,
    userEventsMap
  );
};
