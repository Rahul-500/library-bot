const { help } = require("../../../src/controllers/commands/help");
const constants = require("../../../src/constants/constant");

describe("help function", () => {
    test("should reply with help message for user", () => {
        const mockMessage = {
            reply: jest.fn(),
        };
        const isAdmin = false;

        help(mockMessage, isAdmin);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.USER_COMMANDS);
    });

    test("should reply with help message for admin", () => {
        const mockMessage = {
            reply: jest.fn(),
        };
        const isAdmin = true;

        help(mockMessage, isAdmin);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.ADMIN_COMMANDS + constants.USER_COMMANDS);
    });
});
