const constants = require('../../../src/constants/constant');
const { isAdmin } = require('../../../src/middleware/validateAdmin');
const { getLibraryHistory } = require('../../../src/controllers/commands/getLibraryHistory');
const { libraryHistory } = require('../../../src/controllers/menuoptions/libraryHistory');
const { displayLibraryHistory } = require('../../../src/utils/display/displayLibraryHistory');

jest.mock('../../../src/middleware/validateAdmin', () => ({
    isAdmin: jest.fn(),
}));

jest.mock('../../../src/controllers/commands/getLibraryHistory', () => ({
    getLibraryHistory: jest.fn(),
}));

jest.mock('../../../src/utils/display/displayLibraryHistory')

describe('libraryHistory function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should reply with help message if user is not admin', async () => {
        const mockMessage = {
            reply: jest.fn(),
        };
        isAdmin.mockReturnValue(false);

        await libraryHistory(mockMessage);

        expect(isAdmin).toHaveBeenCalledWith(mockMessage);
        expect(mockMessage.reply).toHaveBeenCalledWith(constants.HELP_MESSAGE);
        expect(getLibraryHistory).not.toHaveBeenCalled();
        expect(displayLibraryHistory).not.toHaveBeenCalled();
    });

    test('should call getLibraryHistory and display results if user is admin', async () => {
        const mockMessage = {};
        const mockConnection = {};
        isAdmin.mockReturnValue(true);
        getLibraryHistory.mockResolvedValue(['history1', 'history2']);

        await libraryHistory(mockMessage, mockConnection);

        expect(isAdmin).toHaveBeenCalledWith(mockMessage);
        expect(getLibraryHistory).toHaveBeenCalledWith(mockMessage, mockConnection);
        expect(displayLibraryHistory).toHaveBeenCalledWith(mockMessage, ['history1', 'history2']);
    });

    test('should handle error if getLibraryHistory throws an error', async () => {
        const mockMessage = {};
        const mockConnection = {};
        isAdmin.mockReturnValue(true);
        const mockError = new Error('Database error');
        getLibraryHistory.mockRejectedValue(mockError);

        await expect(libraryHistory(mockMessage, mockConnection)).rejects.toThrow(mockError);

        expect(isAdmin).toHaveBeenCalledWith(mockMessage);
        expect(getLibraryHistory).toHaveBeenCalledWith(mockMessage, mockConnection);
        expect(displayLibraryHistory).not.toHaveBeenCalled();
    });
});
