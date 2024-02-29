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
});
