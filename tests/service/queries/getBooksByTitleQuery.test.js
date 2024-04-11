const { getBooksByTitleQuery } = require("../../../src/service/queries/getBooksByTitleQuery");

describe('getBooksByTitleQuery function', () => {
    it('should return books matching the title', async () => {
        const mockConnection = { query: jest.fn() };
        const mockTitle = 'Harry Potter';
        const mockResult = [
            { id: 1, title: 'Harry Potter and the Philosopher\'s Stone', author: 'J.K. Rowling' },
            { id: 2, title: 'Harry Potter and the Chamber of Secrets', author: 'J.K. Rowling' }
        ];

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, mockResult);
        });

        const books = await getBooksByTitleQuery(mockConnection, mockTitle);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(books).toEqual(mockResult);
    });

    it('should return null on database query failure', async () => {
        const mockConnection = { query: jest.fn() };
        const mockTitle = 'Harry Potter';

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(new Error('Database error'));
        });

        const books = await getBooksByTitleQuery(mockConnection, mockTitle);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(books).toBeNull();
    });
});
