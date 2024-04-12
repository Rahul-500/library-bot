const { getLibraryHistoryQuery } = require('../../../src/service/queries/getLibraryHistoryQuery');
const { DB_NAME } = require('dotenv').config().parsed;

describe('getLibraryHistoryQuery function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch library history successfully', async () => {
        const mockConnection = { query: jest.fn() };

        const mockLibraryHistory = [
            { name: 'User 1', title: 'Book 1', checked_out: '2022-01-01', returned: '2022-01-15' },
            { name: 'User 2', title: 'Book 2', checked_out: '2022-02-01', returned: '2022-02-15' },
        ];

        mockConnection.query.mockImplementationOnce((query, callback) => {
            const expectedQuery = `
                SELECT
                    users.name,
                    books.title,
                    library_history.checked_out,
                    library_history.returned
                FROM
                    ${DB_NAME}.library_history
                JOIN
                    books ON library_history.book_id = books.id
                JOIN
                    users ON library_history.user_id = users.id
            `;
            expect(query).toEqual(expectedQuery);
            callback(null, mockLibraryHistory);
        });

        const result = await getLibraryHistoryQuery(mockConnection);

        expect(mockConnection.query).toHaveBeenCalledTimes(1);
    });

    it('should handle database query failure', async () => {
        const mockConnection = { query: jest.fn() };

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(new Error('Database error'));
        });

        const result = await getLibraryHistoryQuery(mockConnection);

        expect(mockConnection.query).toHaveBeenCalledTimes(1);
        expect(result).toBeNull();
    });
});
