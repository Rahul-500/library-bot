const { returnBookWithIdQuery } = require('../../../src/service/queries/returnBookWithIdQuery');
const transactions = require('../../../src/service/transactions');
const { DB_NAME } = require('dotenv').config().parsed;

jest.mock('../../../src/service/transactions', () => ({
    beginTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
}));

describe('returnBookWithIdQuery function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return book with ID successfully', async () => {
        const mockConnection = { query: jest.fn() };
        const userId = 1;
        const bookId = 1;

        const mockQueryResult = { affectedRows: 1 };

        mockConnection.query.mockImplementationOnce((query, callback) => {
            const expectedQuery = `DELETE FROM ${DB_NAME}.issued_books WHERE user_id = ${userId} AND book_id = ${bookId}`;
            expect(query).toEqual(expectedQuery);
            callback(null, mockQueryResult);
        });

        transactions.beginTransaction.mockResolvedValueOnce();
        transactions.commitTransaction.mockResolvedValueOnce();

        const result = await returnBookWithIdQuery(mockConnection, userId, bookId);

        expect(mockConnection.query).toHaveBeenCalledTimes(1);
        expect(transactions.beginTransaction).toHaveBeenCalledTimes(1);
        expect(transactions.commitTransaction).toHaveBeenCalledTimes(1);
        expect(transactions.rollbackTransaction).not.toHaveBeenCalled();
        expect(result).toBe(true);
    });

    it('should handle database query failure', async () => {
        const mockConnection = { query: jest.fn() };
        const userId = 1;
        const bookId = 1;

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(new Error('Database error'));
        });

        transactions.beginTransaction.mockResolvedValueOnce();
        transactions.rollbackTransaction.mockResolvedValueOnce();

        const result = await returnBookWithIdQuery(mockConnection, userId, bookId);

        expect(mockConnection.query).toHaveBeenCalledTimes(1);
        expect(transactions.beginTransaction).toHaveBeenCalledTimes(1);
        expect(transactions.rollbackTransaction).toHaveBeenCalledTimes(1);
        expect(transactions.commitTransaction).not.toHaveBeenCalled();
        expect(result).toBeNull();
    });
});
