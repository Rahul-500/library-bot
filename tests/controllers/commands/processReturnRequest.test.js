const { processReturnRequest } = require('../../../src/controllers/commands/processReturnRequest');
const { updateReturnRequestStatus } = require('../../../src/service/databaseService');
const constants = require('../../../src/constants/constant');
const { notifyUserAboutReturnRequest } = require('../../../src/service/notifier');

jest.mock('../../../src/service/databaseService', () => ({
    updateReturnRequestStatus: jest.fn(),
}));
jest.mock('../../../src/service/notifier', () => ({
    notifyUserAboutReturnRequest: jest.fn(),
}));

describe('processReturnRequest function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should reply with invalid return request ID message if request ID does not exist', async () => {
        const mockClient = {};
        const mockMessage = {
            content: '/approve 1',
            author: { id: '1234567890' },
            channel: {
                createMessageCollector: jest.fn(() => ({
                    on: jest.fn((event, callback) => {
                        if (event === 'collect') {
                            callback({ content: '/approve 999' });
                        } else if (event === 'end') {
                            callback();
                        }
                    }),
                    stop: jest.fn(),
                })),
            },
            reply: jest.fn(),
        };

        const mockConnection = {};
        const mockReturnRequests = [];
        const mockUserEventsMap = new Map();
        mockUserEventsMap.set('1234567890', { messageCreate: false });

        await processReturnRequest(mockClient, mockMessage, mockConnection, mockReturnRequests, mockUserEventsMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.INVALID_RETURN_REQUEST_ID_MESSAGE);
        expect(updateReturnRequestStatus).not.toHaveBeenCalled();
        expect(notifyUserAboutReturnRequest).not.toHaveBeenCalled();
    });

    test('should update return request status and notify user if request is approved', async () => {
        const mockClient = {};
        const mockMessage = {
            content: '/approve 1',
            author: { id: '1234567890' },
            channel: {
                createMessageCollector: jest.fn(() => ({
                    on: jest.fn((event, callback) => {
                        if (event === 'collect') {
                            callback({ content: '/approve 1' });
                        } else if (event === 'end') {
                            callback();
                        }
                    }),
                    stop: jest.fn(),
                })),
            },
            reply: jest.fn(),
        };

        const mockConnection = {};
        const mockReturnRequests = [{ id: 1, user_id: 'user123', description: 'Test return request' }];
        const mockUserEventsMap = new Map();
        mockUserEventsMap.set('1234567890', { messageCreate: false });

        await processReturnRequest(mockClient, mockMessage, mockConnection, mockReturnRequests, mockUserEventsMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.CHANGE_RETURN_REQUEST_STATUS_MESSAGE);
    });

});
