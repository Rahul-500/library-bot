const { notifyAdminReturnBookRequest } = require("../../service/notifier");
const constants = require("../../constants/constant")
const { validateReturnQuery } = require("../../service/queries/validateReturnQuery");
const { getReturnRequestsForBookQuery } = require("../../service/queries/getReturnRequestsForBookQuery");


exports.returnBook = async (message, client, connection, checkedOutBooks) => {
    const content = message.content;
    const userId = message.author.id;
    const virtualId = parseInt(content.split(" ")[1]);
    const book = checkedOutBooks.get(virtualId);
    if (!book) {
        message.reply(constants.BOOK_WITH_THAT_ID_NOT_FOUND_MESSAGE);
        return;
    }
    const bookId = book.id;
    try {
        const result = await validateReturnQuery(connection, userId, bookId);
        if (!result) {
            message.reply(constants.CANNOT_RETURN_BOOK_MESSAGE);
            return;
        }

        const userIdList = await getReturnRequestsForBookQuery(connection, bookId)
        if (userIdList === null) {
            message.reply(constants.ERROR_VALIDATING_RETURN_BOOK_MESSAGE);
            return;
        }
        if (userIdList.some((user) => user.user_id === userId)) {
            message.reply(constants.ALREADY_RETURN_REQUEST_INITIATED_MESSAGE);
            return;
        }

        await notifyAdminReturnBookRequest(message, connection, client, book);
    } catch (error) {
        message.reply(constants.UNEXPECTED_RETURN_BOOK_ERROR_MESSAGE);
    }
};