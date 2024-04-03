const { getLibraryHistory } = require("../../service/databaseService");
const constants = require("../../constants/constant")

exports.getLibraryHistory = async (message, connection) => {
    try {
        const libraryHistory = await getLibraryHistory(connection)
        if (!libraryHistory) {
            throw new Error("Error: executing library history query")
        }
        return libraryHistory;
    } catch (error) {
        message.reply(constants.ERROR_FETCHING_LIBRARY_HISTORY);
        return null;
    }
};