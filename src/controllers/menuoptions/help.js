const { isAdmin } = require("../../middleware/validateAdmin");
const { help } = require("../commands/help");

exports.help = async (message) => {
    help(message, isAdmin(message));
}