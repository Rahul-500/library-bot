const constants = require("../../../src/constants/constant");
const { EmbedBuilder } = require("discord.js");
const { displayReturnRequests } = require("../../../src/utils/display/displayReturnRequests");
const { pagination } = require("../../../src/utils/pagination");

jest.mock("../../../src/utils/pagination");

describe("displayReturnRequests", () => {
    let message;

    beforeEach(() => {
        message = {
            reply: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should display a message when no return requests are available", async () => {
        const returnRequests = [];

        await displayReturnRequests(message, returnRequests);

        const embed = new EmbedBuilder()
            .setTitle(constants.NO_RETURN_REQUEST_FOUND)
            .setColor("#FF0000")
            .setDescription(constants.SORRY_MESSAGE_FOR_NO_RETURN_REQUEST);

        expect(message.reply).toHaveBeenCalledWith({ embeds: [embed] });
    });

    it("should display return requests with pagination", async () => {
        const returnRequests = [
            { name: "User 1", title: "Book 1", status: "Pending" },
            { name: "User 2", title: "Book 2", status: "Approved" },
            { name: "User 3", title: "Book 3", status: "Denied" },
            { name: "User 4", title: "Book 4", status: "Pending" },
            { name: "User 5", title: "Book 5", status: "Approved" },
        ];

        const itemsPerPage = constants.itemsPerPage;
        const totalPages = Math.ceil(returnRequests.length / itemsPerPage);

        await displayReturnRequests(message, returnRequests);

        const embeds = [];

        for (let i = 0; i < returnRequests.length; i += itemsPerPage) {
            const currentReturnRequest = returnRequests.slice(i, i + itemsPerPage);
            const fields = currentReturnRequest.map((returnRequest, index) => ({
                name: `**ID:** ${i + index + 1}`,
                value: `**Name:** ${returnRequest.name}\n**Title:** ${returnRequest.title}\n**Status:** ${returnRequest.status}`,
                inline: false,
            }));

            const embed = new EmbedBuilder()
                .setTitle(
                    `${constants.RETURN_REQUESTS} (Page ${Math.floor(i / itemsPerPage) + 1}/${totalPages})`,
                )
                .setColor("#00FF00")
                .addFields(fields);

            embeds.push(embed);
        }

        expect(pagination).toHaveBeenCalledWith(message, embeds);
    });
});
