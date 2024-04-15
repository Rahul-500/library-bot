const { getCheckedOutUsersQuery } = require("../../../src/service/queries/getCheckedOutUsersQuery");

describe('getCheckedOutUsers function', () => {
    it('should return list of checked out users', async () => {
        const mockConnection = { query: jest.fn() };
        const mockBook = { id: 1 };
        const mockResult = [{ name: 'User1' }, { name: 'User2' }];

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, mockResult);
        });

        const users = await getCheckedOutUsersQuery(mockConnection, mockBook);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(users).toEqual(mockResult);
    });

    it('should return null on database query failure', async () => {
        const mockConnection = { query: jest.fn() };
        const mockBook = { id: 1 };

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(new Error('Database error'));
        });

        const users = await getCheckedOutUsersQuery(mockConnection, mockBook);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(users).toBeNull();
    });
});
