const { getOverdueBooksQuery } = require('../../../src/service/queries/getOverdueBooksQuery');
const { DB_NAME } = require('dotenv').config().parsed;
const constants = require('../../../src/constants/constant');

jest.mock('../../../src/service/transactions', () => ({
    beginTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
}));

describe('getOverdueBooksQuery function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch overdue books successfully', async () => {
        const mockConnection = { query: jest.fn() };
        const timeInterval = 30; // Example time interval in days

        const mockResults = [
            { id: 1, book_id: 1, checked_out: '2024-03-01', title: 'Book 1' },
            { id: 2, book_id: 2, checked_out: '2024-02-15', title: 'Book 2' },
        ];

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, mockResults);
        });

        const result = await getOverdueBooksQuery(mockConnection, timeInterval);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(result).toEqual(mockResults);
    });

    it('should handle database query failure', async () => {
        const mockConnection = { query: jest.fn() };
        const timeInterval = 30; // Example time interval in days

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(new Error('Database error'));
        });

        try {
            await getOverdueBooksQuery(mockConnection, timeInterval);
        } catch (error) {
            expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe('Database error');
        }
    });
});
