const { addBookToDatabaseQuery } = require("../../../src/service/queries/addBookToDatabaseQuery");
const constants = require("../../../src/constants/constant");

jest.mock("../../../src/service/transactions", () => ({
    beginTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
}));

describe('addBookToDatabaseQuery function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should add book to database and reply with success message', async () => {
        const mockMessage = { reply: jest.fn() };
        const mockConnection = { query: jest.fn() };
        const mockBookDetails = {
            title: 'Test Book',
            author: 'Test Author',
            published_year: 2024,
            quantity_available: 5
        };

        mockConnection.query.mockImplementationOnce((query, values, callback) => {
            callback(null, { insertId: 1 });
        });

        await addBookToDatabaseQuery(mockMessage, mockConnection, mockBookDetails);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
        expect(mockMessage.reply).toHaveBeenCalledWith(`Book added successfully! Title: ${mockBookDetails.title}`);
        expect(mockMessage.reply).toHaveBeenCalledTimes(1);
    });

    it('should reply with error message on database query failure', async () => {
        const mockMessage = { reply: jest.fn() };
        const mockConnection = { query: jest.fn() };
        const mockBookDetails = {
            title: 'Test Book',
            author: 'Test Author',
            published_year: 2024,
            quantity_available: 5
        };

        mockConnection.query.mockImplementationOnce((query, values, callback) => {
            callback(new Error('Database error'));
        });

        await addBookToDatabaseQuery(mockMessage, mockConnection, mockBookDetails);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
        expect(mockMessage.reply).toHaveBeenCalledWith(constants.UNEXPECTED_ERROR_PROCESSING_COMMAND_MESSAGE);
        expect(mockMessage.reply).toHaveBeenCalledTimes(1);
    });
});