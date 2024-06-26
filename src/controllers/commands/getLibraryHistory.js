const constants = require("../../constants/constant")
const { getLibraryHistoryQuery } = require("../../service/queries/getLibraryHistoryQuery");

exports.getLibraryHistory = async (message, connection) => {
    try {
        const libraryHistory = await getLibraryHistoryQuery(connection)
        if (!libraryHistory) {
            throw new Error("Error: executing library history query")
        }
        return libraryHistory;
    } catch (error) {
        message.reply(constants.ERROR_FETCHING_LIBRARY_HISTORY);
        return null;
    }
};