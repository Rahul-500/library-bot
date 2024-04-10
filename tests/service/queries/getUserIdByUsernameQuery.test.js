const { getUserIdByUsernameQuery } = require('../../../src/service/queries/getUserIdByUsernameQuery');
const { DB_NAME } = require('dotenv').config().parsed;
const constants = require('../../../src/constants/constant');

jest.mock('../../../src/service/transactions', () => ({
    beginTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
}));

describe('getUserIdByUsernameQuery function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch user ID by username successfully', async () => {
        const mockConnection = { query: jest.fn() };
        const username = 'testUser';

        const mockResults = [{ id: 1 }];

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, mockResults);
        });

        const result = await getUserIdByUsernameQuery(mockConnection, username);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(result).toEqual(mockResults);
    });

    it('should handle database query failure', async () => {
        const mockConnection = { query: jest.fn() };
        const username = 'testUser';

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(new Error('Database error'));
        });

        const result = await getUserIdByUsernameQuery(mockConnection, username);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(result).toBeNull();
    });
});
