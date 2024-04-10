const { setOverdueBookIntervalQuery } = require('../../../src/service/queries/setOverdueBookIntervalQuery');
const { DB_NAME } = require('dotenv').config().parsed;
const constants = require('../../../src/constants/constant');
const transactions = require('../../../src/service/transactions');

jest.mock('../../../src/service/transactions', () => ({
    beginTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
}));

describe('setOverdueBookIntervalQuery function', () => {
    let mockConnection;

    beforeEach(() => {
        mockConnection = { query: jest.fn() };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should update the overdue books interval successfully', async () => {
        const timeInterval = 30;
        const mockResults = { affectedRows: 1 };

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, mockResults);
        });

        await setOverdueBookIntervalQuery(mockConnection, timeInterval);

        expect(transactions.beginTransaction).toHaveBeenCalledWith(mockConnection);
        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(transactions.commitTransaction).toHaveBeenCalledWith(mockConnection);
    });

    it('should handle database query failure and rollback transaction', async () => {
        const timeInterval = 30;

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(new Error('Database error'));
        });

        try {
            await setOverdueBookIntervalQuery(mockConnection, timeInterval);
        } catch (error) {
            expect(transactions.beginTransaction).toHaveBeenCalledWith(mockConnection);
            expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
            expect(transactions.rollbackTransaction).toHaveBeenCalledWith(mockConnection);
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe('Database error');
        }
    });
});
