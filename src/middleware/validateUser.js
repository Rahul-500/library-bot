const constants = require("../constants/constant");
const { addUserInfoQuery } = require("../service/queries/addUserInfoQuery");
const { checkForExistingUserQuery } = require("../service/queries/checkForExistingUserQuery");

exports.createUserIfNotExists = async (message, connection) => {
    try {
        const id = message.author.id;
        const name = message.author.username;
        const isUserExisting = await checkForExistingUserQuery(
            message,
            connection
        );

        if (!isUserExisting) {
            const user = await addUserInfoQuery(id, name, connection);
            return true;
        }
        return true;
    } catch (error) {
        message.reply(constants.ERROR_DURING_USER_CHECK);
        return false;
    }
}

