const validateUser = require('../../src/service/validateUser');

describe('checkForExistingUser', () => {
    let mockConnection;
    let mockQuery;

    beforeEach(() => {
        mockQuery = jest.fn();
        mockConnection = {
            query: mockQuery,
        };
    });

    test('should resolve to true if user exists', async () => {
        const mockMessage = {
            author: { id: '123' },
        };

        const mockResult = [{ id: '123', username: 'TestUser' }];
        mockQuery.mockImplementationOnce((query, callback) => {
            callback(null, mockResult);
        });

        const result = await validateUser.checkForExistingUser(mockMessage, mockConnection);
        expect(result).toBe(true);
    });

    test('should resolve to false if user does not exist', async () => {
        const mockMessage = {
            author: { id: '456' },
        };

        const mockResult = [];
        mockQuery.mockImplementationOnce((query, callback) => {
            callback(null, mockResult);
        });

        const result = await validateUser.checkForExistingUser(mockMessage, mockConnection);
        expect(result).toBe(false);
    });

    test('should reject with an error if there is a database error', async () => {
        const mockMessage = {
            author: { id: '789' },
        };

        const mockError = new Error('Database error');
        mockQuery.mockImplementationOnce((query, callback) => {
            callback(mockError, null);
        });

        await expect(validateUser.checkForExistingUser(mockMessage, mockConnection)).rejects.toThrow(mockError);
    });
});

describe('isAdmin', () => {
    beforeEach(() => {
        process.env.BOT_OWNER_USER_NAME = '';
    });

    test('should return true for the bot owner user', () => {
        const mockMessage = {
            author: {
                username: 'AdminUserName',
            },
        };

        process.env.BOT_OWNER_USER_NAME = 'AdminUserName';
        
        const result = validateUser.isAdmin(mockMessage);

        expect(result).toBe(true);
    });

    test('should return false for a non-bot owner user', () => {
        const mockMessage = {
            author: {
                username: 'UserName',
            },
        };

        process.env.BOT_OWNER_USER_NAME = 'AdminUserName';

        const result = validateUser.isAdmin(mockMessage);

        expect(result).toBe(false);
    });

    test('should return false when BOT_OWNER_USER_NAME is not set', () => {
        const mockMessage = {
            author: {
                username: 'AdminUserName',
            },
        };

        const result = validateUser.isAdmin(mockMessage);

        expect(result).toBe(false);
    });
});

