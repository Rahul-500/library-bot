const { getUserQuery } = require('../../../src/service/queries/getUserQuery');
const { DB_NAME } = require('dotenv').config().parsed;

jest.mock('../../../src/service/transactions', () => ({
    beginTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
}));

describe('getUser function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch user data successfully', async () => {
        const mockConnection = { query: jest.fn() };
        const userId = 1;
        const mockUser = { id: userId, name: 'Test User', email: 'test@example.com' };

        mockConnection.query.mockImplementationOnce((query, callback) => {
            const expectedQuery = `SELECT * FROM ${DB_NAME}.users WHERE id = ${userId}`;
            expect(query).toEqual(expectedQuery);
            callback(null, [mockUser]);
        });

        const result = await getUserQuery(mockConnection, userId);

        expect(mockConnection.query).toHaveBeenCalledTimes(1);
        expect(result[0]).toEqual(mockUser);
    });

    it('should handle database query failure', async () => {
        const mockConnection = { query: jest.fn() };
        const userId = 1;

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(new Error('Database error'));
        });

        const result = await getUserQuery(mockConnection, userId);

        expect(mockConnection.query).toHaveBeenCalledTimes(1);
        expect(result).toBeNull();
    });
});
