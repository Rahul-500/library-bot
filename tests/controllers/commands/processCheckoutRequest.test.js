const { processCheckoutRequest } = require('../../../src/controllers/commands/processCheckoutRequest');
const constants = require('../../../src/constants/constant');
const { notifyUserAboutCheckoutRequest } = require('../../../src/service/notifier');
const { updateCheckoutRequestStatusQuery } = require('../../../src/service/queries/updateCheckoutRequestStatusQuery');

jest.mock('../../../src/service/queries/updateCheckoutRequestStatusQuery')
jest.mock('../../../src/service/notifier', () => ({
    notifyUserAboutCheckoutRequest: jest.fn(),
}));

describe('processCheckoutRequest function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should reply with invalid checkout request ID message if request ID does not exist', async () => {
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
        const mockCheckoutRequests = [];
        const mockUserEventsMap = new Map();
        mockUserEventsMap.set('1234567890', { messageCreate: false });

        await processCheckoutRequest(mockClient, mockMessage, mockConnection, mockCheckoutRequests, mockUserEventsMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.INVALID_CHECKOUT_REQUEST_ID_MESSAGE);
        expect(updateCheckoutRequestStatusQuery).not.toHaveBeenCalled();
        expect(notifyUserAboutCheckoutRequest).not.toHaveBeenCalled();
    });

    test('should update checkout request status and notify user if request is approved', async () => {
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
        const mockCheckoutRequests = [{ id: 1, user_id: 'user123', description: 'Test checkout request' }];
        const mockUserEventsMap = new Map();
        mockUserEventsMap.set('1234567890', { messageCreate: false });

        await processCheckoutRequest(mockClient, mockMessage, mockConnection, mockCheckoutRequests, mockUserEventsMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.CHANGE_CHECKOUT_REQUEST_STATUS_MESSAGE);
    });

});
