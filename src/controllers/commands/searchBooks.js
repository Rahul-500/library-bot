const constants = require("../../constants/constant")
const { getBooksByTitleQuery } = require("../../service/queries/getBooksByTitleQuery");

exports.searchBooks = async (message, connection, userEventsMap, bookMap) => {
    try {
        const authorId = message.author.id;
        await message.reply(constants.SEARCH_BY_TITLE_PROMPT);

        const booksPromise = new Promise((resolve, reject) => {
            const collector = message.channel.createMessageCollector();

            collector.on("collect", async (response) => {
                if (response.content.toLowerCase() === "exit") {
                    message.reply(constants.EXIT_SEARCH_BOOK_MESSAGE);
                    collector.stop();
                    resolve([]);
                    return;
                }

                const bookTitle = response.content.trim();
                const books = await getBooksByTitleQuery(connection, bookTitle);
                collector.stop();
                resolve(books);
            });

            collector.on("end", () => {
                userEventsMap.get(authorId).messageCreate = true;
            });

            collector.on("error", (error) => {
                reject(error);
            });
        });
        userEventsMap.get(authorId).messageCreate = false;

        const books = await booksPromise;
        bookMap.clear();
        let count = 1;
        books.forEach((book) => {
            bookMap.set(count++, book);
        });
        userEventsMap.get(authorId).messageCreate = true;
        return books;
    } catch (error) {
        userEventsMap.get(authorId).messageCreate = true;
        message.reply(constants.UNEXPECTED_SEARCH_BOOK_ERROR_MESSAGE);
        return null;
    }
};