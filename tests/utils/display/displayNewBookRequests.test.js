const constants = require("../../../src/constants/constant");
const { EmbedBuilder } = require("discord.js");
const { displayNewBookRequests } = require("../../../src/utils/display/displayNewBookRequests");
const { pagination } = require("../../../src/utils/pagination");

jest.mock("../../../src/utils/pagination");

describe("displayNewBookRequests", () => {
    let message;

    beforeEach(() => {
        message = {
            reply: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should display a message when no book requests are available", async () => {
        const bookRequests = [];

        await displayNewBookRequests(message, bookRequests);

        const embed = new EmbedBuilder()
            .setTitle(constants.NO_BOOK_REQUESTS_FOUND)
            .setColor("#FF0000")
            .setDescription(constants.SORRY_MESSAGE_FOR_NO_BOOK_REQUEST);

        expect(message.reply).toHaveBeenCalledWith({ embeds: [embed] });
    });

    it("should display new book requests with pagination", async () => {
        const bookRequests = [
            { name: "User 1", description: "Request 1", status: "Pending" },
            { name: "User 2", description: "Request 2", status: "Approved" },
            { name: "User 3", description: "Request 3", status: "Denied" },
            { name: "User 4", description: "Request 4", status: "Pending" },
            { name: "User 5", description: "Request 5", status: "Approved" },
        ];

        const itemsPerPage = constants.itemsPerPage;
        const totalPages = Math.ceil(bookRequests.length / itemsPerPage);

        await displayNewBookRequests(message, bookRequests);

        const embeds = [];

        for (let i = 0; i < bookRequests.length; i += itemsPerPage) {
            const currentBookRequests = bookRequests.slice(i, i + itemsPerPage);
            const fields = currentBookRequests.map((bookRequest, index) => ({
                name: `**ID:** ${i + index + 1}`,
                value: `**Name:** ${bookRequest.name}\n**Request:** ${bookRequest.description}\n**Status:** ${bookRequest.status}`,
                inline: false,
            }));

            const embed = new EmbedBuilder()
                .setTitle(
                    `${constants.BOOK_REQUESTS} (Page ${Math.floor(i / itemsPerPage) + 1}/${totalPages})`,
                )
                .setColor("#00FF00")
                .addFields(fields);

            embeds.push(embed);
        }

        expect(pagination).toHaveBeenCalledWith(message, embeds);
    });
});
