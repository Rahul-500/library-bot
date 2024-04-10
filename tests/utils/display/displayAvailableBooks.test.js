const constants = require("../../../src/constants/constant");
const { EmbedBuilder } = require("discord.js");
const { displayAvailableBooks } = require("../../../src/utils/display/displayAvailableBooks");
const { pagination } = require("../../../src/utils/pagination");

jest.mock("../../../src/utils/pagination");

describe("displayAvailableBooks", () => {
    let message;

    beforeEach(() => {
        message = {
            reply: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should display a message when no books are available", async () => {
        const books = [];

        await displayAvailableBooks(message, books);

        const embed = new EmbedBuilder()
            .setTitle(constants.NO_BOOKS_FOUND)
            .setColor("#FF0000")
            .setDescription(constants.SORRY_MESSAGE);

        expect(message.reply).toHaveBeenCalledWith({ embeds: [embed] });
    });

    it("should display available books with pagination", async () => {
        const books = [
            { title: "Book 1", author: "Author 1" },
            { title: "Book 2", author: "Author 2" },
            { title: "Book 3", author: "Author 3" },
            { title: "Book 4", author: "Author 4" },
            { title: "Book 5", author: "Author 5" },
        ];

        const itemsPerPage = constants.itemsPerPage;
        const totalPages = Math.ceil(books.length / itemsPerPage);

        await displayAvailableBooks(message, books);

        const embeds = [];

        for (let i = 0; i < books.length; i += itemsPerPage) {
            const currentBooks = books.slice(i, i + itemsPerPage);
            const fields = currentBooks.map((book, index) => ({
                name: `**ID: ${i + index + 1}**`,
                value: `**Title:** ${book.title}\n**Author:** ${book.author}`,
                inline: false,
            }));

            const embed = new EmbedBuilder()
                .setTitle(
                    `${constants.AVAILABEL_BOOKS} (Page ${Math.floor(i / itemsPerPage) + 1}/${totalPages})`,
                )
                .setColor("#00FF00")
                .addFields(fields);

            embeds.push(embed);
        }

        expect(pagination).toHaveBeenCalledWith(message, embeds);
    });
});
