const constants = require('../../../src/constants/constant');
const { isAdmin } = require('../../../src/middleware/validateAdmin');
const { requestBook } = require('../../../src/controllers/commands/requestBook');
const { requestBook: requestBookFunction } = require('../../../src/controllers/menuoptions/requestBook');

jest.mock('../../../src/middleware/validateAdmin', () => ({
    isAdmin: jest.fn(),
}));

jest.mock('../../../src/controllers/commands/requestBook', () => ({
    requestBook: jest.fn(),
}));

describe('requestBook function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should reply with help message if user is admin', async () => {
        const mockClient = {};
        const mockMessage = {
            reply: jest.fn(),
        };
        const mockConnection = {};
        const mockUserEventsMap = {};
        isAdmin.mockReturnValue(true);

        await requestBookFunction(mockClient, mockMessage, mockConnection, mockUserEventsMap);

        expect(isAdmin).toHaveBeenCalledWith(mockMessage);
        expect(mockMessage.reply).toHaveBeenCalledWith(constants.HELP_MESSAGE);
        expect(requestBook).not.toHaveBeenCalled();
    });

    test('should call requestBook if user is not admin', async () => {
        const mockClient = {};
        const mockMessage = {};
        const mockConnection = {};
        const mockUserEventsMap = {};
        isAdmin.mockReturnValue(false);

        await requestBookFunction(mockClient, mockMessage, mockConnection, mockUserEventsMap);

        expect(isAdmin).toHaveBeenCalledWith(mockMessage);
        expect(requestBook).toHaveBeenCalledWith(mockClient, mockMessage, mockConnection, mockUserEventsMap);
    });
});
