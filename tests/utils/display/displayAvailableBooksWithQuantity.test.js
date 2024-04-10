const constants = require("../../../src/constants/constant");
const { EmbedBuilder } = require("discord.js");
const { displayAvailableBooksWithQuantity } = require("../../../src/utils/display/displayAvailableBooksWithQuantity");
const { pagination } = require("../../../src/utils/pagination");

jest.mock("../../../src/utils/pagination");

describe("displayAvailableBooksWithQuantity", () => {
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

        await displayAvailableBooksWithQuantity(message, books);

        const embed = new EmbedBuilder()
            .setTitle(constants.NO_BOOKS_FOUND)
            .setColor("#FF0000")
            .setDescription(constants.SORRY_MESSAGE);

        expect(message.reply).toHaveBeenCalledWith({ embeds: [embed] });
    });

    it("should display available books with quantity and pagination", async () => {
        const books = [
            { title: "Book 1", quantity_available: 5 },
            { title: "Book 2", quantity_available: 3 },
            { title: "Book 3", quantity_available: 8 },
            { title: "Book 4", quantity_available: 2 },
            { title: "Book 5", quantity_available: 6 },
        ];

        const itemsPerPage = constants.itemsPerPage;
        const totalPages = Math.ceil(books.length / itemsPerPage);

        await displayAvailableBooksWithQuantity(message, books);

        const embeds = [];

        for (let i = 0; i < books.length; i += itemsPerPage) {
            const currentBooks = books.slice(i, i + itemsPerPage);
            let formattedBooks = "";

            currentBooks.forEach((book, index) => {
                formattedBooks += `**ID:**\t${i + index + 1}\n**Title:**\t${book.title}\n**Quantity:**\t${book.quantity_available}\n\n`;
            });

            const embed = new EmbedBuilder()
                .setTitle(
                    `${constants.AVAILABEL_BOOKS} (Page ${Math.floor(i / itemsPerPage) + 1}/${totalPages})`,
                )
                .setColor("#00FF00")
                .setDescription(formattedBooks);

            embeds.push(embed);
        }

        expect(pagination).toHaveBeenCalledWith(message, embeds);
    });
});
