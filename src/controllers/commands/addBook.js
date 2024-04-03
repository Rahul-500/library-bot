const { addBookToDatabase } = require("../../service/databaseService");
const constants = require("../../constants/constant")

exports.addBook = async (message, connection, userEventsMap) => {
    try {
        const authorId = message.author.id;
        await message.reply(constants.BOOK_DETAILS_PROMPT_MESSAGE);

        const collector = message.channel.createMessageCollector();
        let bookDetails = {};

        userEventsMap.get(authorId).messageCreate = false;

        collector.on("collect", async (response) => {
            
            if (response.content.toLowerCase() === "exit") {
                message.reply(constants.EXIT_ADD_MESSAGE);
                collector.stop();
                return;
            }

            const details = response.content
                .split(";")
                .map((detail) => detail.trim());
            const [title, author, publishedYear, quantityAvailable] = details;
            const parsedPublishedYear = parseInt(publishedYear);
            const parsedQuantityAvailable = parseInt(quantityAvailable);

            if (
                title &&
                author &&
                publishedYear &&
                quantityAvailable &&
                !Number.isNaN(parsedPublishedYear) &&
                !Number.isNaN(parsedQuantityAvailable)
            ) {
                bookDetails = {
                    title,
                    author,
                    published_year: parsedPublishedYear,
                    quantity_available: parsedQuantityAvailable,
                };

                message.reply(constants.ADD_BOOK_DETAILS_RECEIVED_MESSAGE);
                await addBookToDatabase(message, connection, bookDetails);
            } else {
                message.reply(constants.INVALID_DETAILS_MESSAGE);
            }
            collector.stop();
        });

        collector.on("end", () => {
            userEventsMap.get(authorId).messageCreate = true;
        });
    } catch (error) {
        message.reply(constants.UNEXPECTED_ADD_ERROR_MESSAGE);
        collector.stop();
    }
};
