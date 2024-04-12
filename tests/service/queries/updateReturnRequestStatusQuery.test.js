const { updateReturnRequestStatusQuery } = require("../../../src/service/queries/updateReturnRequestStatusQuery");
const transactions = require("../../../src/service/transactions");

jest.mock("../../../src/service/transactions", () => ({
    beginTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
}));

describe('updateReturnRequestStatusQuery function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should update return request status in database successfully', async () => {
        const mockConnection = { query: jest.fn() };
        const mockReturnRequest = { id: 1, user_id: 1, book_id: 2 };
        const mockReturnRequestStatus = "approved";

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, { affectedRows: 1 });
        });

        const result = await updateReturnRequestStatusQuery(mockConnection, mockReturnRequest, mockReturnRequestStatus);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(transactions.beginTransaction).toHaveBeenCalled();
    });

    it('should handle database query failure', async () => {
        const mockConnection = { query: jest.fn() };
        const mockReturnRequest = { id: 1, user_id: 1, book_id: 2 };
        const mockReturnRequestStatus = "approved";

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(new Error('Database error'));
        });

        const result = await updateReturnRequestStatusQuery(mockConnection, mockReturnRequest, mockReturnRequestStatus);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(transactions.beginTransaction).toHaveBeenCalled();
        expect(transactions.rollbackTransaction).toHaveBeenCalled();
        expect(transactions.commitTransaction).not.toHaveBeenCalled();
        expect(result).toBeNull();
    });
});
