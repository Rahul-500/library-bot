const { addUserInfoQuery } = require("../../../src/service/queries/addUserInfoQuery");
const constants = require("../../../src/constants/constant");
const transactions = require("../../../src/service/transactions");

jest.mock("../../../src/service/transactions", () => ({
    beginTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
}));

describe('addUserInfoQuery function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should add user info to database successfully', async () => {
        const mockId = 1;
        const mockName = 'Test User';
        const mockConnection = { query: jest.fn() };

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, { insertId: 1 });
        });

        await addUserInfoQuery(mockId, mockName, mockConnection);

        expect(transactions.beginTransaction).toHaveBeenCalled();
        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(transactions.commitTransaction).toHaveBeenCalled();
        expect(transactions.rollbackTransaction).not.toHaveBeenCalled();
    });

    it('should handle database query failure', async () => {
        const mockId = 1;
        const mockName = 'Test User';
        const mockConnection = { query: jest.fn() };

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(new Error('Database error'));
        });

        await addUserInfoQuery(mockId, mockName, mockConnection);

        expect(transactions.beginTransaction).toHaveBeenCalled();
        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(transactions.rollbackTransaction).toHaveBeenCalled();
        expect(transactions.commitTransaction).not.toHaveBeenCalled();
    });
});
