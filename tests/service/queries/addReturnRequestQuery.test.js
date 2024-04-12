const { addReturnRequestQuery } = require("../../../src/service/queries/addReturnRequestQuery");
const transactions = require("../../../src/service/transactions");

jest.mock("../../../src/service/transactions", () => ({
    beginTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
}));

describe('addReturnRequestQuery function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should add return request to database successfully', async () => {
        const mockConnection = { query: jest.fn() };
        const mockUserId = 1;
        const mockBookId = 2;

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, { insertId: 1 });
        });

        const result = await addReturnRequestQuery(mockConnection, mockUserId, mockBookId);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(transactions.beginTransaction).toHaveBeenCalled();
        expect(transactions.commitTransaction).toHaveBeenCalled();
        expect(transactions.rollbackTransaction).not.toHaveBeenCalled();
        expect(result).toEqual({ insertId: 1 });
    });

    it('should return null on database query failure', async () => {
        const mockConnection = { query: jest.fn() };
        const mockUserId = 1;
        const mockBookId = 2;

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(new Error('Database error'));
        });

        const result = await addReturnRequestQuery(mockConnection, mockUserId, mockBookId);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(transactions.beginTransaction).toHaveBeenCalled();
        expect(transactions.commitTransaction).not.toHaveBeenCalled();
        expect(transactions.rollbackTransaction).toHaveBeenCalled();
        expect(result).toBeNull();
    });
});
