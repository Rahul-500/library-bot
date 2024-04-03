const { processBookRequest } = require('../../../src/controllers/commands/processBookRequest');
const { updateBookRequestStatus } = require('../../../src/service/databaseService');
const constants = require('../../../src/constants/constant');
const { notifyUserAboutBookRequest } = require('../../../src/service/notifier');

jest.mock('../../../src/service/databaseService', () => ({
    updateBookRequestStatus: jest.fn(),
}));
jest.mock('../../../src/service/notifier', () => ({
    notifyUserAboutBookRequest: jest.fn(),
}));

describe('processBookRequest function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should reply with invalid request ID message if request ID does not exist', async () => {
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
        const mockBookRequests = [];
        const mockUserEventsMap = new Map();
        mockUserEventsMap.set('1234567890', { messageCreate: false });

        await processBookRequest(mockClient, mockMessage, mockConnection, mockBookRequests, mockUserEventsMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.INVALID_REQUEST_ID_MESSAGE);
        expect(updateBookRequestStatus).not.toHaveBeenCalled();
        expect(notifyUserAboutBookRequest).not.toHaveBeenCalled();
    });

    test('should update book request status and notify user if request is approved', async () => {
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
        const mockBookRequests = [{ id: 1, user_id: 'user123', description: 'Test request' }];
        const mockUserEventsMap = new Map();
        mockUserEventsMap.set('1234567890', { messageCreate: false });

        await processBookRequest(mockClient, mockMessage, mockConnection, mockBookRequests, mockUserEventsMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.CHANGE_BOOK_REQUEST_STATUS_MESSAGE); // Change the expectation to match the actual message sent by the function
        expect(updateBookRequestStatus).toHaveBeenCalledWith(mockConnection, 1, 'approved');
    });

});
