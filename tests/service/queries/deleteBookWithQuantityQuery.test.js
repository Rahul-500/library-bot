const { deleteBookWithQuantityQuery } = require("../../../src/service/queries/deleteBookWithQuantityQuery");
const constants = require("../../../src/constants/constant");

jest.mock("../../../src/service/transactions", () => ({
    beginTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
}));

describe('deleteBookWithQuantityQuery function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should delete book quantity from database and reply with success message', async () => {
        const mockMessage = { reply: jest.fn() };
        const mockConnection = { query: jest.fn() };
        const mockBook = { id: 1 };
        const mockQuantity = 1;

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, { affectedRows: 1 });
        });

        await deleteBookWithQuantityQuery(mockMessage, mockConnection, mockBook, mockQuantity);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(mockMessage.reply).toHaveBeenCalledWith(`Book quantity deleted successfully!`);
    });

    it('should reply with error message on database query failure', async () => {
        const mockMessage = { reply: jest.fn() };
        const mockConnection = { query: jest.fn() };
        const mockBook = { id: 1 };
        const mockQuantity = 1;

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(new Error('Database error'));
        });

        await deleteBookWithQuantityQuery(mockMessage, mockConnection, mockBook, mockQuantity);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(mockMessage.reply).toHaveBeenCalledWith(constants.UNEXPECTED_ERROR_PROCESSING_COMMAND_MESSAGE);
    });
});
