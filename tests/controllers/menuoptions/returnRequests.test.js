const constants = require('../../../src/constants/constant');
const { isAdmin } = require('../../../src/middleware/validateAdmin');
const { getReturnRequests } = require('../../../src/service/databaseService');
const { processReturnRequest } = require('../../../src/controllers/commands/processReturnRequest');
const display = require('../../../src/utils/display');
const { returnRequests } = require('../../../src/controllers/menuoptions/returnRequests');

jest.mock('../../../src/middleware/validateAdmin', () => ({
    isAdmin: jest.fn(),
}));

jest.mock('../../../src/service/databaseService', () => ({
    getReturnRequests: jest.fn(),
}));

jest.mock('../../../src/controllers/commands/processReturnRequest', () => ({
    processReturnRequest: jest.fn(),
}));
jest.mock('../../../src/utils/display', () => ({
    returnRequests: jest.fn(),
}));

describe('returnRequests function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should reply with help message if user is not admin', async () => {
        const mockClient = {};
        const mockMessage = {
            reply: jest.fn(),
        };
        const mockConnection = {};
        const mockUserEventsMap = {};
        isAdmin.mockReturnValue(false);

        await returnRequests(mockClient, mockMessage, mockConnection, mockUserEventsMap);

        expect(isAdmin).toHaveBeenCalledWith(mockMessage);
        expect(mockMessage.reply).toHaveBeenCalledWith(constants.HELP_MESSAGE);
        expect(getReturnRequests).not.toHaveBeenCalled();
        expect(display.returnRequests).not.toHaveBeenCalled();
        expect(processReturnRequest).not.toHaveBeenCalled();
    });

    test('should call getReturnRequests, display return requests, and process return requests if user is admin', async () => {
        const mockClient = {};
        const mockMessage = {};
        const mockConnection = {};
        const mockUserEventsMap = {};
        isAdmin.mockReturnValue(true);
        const mockReturnRequests = ['request1', 'request2'];
        getReturnRequests.mockResolvedValue(mockReturnRequests);

        await returnRequests(mockClient, mockMessage, mockConnection, mockUserEventsMap);

        expect(isAdmin).toHaveBeenCalledWith(mockMessage);
        expect(getReturnRequests).toHaveBeenCalledWith(mockConnection);
        expect(display.returnRequests).toHaveBeenCalledWith(mockMessage, mockReturnRequests);
        expect(processReturnRequest).toHaveBeenCalledWith(mockClient, mockMessage, mockConnection, mockReturnRequests, mockUserEventsMap);
    });

    test('should not display return requests if getReturnRequests returns null', async () => {
        const mockClient = {};
        const mockMessage = {};
        const mockConnection = {};
        const mockUserEventsMap = {};
        isAdmin.mockReturnValue(true);
        getReturnRequests.mockResolvedValue(null);

        await returnRequests(mockClient, mockMessage, mockConnection, mockUserEventsMap);

        expect(isAdmin).toHaveBeenCalledWith(mockMessage);
        expect(getReturnRequests).toHaveBeenCalledWith(mockConnection);
        expect(display.returnRequests).not.toHaveBeenCalled();
        expect(processReturnRequest).not.toHaveBeenCalled();
    });

    test('should handle error if getReturnRequests throws an error', async () => {
        const mockClient = {};
        const mockMessage = {};
        const mockConnection = {};
        const mockUserEventsMap = {};
        isAdmin.mockReturnValue(true);
        const mockError = new Error('Database error');
        getReturnRequests.mockRejectedValue(mockError);

        await expect(returnRequests(mockClient, mockMessage, mockConnection, mockUserEventsMap)).rejects.toThrow(mockError);

        expect(isAdmin).toHaveBeenCalledWith(mockMessage);
        expect(getReturnRequests).toHaveBeenCalledWith(mockConnection);
        expect(display.returnRequests).not.toHaveBeenCalled();
        expect(processReturnRequest).not.toHaveBeenCalled();
    });
});
