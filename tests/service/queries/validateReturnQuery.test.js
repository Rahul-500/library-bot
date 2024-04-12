const { validateReturnQuery } = require("../../../src/service/queries/validateReturnQuery");

describe('validateReturnQuery function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return true if the user has issued the specified book', async () => {
        const mockConnection = { query: jest.fn() };
        const mockUserId = 1;
        const mockBookId = 1;
        const mockResult = [{ bookCount: 1 }];

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, mockResult);
        });

        const result = await validateReturnQuery(mockConnection, mockUserId, mockBookId);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(result).toBe(true);
    });

    it('should return false if the user has not issued the specified book', async () => {
        const mockConnection = { query: jest.fn() };
        const mockUserId = 1;
        const mockBookId = 1;
        const mockResult = [{ bookCount: 0 }];

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, mockResult);
        });

        const result = await validateReturnQuery(mockConnection, mockUserId, mockBookId);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(result).toBe(false);
    });  
});
