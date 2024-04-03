const { addUserInfo, checkForExistingUser } = require("../service/databaseService");
const constants = require("../constants/constant");

exports.createUserIfNotExists = async (message, connection) => {
    try {
        console.log("hello");
        const id = message.author.id; 
        const name = message.author.username; 
        const isUserExisting = await checkForExistingUser(
            message,
            connection
        );
       
        if (!isUserExisting) {
            const user = await addUserInfo(id, name, connection);
            return true;
        }
        return true;
    } catch (error) {
        message.reply(constants.ERROR_DURING_USER_CHECK);
        return false;
    }
}

