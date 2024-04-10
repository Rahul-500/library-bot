const { updateBookDetailsQuery } = require('../../../src/service/queries/updateBookDetailsQuery');
const { DB_NAME } = require('dotenv').config().parsed;
const constants = require('../../../src/constants/constant');
const transactions = require('../../../src/service/transactions');

jest.mock('../../../src/service/transactions', () => ({
    beginTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
}));

describe('updateBookDetailsQuery function', () => {
    let mockMessage;
    let mockConnection;

    beforeEach(() => {
        mockMessage = { reply: jest.fn() };
        mockConnection = { query: jest.fn() };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should update book details successfully', async () => {
        const mockBook = { id: 1 };
        const mockTitle = 'Updated Title';
        const mockAuthor = 'Updated Author';
        const mockPublishedYear = 2022;
        const mockQuantity = 10;

        const mockResults = { affectedRows: 1 };

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, mockResults);
        });

        await updateBookDetailsQuery(
            mockMessage,
            mockConnection,
            mockBook,
            mockTitle,
            mockAuthor,
            mockPublishedYear,
            mockQuantity
        );

        expect(transactions.beginTransaction).toHaveBeenCalled();
        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(transactions.commitTransaction).toHaveBeenCalled();
        expect(mockMessage.reply).toHaveBeenCalledWith(constants.BOOK_UPDATED_MESSAGE);
    });

    it('should handle database query failure', async () => {
        const mockBook = { id: 1 };
        const mockTitle = 'Updated Title';
        const mockAuthor = 'Updated Author';
        const mockPublishedYear = 2022;
        const mockQuantity = 10;

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(new Error('Database error'));
        });

        await updateBookDetailsQuery(
            mockMessage,
            mockConnection,
            mockBook,
            mockTitle,
            mockAuthor,
            mockPublishedYear,
            mockQuantity
        );

        expect(transactions.beginTransaction).toHaveBeenCalled();
        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(transactions.rollbackTransaction).toHaveBeenCalled();
        expect(mockMessage.reply).toHaveBeenCalledWith(constants.ERROR_UPDATE_BOOK_MESSAGE);
    });
});
