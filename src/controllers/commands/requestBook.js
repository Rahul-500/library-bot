const { notifyAdminNewBookRequest } = require("../../service/notifier");
const constants = require("../../constants/constant")
const { addBookRequestQuery } = require("../../service/queries/addBookRequestQuery");

exports.requestBook = async (client, message, connection, userEventsMap) => {
    try {
        const authorId = message.author.id;
        await message.reply("Enter the title or link of the book");

        const collector = message.channel.createMessageCollector();
        userEventsMap.get(authorId).messageCreate = false;

        collector.on("collect", async (response) => {
            if (response.content.toLowerCase() === "exit") {
                message.reply(constants.EXIT_REQUEST_BOOK_MESSAGE);
                collector.stop();
                return;
            }

            const bookRequest = response.content.trim();
            collector.stop();
            await addBookRequestQuery(connection, bookRequest, message);
            await notifyAdminNewBookRequest(client, message, connection, bookRequest);
        });

        collector.on("end", () => {
            userEventsMap.get(authorId).messageCreate = true;
        });
    } catch (error) {
        message.reply(constants.UNEXPECTED_REQUEST_NEW_BOOK_ERROR_MESSAGE);
        collector.stop();
    }
};