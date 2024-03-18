const constants = require('../../src/constants/constant');
const { notifyAdminNewBookRequest } = require('../../src/service/notifier');

describe('notifyAdminNewBookRequest', () => {
    let mockConnection;
    let mockClient;
    let mockUser;
    beforeEach(() => {
        mockConnection = {
            query: jest.fn(),
        };

        mockUser = {
            send: jest.fn(),
        };
        mockClient = {
            users: {
                fetch: jest.fn().mockResolvedValue(mockUser),
            },
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should notify admin and reply with success message', async () => {
        const message = {
            author: {
                username: 'TestUser',
            },
            reply: jest.fn(),
        };
        const bookRequest = 'Test book request';
        const userIdList = [{ id: '123' }, { id: '456' }];

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, userIdList);
        });

        await notifyAdminNewBookRequest(mockClient, message, mockConnection, bookRequest);

        expect(mockUser.send).toHaveBeenCalledWith('Book request by TestUser : Test book request');
        expect(message.reply).toHaveBeenCalledWith(constants.SUCCESSFULL_SENDING_TO_ADMIN_MESSAGE);
    });

    it('should handle error when userIdList is null', async () => {
        const message = {
            author: {
                username: 'TestUser',
            },
            reply: jest.fn(),
        };
        const bookRequest = 'Test book request';
        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, null);
        });

        await notifyAdminNewBookRequest(mockClient, message, mockConnection, bookRequest);

        expect(mockClient.users.fetch).not.toHaveBeenCalled();
        expect(message.reply).toHaveBeenCalledWith(constants.UNEXPECTED_REQUEST_NEW_BOOK_ERROR_MESSAGE);
    });
});
