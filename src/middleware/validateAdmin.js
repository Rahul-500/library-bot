require("dotenv").config();
exports.isAdmin = (message) => {
    const BOT_OWNER_USER_NAMES = (process.env.BOT_OWNER_USER_NAME || "").split(
        ",",
    );
    return BOT_OWNER_USER_NAMES.includes(message.author.username);
};