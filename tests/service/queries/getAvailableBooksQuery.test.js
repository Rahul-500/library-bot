const { getAvailableBooksQuery } = require('../../../src/service/queries/getAvailableBooksQuery');
const { DB_NAME } = require('dotenv').config().parsed;

jest.mock('../../../src/service/transactions', () => ({
    beginTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
}));

describe('getAvailableBooksQuery function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch available books successfully', async () => {
        const mockConnection = { query: jest.fn() };

        const mockBooks = [
            { id: 1, title: 'Book 1', author: 'Author 1', status: 'Available' },
            { id: 2, title: 'Book 2', author: 'Author 2', status: 'Available' },
        ];

        mockConnection.query.mockImplementationOnce((query, callback) => {
            const expectedQuery = `SELECT * FROM ${DB_NAME}.books`;
            expect(query).toEqual(expectedQuery);
            callback(null, mockBooks);
        });

        const result = await getAvailableBooksQuery(mockConnection);

        expect(mockConnection.query).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockBooks);
    });

    it('should handle database query failure', async () => {
        const mockConnection = { query: jest.fn() };

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(new Error('Database error'));
        });

        const result = await getAvailableBooksQuery(mockConnection);

        expect(mockConnection.query).toHaveBeenCalledTimes(1);
        expect(result).toBeNull();
    });
});
