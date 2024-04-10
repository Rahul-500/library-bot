const { getNewBookRequestsQuery } = require('../../../src/service/queries/getNewBookRequestsQuery');
const { DB_NAME } = require('dotenv').config().parsed;
const constants = require('../../../src/constants/constant');

jest.mock('../../../src/service/transactions', () => ({
    beginTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
}));

describe('getNewBookRequestsQuery function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch new book requests successfully', async () => {
        const mockConnection = { query: jest.fn() };

        const mockResults = [
            { id: 1, user_id: 1, name: 'User 1', description: 'Request description 1', status: 'Pending' },
            { id: 2, user_id: 2, name: 'User 2', description: 'Request description 2', status: 'Approved' },
        ];

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, mockResults);
        });

        const result = await getNewBookRequestsQuery(mockConnection);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(result).toEqual(mockResults);
    });

    it('should handle database query failure', async () => {
        const mockConnection = { query: jest.fn() };

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(new Error('Database error'));
        });

        const result = await getNewBookRequestsQuery(mockConnection);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(result).toBeNull();
    });
});
