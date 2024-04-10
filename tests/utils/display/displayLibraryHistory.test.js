const { formatDate } = require("../../../src/utils/formatDate");
const constants = require("../../../src/constants/constant");
const { EmbedBuilder } = require("discord.js");
const { displayLibraryHistory } = require("../../../src/utils/display/displayLibraryHistory");
const { pagination } = require("../../../src/utils/pagination");

jest.mock("../../../src/utils/pagination");

describe("displayLibraryHistory", () => {
    let message;

    beforeEach(() => {
        message = {
            reply: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should display a message when no history is available", async () => {
        const libraryhistory = [];

        await displayLibraryHistory(message, libraryhistory);

        const embed = new EmbedBuilder()
            .setTitle(constants.NO_HISTORY_FOUND)
            .setColor("#FF0000")
            .setDescription(constants.SORRY_MESSAGE_FOR_NO_HISTORY);

        expect(message.reply).toHaveBeenCalledWith({ embeds: [embed] });
    });

    it("should display library history with pagination", async () => {
        const libraryhistory = [
            { name: "User 1", title: "Book 1", checked_out: "2022-01-01", returned: "2022-01-10" },
            { name: "User 2", title: "Book 2", checked_out: "2022-02-01", returned: "2022-02-15" },
            { name: "User 3", title: "Book 3", checked_out: "2022-03-01", returned: "2022-03-05" },
            { name: "User 4", title: "Book 4", checked_out: "2022-04-01", returned: "2022-04-10" },
            { name: "User 5", title: "Book 5", checked_out: "2022-05-01", returned: "2022-05-20" },
        ];

        const itemsPerPage = constants.itemsPerPage;
        const totalPages = Math.ceil(libraryhistory.length / itemsPerPage);

        await displayLibraryHistory(message, libraryhistory);

        const embeds = [];

        for (let i = 0; i < libraryhistory.length; i += itemsPerPage) {
            const currentHistory = libraryhistory.slice(i, i + itemsPerPage);
            let formattedLibraryhistory = "";

            currentHistory.forEach((history, index) => {
                const checkedOut = formatDate(history.checked_out);
                const returned = formatDate(history.returned);

                formattedLibraryhistory += `**ID:**\t${i + index + 1}\n**User:**\t${history.name}\n**Book:**\t${history.title}\n**Checked-out:**\t${checkedOut}\n**Returned:**\t${returned}\n\n`;
            });

            const embed = new EmbedBuilder()
                .setTitle(
                    `${constants.LIBRARY_HISTORY} (Page ${Math.floor(i / itemsPerPage) + 1}/${totalPages})`,
                )
                .setColor("#00FF00")
                .setDescription(formattedLibraryhistory);

            embeds.push(embed);
        }

        expect(pagination).toHaveBeenCalledWith(message, embeds);
    });
});
