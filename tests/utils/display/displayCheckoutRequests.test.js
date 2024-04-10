const constants = require("../../../src/constants/constant");
const { EmbedBuilder } = require("discord.js");
const { displayCheckoutRequests } = require("../../../src/utils/display/displayCheckoutRequests");
const { pagination } = require("../../../src/utils/pagination");

jest.mock("../../../src/utils/pagination");

describe("displayCheckoutRequests", () => {
    let message;

    beforeEach(() => {
        message = {
            reply: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should display a message when no checkout requests are available", async () => {
        const checkoutRequests = [];

        await displayCheckoutRequests(message, checkoutRequests);

        const embed = new EmbedBuilder()
            .setTitle(constants.NO_CHECKOUT_REQUEST_FOUND)
            .setColor("#FF0000")
            .setDescription(constants.SORRY_MESSAGE_FOR_NO_CHECKOUT_REQUEST);

        expect(message.reply).toHaveBeenCalledWith({ embeds: [embed] });
    });

    it("should display checkout requests with pagination", async () => {
        const checkoutRequests = [
            { name: "User 1", title: "Book 1", status: "Pending" },
            { name: "User 2", title: "Book 2", status: "Approved" },
            { name: "User 3", title: "Book 3", status: "Denied" },
            { name: "User 4", title: "Book 4", status: "Pending" },
            { name: "User 5", title: "Book 5", status: "Approved" },
        ];

        const itemsPerPage = constants.itemsPerPage;
        const totalPages = Math.ceil(checkoutRequests.length / itemsPerPage);

        await displayCheckoutRequests(message, checkoutRequests);

        const embeds = [];

        for (let i = 0; i < checkoutRequests.length; i += itemsPerPage) {
            const currentCheckoutRequest = checkoutRequests.slice(i, i + itemsPerPage);
            const fields = currentCheckoutRequest.map((checkoutRequest, index) => ({
                name: `**ID:** ${i + index + 1}`,
                value: `**Name:** ${checkoutRequest.name}\n**Title:** ${checkoutRequest.title}\n**Status:** ${checkoutRequest.status}`,
                inline: false,
            }));

            const embed = new EmbedBuilder()
                .setTitle(
                    `${constants.CHECKOUT_REQUESTS} (Page ${Math.floor(i / itemsPerPage) + 1}/${totalPages})`,
                )
                .setColor("#00FF00")
                .addFields(fields);

            embeds.push(embed);
        }

        expect(pagination).toHaveBeenCalledWith(message, embeds);
    });
});
