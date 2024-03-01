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
