const { checkForExistingUserQuery } = require("../../../src/service/queries/checkForExistingUserQuery");
const constants = require("../../../src/constants/constant");

describe('checkForExistingUserQuery function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should resolve with false if user does not exist', async () => {
        const mockMessage = { author: { id: 123 } };
        const mockConnection = { query: jest.fn() };

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, []);
        });

        const result = await checkForExistingUserQuery(mockMessage, mockConnection);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(result).toBe(false);
    });

    it('should resolve with true if user exists', async () => {
        const mockMessage = { author: { id: 123 } };
        const mockConnection = { query: jest.fn() };

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, [{ id: 123 }]);
        });

        const result = await checkForExistingUserQuery(mockMessage, mockConnection);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(result).toBe(true);
    });

    it('should reject with error if database query fails', async () => {
        const mockMessage = { author: { id: 123 } };
        const mockConnection = { query: jest.fn() };

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(new Error('Database error'));
        });

        await expect(checkForExistingUserQuery(mockMessage, mockConnection)).rejects.toThrow();
        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
    });
});
