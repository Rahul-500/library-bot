const { getOverdueBookIntervalQuery } = require('../../../src/service/queries/getOverdueBookIntervalQuery');
const { DB_NAME } = require('dotenv').config().parsed;

describe('getOverdueBookIntervalQuery function', () => {
    let mockConnection;

    beforeEach(() => {
        mockConnection = { query: jest.fn() };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch the overdue books interval successfully', async () => {
        const mockResults = [{ setting_value: 30 }];

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, mockResults);
        });

        const result = await getOverdueBookIntervalQuery(mockConnection);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
    });

    it('should handle database query failure', async () => {
        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(new Error('Database error'));
        });

        try {
            await getOverdueBookIntervalQuery(mockConnection);
        } catch (error) {
            expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe('Database error');
        }
    });
});
