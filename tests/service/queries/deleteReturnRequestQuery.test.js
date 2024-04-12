const { deleteReturnRequestQuery } = require("../../../src/service/queries/deleteReturnRequestQuery");
const transactions = require("../../../src/service/transactions");

jest.mock("../../../src/service/transactions", () => ({
    beginTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
}));

describe('deleteReturnRequestQuery function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should delete return request from database successfully', async () => {
        const mockConnection = { query: jest.fn() };
        const mockReturnRequestId = 1;

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, { affectedRows: 1 });
        });

        const result = await deleteReturnRequestQuery(mockConnection, mockReturnRequestId);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(transactions.beginTransaction).toHaveBeenCalled();
        expect(transactions.commitTransaction).toHaveBeenCalled();
        expect(transactions.rollbackTransaction).not.toHaveBeenCalled();
        expect(result).toEqual({ affectedRows: 1 });
    });

    it('should return null on database query failure', async () => {
        const mockConnection = { query: jest.fn() };
        const mockReturnRequestId = 1;

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(new Error('Database error'));
        });

        const result = await deleteReturnRequestQuery(mockConnection, mockReturnRequestId);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(transactions.beginTransaction).toHaveBeenCalled();
        expect(transactions.commitTransaction).not.toHaveBeenCalled();
        expect(transactions.rollbackTransaction).toHaveBeenCalled();
        expect(result).toBeNull();
    });
});
