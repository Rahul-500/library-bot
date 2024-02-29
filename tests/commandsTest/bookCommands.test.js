const { default: axios } = require('axios');
const bookCommands = require('../../src/commands/bookCommands');

jest.mock('axios');

describe('Book Commands', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('handleStart should reply with welcome message and menu', () => {
        const mockMessage = {
            reply: jest.fn(),
            author: { username: 'TestUser' },
        };

        bookCommands.handleStart(mockMessage);

        expect(mockMessage.reply).toHaveBeenCalledWith('Welcome to the Book Library, TestUser!');
        expect(mockMessage.reply).toHaveBeenCalledWith('Menu:\n1. Display all available books');
    });

    test('should reply with all available books', async ()=> {
        const mockMessage = {
            reply: jest.fn(),
        };
        const mockBook = [{ title: 'Book 1' }];
        axios.get.mockResolvedValueOnce({ data: { data: mockBook } });
        await bookCommands.handleDisplayAllAvailableBooks(mockMessage);
        expect(mockMessage.reply).toHaveBeenCalledWith('Available Books:\n- Book 1');
    });

    test('should reply with an error message on fetch failure', async ()=> {
        const mockMessage = {
            reply: jest.fn(),
        };
        axios.get.mockRejectedValueOnce(new Error('Network error'));
        await bookCommands.handleDisplayAllAvailableBooks(mockMessage);
        expect(mockMessage.reply).toHaveBeenCalledWith('Error fetching available books. Please try again later.');
    });
});
