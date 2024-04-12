const constants = require("../../constants/constant")
const { updateBookDetailsQuery } = require("../../service/queries/updateBookDetailsQuery");

exports.updateBook = async (message, connection, books, userEventsMap) => {
    try {
        const authorId = message.author.id;

        await message.reply(constants.UPDATE_BOOK_ID_PROMPT_MESSAGE);
        const collector = message.channel.createMessageCollector();
        userEventsMap.get(authorId).messageCreate = false;
        const regexPatternForNumber = /^\d+$/;

        collector.on("collect", async (response) => {
            if (response.content.toLowerCase() === "exit") {
                message.reply(constants.EXIT_REMOVE_MESSAGE);
                collector.stop();
                return;
            }

            const bookId = parseInt(response.content);
            const book = books.get(bookId);

            if (!book) {
                message.reply(constants.INVALID_BOOK_ID_MESSAGE);
                collector.stop();
                return;
            }

            collector.stop();
            userEventsMap.get(authorId).messageCreate = true;
            await message.reply(constants.UPDATE_BOOK_PROMPT_MESSAGE);
            userEventsMap.get(authorId).messageCreate = false;

            const updateCollector = message.channel.createMessageCollector();

            updateCollector.on("collect", async (updateResponse) => {
                if (updateResponse.content.toLowerCase() === "exit") {
                    message.reply(constants.EXIT_UPDATE_MESSAGE);
                    updateCollector.stop();
                    return;
                }

                const details = updateResponse.content
                    .split(";")
                    .map((detail) => detail.trim());
                const [title, author, publishedYear, quantity] = details;

                const updatedTitle = title !== "" ? title : book.title;
                const updatedAuthor = author !== "" ? author : book.author;
                const updatedPublishedYear =
                    publishedYear !== "" ? parseInt(publishedYear) : book.published_year;
                const updatedQuantity =
                    quantity !== "" ? parseInt(quantity) : book.quantity_available;

                if (
                    !regexPatternForNumber.test(updatedPublishedYear) ||
                    !regexPatternForNumber.test(updatedQuantity)
                ) {
                    message.reply(constants.INVALID_UPDATE_DETAILS_MESSAGE);
                } else {
                    message.reply(constants.UPDATE_BOOK_DETAILS_RECEIVED_MESSAGE);
                    await updateBookDetailsQuery(
                        message,
                        connection,
                        book,
                        updatedTitle,
                        updatedAuthor,
                        updatedPublishedYear,
                        updatedQuantity,
                    );
                }

                updateCollector.stop();
            });

            updateCollector.on("end", () => {
                userEventsMap.get(authorId).messageCreate = true;
            });
        });

        collector.on("end", () => {
            userEventsMap.get(authorId).messageCreate = true;
        });
    } catch (error) {
        message.reply(constants.UNEXPECTED_UPDATE_ERROR_MESSAGE);
    }
};