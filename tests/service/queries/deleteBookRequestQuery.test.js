const { deleteBookRequestQuery } = require('../../../src/service/queries/deleteBookRequestQuery');
const { DB_NAME } = require('dotenv').config().parsed;
const transactions = require('../../../src/service/transactions');

jest.mock('../../../src/service/transactions', () => ({
    beginTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
}));

describe('deleteBookRequestQuery function', () => {
    let mockConnection;

    beforeEach(() => {
        mockConnection = { query: jest.fn() };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should delete a book request from the database successfully', async () => {
        const mockBookRequestId = 1;
        const mockResults = { affectedRows: 1 };

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, mockResults);
        });

        await deleteBookRequestQuery(mockConnection, mockBookRequestId);

        expect(transactions.beginTransaction).toHaveBeenCalledWith(mockConnection);
        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(transactions.commitTransaction).toHaveBeenCalledWith(mockConnection);
    });

    it('should handle database query failure and rollback transaction', async () => {
        const mockBookRequestId = 1;

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(new Error('Database error'));
        });

        try {
            await deleteBookRequestQuery(mockConnection, mockBookRequestId);
        } catch (error) {
            expect(transactions.beginTransaction).toHaveBeenCalledWith(mockConnection);
            expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
            expect(transactions.rollbackTransaction).toHaveBeenCalledWith(mockConnection);
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe('Database error');
        }
    });
});
