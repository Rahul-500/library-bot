const { getCheckoutRequestsQuery } = require("../../../src/service/queries/getCheckoutRequestsQuery");

describe('getCheckoutRequestsQuery function', () => {
    it('should return checkout requests', async () => {
        const mockConnection = { query: jest.fn() };
        const mockResult = [
            { id: 1, user_id: 1, name: 'User1', book_id: 1, title: 'Book1', status: 'pending' },
            { id: 2, user_id: 2, name: 'User2', book_id: 2, title: 'Book2', status: 'approved' }
        ];

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, mockResult);
        });

        const checkoutRequests = await getCheckoutRequestsQuery(mockConnection);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(checkoutRequests).toEqual(mockResult);
    });

    it('should return null on database query failure', async () => {
        const mockConnection = { query: jest.fn() };

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(new Error('Database error'));
        });

        const checkoutRequests = await getCheckoutRequestsQuery(mockConnection);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(checkoutRequests).toBeNull();
    });
});
