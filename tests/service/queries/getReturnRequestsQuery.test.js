const { getReturnRequestsQuery } = require("../../../src/service/queries/getReturnRequestsQuery");

describe('getReturnRequestsQuery function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should retrieve return requests from database successfully', async () => {
        const mockConnection = { query: jest.fn() };
        const mockResult = [{ id: 1, user_id: 1, name: 'User', book_id: 2, title: 'Book', status: 'Pending' }];

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, mockResult);
        });

        const result = await getReturnRequestsQuery(mockConnection);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(result).toEqual(mockResult);
    });

    it('should return null on database query failure', async () => {
        const mockConnection = { query: jest.fn() };

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(new Error('Database error'));
        });

        const result = await getReturnRequestsQuery(mockConnection);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(result).toBeNull();
    });
});
