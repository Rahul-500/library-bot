const { getReturnRequestsForBookQuery } = require("../../../src/service/queries/getReturnRequestsForBookQuery");

describe('getReturnRequestsForBookQuery function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return user ids for pending return requests for a book', async () => {
        const mockConnection = { query: jest.fn() };
        const mockBookId = 1;
        const mockUserIds = [{ user_id: 1 }, { user_id: 2 }];

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, mockUserIds);
        });

        const result = await getReturnRequestsForBookQuery(mockConnection, mockBookId);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(result).toEqual(mockUserIds);
    });

    it('should return null on database query failure', async () => {
        const mockConnection = { query: jest.fn() };
        const mockBookId = 1;

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(new Error('Database error'));
        });

        const result = await getReturnRequestsForBookQuery(mockConnection, mockBookId);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(result).toBeNull();
    });
});
