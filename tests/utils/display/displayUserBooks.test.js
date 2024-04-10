const constants = require("../../../src/constants/constant");
const { EmbedBuilder } = require("discord.js");
const { displayUserBooks } = require("../../../src/utils/display/displayUserBooks");
const { formatDate } = require("../../../src/utils/formatDate");
const { pagination } = require("../../../src/utils/pagination");

jest.mock("../../../src/utils/pagination");
jest.mock("../../../src/utils/formatDate");

describe("displayUserBooks", () => {
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

        await displayUserBooks(message, books);

        const embed = new EmbedBuilder()
            .setTitle(constants.NO_BOOKS_FOUND)
            .setColor("#FF0000")
            .setDescription(constants.SORRY_MESSAGE);

        expect(message.reply).toHaveBeenCalledWith({ embeds: [embed] });
    });

    it("should display user's books with pagination", async () => {
        const books = [
            { title: "Book 1", author: "Author 1", checked_out: "2022-01-01" },
            { title: "Book 2", author: "Author 2", checked_out: "2022-02-01" },
            { title: "Book 3", author: "Author 3", checked_out: "2022-03-01" },
            { title: "Book 4", author: "Author 4", checked_out: "2022-04-01" },
            { title: "Book 5", author: "Author 5", checked_out: "2022-05-01" },
        ];

        formatDate.mockReturnValue("January 1, 2022");

        const itemsPerPage = constants.itemsPerPage;
        const totalPages = Math.ceil(books.length / itemsPerPage);

        await displayUserBooks(message, books);

        const embeds = [];

        for (let i = 0; i < books.length; i += itemsPerPage) {
            const currentBooks = books.slice(i, i + itemsPerPage);
            const fields = currentBooks.map((book, index) => {
                const checkedOutDate = formatDate(book.checked_out);
                return {
                    name: `**ID: ${i + index + 1}**`,
                    value: `**Title:** ${book.title}\n**Author:** ${book.author}\n**Checked-Out-Date:** ${checkedOutDate}`,
                    inline: false,
                };
            });

            const embed = new EmbedBuilder()
                .setTitle(
                    `${constants.MY_BOOKS} (Page ${Math.floor(i / itemsPerPage) + 1}/${totalPages})`,
                )
                .setColor(constants.EMBED_COLOR)
                .addFields(fields);

            embeds.push(embed);
        }

        expect(pagination).toHaveBeenCalledWith(message, embeds);
    });
});
