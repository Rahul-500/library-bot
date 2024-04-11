const { addBookRequestQuery } = require('../../../src/service/queries/addBookRequestQuery');
const { DB_NAME } = require('dotenv').config().parsed;
const transactions = require('../../../src/service/transactions');

jest.mock('../../../src/service/transactions', () => ({
    beginTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
}));

describe('addBookRequestQuery function', () => {
    let mockConnection;
    let mockMessage;

    beforeEach(() => {
        mockConnection = { query: jest.fn() };
        mockMessage = { author: { id: 'mockUserID' } };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should add a book request to the database successfully', async () => {
        const mockBookRequest = 'Mock Book Request';
        const mockResults = { insertId: 1 };

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, mockResults);
        });

        await addBookRequestQuery(mockConnection, mockBookRequest, mockMessage);

        expect(transactions.beginTransaction).toHaveBeenCalledWith(mockConnection);
        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(transactions.commitTransaction).toHaveBeenCalledWith(mockConnection);
    });

    it('should handle database query failure and rollback transaction', async () => {
        const mockBookRequest = 'Mock Book Request';

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(new Error('Database error'));
        });

        try {
            await addBookRequestQuery(mockConnection, mockBookRequest, mockMessage);
        } catch (error) {
            expect(transactions.beginTransaction).toHaveBeenCalledWith(mockConnection);
            expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
            expect(transactions.rollbackTransaction).toHaveBeenCalledWith(mockConnection);
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe('Database error');
        }
    });
});
