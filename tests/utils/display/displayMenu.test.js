const constants = require("../../../src/constants/constant");
const { EmbedBuilder } = require("discord.js");
const { displayMenu } = require("../../../src/utils/display/displayMenu");
const { isAdmin } = require("../../../src/middleware/validateAdmin");

jest.mock("../../../src/middleware/validateAdmin");

describe("displayMenu", () => {
    let message;

    beforeEach(() => {
        message = {
            author: { username: "test_user" },
            reply: jest.fn(),
        };

        isAdmin.mockReturnValue(false);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should display menu options for a regular user", () => {
        displayMenu(message);

        const menuOptions = constants.MENU_OPTIONS;
        const welcomeMessage = `${constants.WELCOME_MESSAGE}, ${message.author.username}!`;

        const embed = new EmbedBuilder()
            .setColor(constants.EMBED_COLOR)
            .setTitle(constants.MENU_TITLE)
            .setDescription(welcomeMessage)
            .addFields(
                { name: "Options", value: menuOptions, inline: false },
                { name: "How to use", value: constants.HELP_MESSAGE },
            )
            .setFooter({ text: constants.FOOTER_TEXT });

        expect(message.reply).toHaveBeenCalledWith({ embeds: [embed] });
    });

    it("should display admin menu options for an admin user", () => {
        isAdmin.mockReturnValue(true);
        displayMenu(message);

        const menuOptions = constants.ADMIN_OPTIONS;
        const welcomeMessage = `${constants.WELCOME_MESSAGE}, ${message.author.username}!`;

        const embed = new EmbedBuilder()
            .setColor(constants.EMBED_COLOR)
            .setTitle(constants.MENU_TITLE)
            .setDescription(welcomeMessage)
            .addFields(
                { name: "Options", value: menuOptions, inline: false },
                { name: "How to use", value: constants.HELP_MESSAGE },
            )
            .setFooter({ text: constants.FOOTER_TEXT });

        expect(message.reply).toHaveBeenCalledWith({ embeds: [embed] });
    });
});
