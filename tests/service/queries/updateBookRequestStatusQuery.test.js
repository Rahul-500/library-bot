const { updateBookRequestStatusQuery } = require('../../../src/service/queries/updateBookRequestStatusQuery');
const { DB_NAME } = require('dotenv').config().parsed;
const transactions = require('../../../src/service/transactions');

jest.mock('../../../src/service/transactions', () => ({
    beginTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
}));

describe('updateBookRequestStatusQuery function', () => {
    let mockConnection;

    beforeEach(() => {
        mockConnection = { query: jest.fn() };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should update a book request status and delete the request if status is "approved"', async () => {
        const mockBookRequestId = 1;
        const mockBookRequestStatus = 'approved';
        const mockResults = { affectedRows: 1 };

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, mockResults);
        });

        await updateBookRequestStatusQuery(mockConnection, mockBookRequestId, mockBookRequestStatus);

        expect(transactions.beginTransaction).toHaveBeenCalledWith(mockConnection);
        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(transactions.commitTransaction).toHaveBeenCalledWith(mockConnection);
    });

    it('should update a book request status without deleting the request if status is not "approved"', async () => {
        const mockBookRequestId = 1;
        const mockBookRequestStatus = 'rejected';
        const mockResults = { affectedRows: 1 };

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, mockResults);
        });

        await updateBookRequestStatusQuery(mockConnection, mockBookRequestId, mockBookRequestStatus);

        expect(transactions.beginTransaction).toHaveBeenCalledWith(mockConnection);
        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(transactions.commitTransaction).toHaveBeenCalledWith(mockConnection);
    });

    it('should handle database query failure and rollback transaction', async () => {
        const mockBookRequestId = 1;
        const mockBookRequestStatus = 'approved';

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(new Error('Database error'));
        });

        try {
            await updateBookRequestStatusQuery(mockConnection, mockBookRequestId, mockBookRequestStatus);
        } catch (error) {
            expect(transactions.beginTransaction).toHaveBeenCalledWith(mockConnection);
            expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
            expect(transactions.rollbackTransaction).toHaveBeenCalledWith(mockConnection);
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe('Database error');
        }
    });
});
