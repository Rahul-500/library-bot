const { notifyAdminCheckoutRequest } = require("../../service/notifier");
const constants = require("../../constants/constant")
const { getCheckedOutUsersQuery } = require("../../service/queries/getCheckedOutUsersQuery");

exports.checkoutBook = async (message, connection, bookMap, client) => {
    const content = message.content;
    const userId = message.author.id;
    const userName = message.author.username;
    const virtualId = parseInt(content.split(" ")[1]);
    const book = bookMap.get(virtualId);

    if (!book) {
        message.reply(constants.BOOK_WITH_THAT_ID_NOT_FOUND_MESSAGE);
        return;
    }

    const bookId = book.id;
    const users = await getCheckedOutUsersQuery(connection, book);
    if (users === null) {
        message.reply(constants.ERROR_VALIDATING_CHECKED_OUT_BOOK_MESSAGE);
        return;
    }
    if (users.some((user) => user.name === userName)) {
        message.reply(constants.ALREADY_CHECKED_OUT_BOOK_MESSAGE);
        return;
    }
    if (book.quantity_available <= 0) {
        let replyMessage = `${constants.BOOK_CURRENTLY_NOT_AVAILABLE_MESSAGE}`;
        if (users.length > 0) {
            replyMessage += users.map((user) => `\`${user.name}\``).join(", ");
        } else {
            replyMessage += "None";
        }
        message.reply(replyMessage);
        return;
    }

    await notifyAdminCheckoutRequest(message, connection, client, book);
};
