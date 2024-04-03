const { getAvailableBooks } = require('../../../src/controllers/commands/getAvailableBooks');
const { getAvailableBooks: getAvailableBooksService } = require('../../../src/service/databaseService');
const constants = require('../../../src/constants/constant');

jest.mock('../../../src/service/databaseService', () => ({
    getAvailableBooks: jest.fn(),
}));

describe('getAvailableBooks function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return available books and update bookMap when books are retrieved successfully', async () => {
        const mockMessage = {};
        const mockConnection = {};
        const mockBooks = [{ id: 1, title: 'Book 1', quantity_available: 3 }, { id: 2, title: 'Book 2', quantity_available: 2 }];

        getAvailableBooksService.mockResolvedValue(mockBooks);

        const mockBookMap = new Map();

        const result = await getAvailableBooks(mockMessage, mockConnection, mockBookMap);

        expect(result).toEqual(mockBooks);
        expect(mockBookMap.size).toBe(mockBooks.length);
        expect(mockBookMap.get(1)).toBe(mockBooks[0]);
        expect(mockBookMap.get(2)).toBe(mockBooks[1]);
        expect(getAvailableBooksService).toHaveBeenCalledWith(mockConnection);
    });

    test('should reply with error message and return null when retrieving books fails', async () => {
        const mockMessage = {
            reply: jest.fn(),
        };
        const mockConnection = {};

        getAvailableBooksService.mockRejectedValue(new Error('Error executing book query'));

        const mockBookMap = new Map();

        const result = await getAvailableBooks(mockMessage, mockConnection, mockBookMap);

        expect(result).toBeNull();
        expect(mockMessage.reply).toHaveBeenCalledWith(constants.ERROR_FETCHING_BOOKS);
        expect(mockBookMap.size).toBe(0);
        expect(getAvailableBooksService).toHaveBeenCalledWith(mockConnection);
    });

    test('should clear bookMap and return empty array when no books are available', async () => {
        const mockMessage = {};
        const mockConnection = {};

        getAvailableBooksService.mockResolvedValue([]);

        const mockBookMap = new Map();

        const result = await getAvailableBooks(mockMessage, mockConnection, mockBookMap);

        expect(result).toEqual([]);
        expect(mockBookMap.size).toBe(0);
        expect(getAvailableBooksService).toHaveBeenCalledWith(mockConnection);
    });

    test('should handle empty bookMap and return null if books retrieval fails', async () => {
        const mockMessage = {
            reply: jest.fn(),
        };
        const mockConnection = {};

        getAvailableBooksService.mockRejectedValue(new Error('Error executing book query'));

        const mockBookMap = new Map([[1, { id: 1, title: 'Book 1', quantity_available: 3 }]]);

        const result = await getAvailableBooks(mockMessage, mockConnection, mockBookMap);

        expect(result).toBeNull();
        expect(mockMessage.reply).toHaveBeenCalledWith(constants.ERROR_FETCHING_BOOKS);
        expect(getAvailableBooksService).toHaveBeenCalledWith(mockConnection);
    });

    test('should handle null books response and return null', async () => {
        const mockMessage = {
            reply: jest.fn(),
        };
        const mockConnection = {};

        getAvailableBooksService.mockResolvedValue(null);

        const mockBookMap = new Map();

        const result = await getAvailableBooks(mockMessage, mockConnection, mockBookMap);

        expect(result).toBeNull();
        expect(mockMessage.reply).toHaveBeenCalledWith(constants.ERROR_FETCHING_BOOKS);
        expect(mockBookMap.size).toBe(0);
        expect(getAvailableBooksService).toHaveBeenCalledWith(mockConnection);
    });
});
