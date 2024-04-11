const { addCheckoutRequestQuery } = require('../../../src/service/queries/addCheckoutRequestQuery');
const { DB_NAME } = require('dotenv').config().parsed;
const transactions = require('../../../src/service/transactions');

jest.mock('../../../src/service/transactions', () => ({
    beginTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
}));

describe('addCheckoutRequestQuery function', () => {
    let mockConnection;

    beforeEach(() => {
        mockConnection = { query: jest.fn() };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should add a checkout request to the database successfully', async () => {
        const mockUserId = 1;
        const mockBookId = 1;
        const mockResults = { affectedRows: 1 };

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, mockResults);
        });

        await addCheckoutRequestQuery(mockConnection, mockUserId, mockBookId);

        expect(transactions.beginTransaction).toHaveBeenCalledWith(mockConnection);
        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(transactions.commitTransaction).toHaveBeenCalledWith(mockConnection);
    });

    it('should handle database query failure and rollback transaction', async () => {
        const mockUserId = 1;
        const mockBookId = 1;

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(new Error('Database error'));
        });

        try {
            await addCheckoutRequestQuery(mockConnection, mockUserId, mockBookId);
        } catch (error) {
            expect(transactions.beginTransaction).toHaveBeenCalledWith(mockConnection);
            expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
            expect(transactions.rollbackTransaction).toHaveBeenCalledWith(mockConnection);
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe('Database error');
        }
    });
});
