const { isAdmin } = require("../../../src/middleware/validateAdmin");
const { getAvailableBooks } = require("../../../src/controllers/commands/getAvailableBooks");
const { updateBook } = require("../../../src/controllers/commands/updateBook");
const constants = require('../../../src/constants/constant');
const { updateBook: updateBookFunction } = require('../../../src/controllers/menuoptions/updateBook');
const { displayAvailableBooksWithQuantity } = require("../../../src/utils/display/displayAvailableBooksWithQuantity");

jest.mock('../../../src/middleware/validateAdmin', () => ({
    isAdmin: jest.fn(),
}));

jest.mock("../../../src/controllers/commands/getAvailableBooks", () => ({
    getAvailableBooks: jest.fn(),
}));

jest.mock('../../../src/utils/display/displayAvailableBooksWithQuantity');

jest.mock("../../../src/controllers/commands/updateBook", () => ({
    updateBook: jest.fn(),
}));

describe('updateBook function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should reply with help message if user is not admin', async () => {
        const mockMessage = {
            reply: jest.fn(),
        };
        const mockConnection = {};
        const mockBookMap = {};
        const mockUserEventsMap = {};
        isAdmin.mockReturnValue(false);

        await updateBookFunction(mockMessage, mockConnection, mockBookMap, mockUserEventsMap);

        expect(isAdmin).toHaveBeenCalledWith(mockMessage);
        expect(mockMessage.reply).toHaveBeenCalledWith(constants.HELP_MESSAGE);
        expect(getAvailableBooks).not.toHaveBeenCalled();
        expect(displayAvailableBooksWithQuantity).not.toHaveBeenCalled();
        expect(updateBook).not.toHaveBeenCalled();
    });

    test('should call getAvailableBooks, display books, and update book if user is admin', async () => {
        const mockMessage = {};
        const mockConnection = {};
        const mockBookMap = {};
        const mockUserEventsMap = {};
        isAdmin.mockReturnValue(true);
        const mockBooksForUpdate = ['book1', 'book2'];
        getAvailableBooks.mockResolvedValue(mockBooksForUpdate);

        await updateBookFunction(mockMessage, mockConnection, mockBookMap, mockUserEventsMap);

        expect(isAdmin).toHaveBeenCalledWith(mockMessage);
        expect(getAvailableBooks).toHaveBeenCalledWith(mockMessage, mockConnection, mockBookMap);
        expect(displayAvailableBooksWithQuantity).toHaveBeenCalledWith(mockMessage, mockBooksForUpdate);
        expect(updateBook).toHaveBeenCalledWith(mockMessage, mockConnection, mockBookMap, mockUserEventsMap);
    });

    test('should not display books if getAvailableBooks returns null', async () => {
        const mockMessage = {};
        const mockConnection = {};
        const mockBookMap = {};
        const mockUserEventsMap = {};
        isAdmin.mockReturnValue(true);
        getAvailableBooks.mockResolvedValue(null);

        await updateBookFunction(mockMessage, mockConnection, mockBookMap, mockUserEventsMap);

        expect(isAdmin).toHaveBeenCalledWith(mockMessage);
        expect(getAvailableBooks).toHaveBeenCalledWith(mockMessage, mockConnection, mockBookMap);
        expect(displayAvailableBooksWithQuantity).not.toHaveBeenCalled();
        expect(updateBook).not.toHaveBeenCalled();
    });
});
