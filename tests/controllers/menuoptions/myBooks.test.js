const { getUserBooks } = require('../../../src/controllers/commands/getUserBooks');
const { myBooks } = require('../../../src/controllers/menuoptions/myBooks');
const { displayUserBooks } = require('../../../src/utils/display/displayUserBooks');

jest.mock('../../../src/utils/display/displayUserBooks')
jest.mock('../../../src/controllers/commands/getUserBooks', () => ({
    getUserBooks: jest.fn(),
}));

describe('myBooks function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should call getUserBooks and display user books', async () => {
        const mockMessage = {};
        const mockConnection = {};
        const mockCheckedOutBooks = [];
        const mockUserBooks = ['book1', 'book2'];
        getUserBooks.mockResolvedValue(mockUserBooks);

        await myBooks(mockMessage, mockConnection, mockCheckedOutBooks);

        expect(getUserBooks).toHaveBeenCalledWith(mockMessage, mockConnection, mockCheckedOutBooks);
        expect(displayUserBooks).toHaveBeenCalledWith(mockMessage, mockUserBooks);
    });

    test('should not display user books if getUserBooks returns null', async () => {
        const mockMessage = {};
        const mockConnection = {};
        const mockCheckedOutBooks = [];
        getUserBooks.mockResolvedValue(null);

        await myBooks(mockMessage, mockConnection, mockCheckedOutBooks);

        expect(getUserBooks).toHaveBeenCalledWith(mockMessage, mockConnection, mockCheckedOutBooks);
        expect(displayUserBooks).not.toHaveBeenCalled();
    });

    test('should handle error if getUserBooks throws an error', async () => {
        const mockMessage = {};
        const mockConnection = {};
        const mockCheckedOutBooks = [];
        const mockError = new Error('Database error');
        getUserBooks.mockRejectedValue(mockError);

        await expect(myBooks(mockMessage, mockConnection, mockCheckedOutBooks)).rejects.toThrow(mockError);

        expect(getUserBooks).toHaveBeenCalledWith(mockMessage, mockConnection, mockCheckedOutBooks);
        expect(displayUserBooks).not.toHaveBeenCalled();
    });
});
