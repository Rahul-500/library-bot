const { getUserBooksQuery } = require('../../../src/service/queries/getUserBooksQuery');
const { DB_NAME } = require('dotenv').config().parsed;

jest.mock('../../../src/service/transactions', () => ({
    beginTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
}));

describe('getUserBooksQuery function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch user books successfully', async () => {
        const mockConnection = { query: jest.fn() };
        const userId = 1;

        const mockBooks = [
            { id: 1, title: 'Book 1', author: 'Author 1', checked_out: true },
            { id: 2, title: 'Book 2', author: 'Author 2', checked_out: false },
        ];

        mockConnection.query.mockImplementationOnce((query, callback) => {
            const expectedQuery = `
                SELECT b.*, i.checked_out 
            `;
            expect(query).toEqual(expectedQuery);
            callback(null, mockBooks);
        });

        const result = await getUserBooksQuery(mockConnection, userId);

        expect(mockConnection.query).toHaveBeenCalledTimes(1);
    });

    it('should handle database query failure', async () => {
        const mockConnection = { query: jest.fn() };
        const userId = 1;

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(new Error('Database error'));
        });

        const result = await getUserBooksQuery(mockConnection, userId);

        expect(mockConnection.query).toHaveBeenCalledTimes(1);
        expect(result).toBeNull();
    });
});
