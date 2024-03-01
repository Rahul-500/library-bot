const { start } = require('../../src/controllers/commandsController')
const { getAvailableBooks } = require('../../src/controllers/commandsController')
const constants = require('../../src/constants/constant')
describe('/start command', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('handleStart should reply with welcome message and menu', () => {
        const mockMessage = {
            reply: jest.fn(),
            author: { username: 'TestUser' },
        };

        start(mockMessage);

        expect(mockMessage.reply).toHaveBeenCalledWith(`${constants.WELCOME_MESSAGE}, TestUser!`);
        expect(mockMessage.reply).toHaveBeenCalledWith(constants.MENU_OPTIONS);
    });
});

describe('getAvailableBooks', () => {
    let mockMessage;
    let mockConnection;

    beforeEach(() => {
        mockMessage = {
            reply: jest.fn(),
        };

        mockConnection = {
            query: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should reply with available books when there are books', () => {
        const mockResults = [
            { id: 1, title: 'Book 1', quantity_available: 3 },
            { id: 2, title: 'Book 2', quantity_available: 5 },
        ];

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, mockResults);
        });

        getAvailableBooks(mockMessage, mockConnection);

        expect(mockMessage.reply).toHaveBeenCalledWith(
            expect.stringContaining("Available Books:\n- Book 1\n- Book 2")
        );
    });

    test('should reply with "No available books found" when there are no books', () => {
        const mockResults = [];

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, mockResults);
        });

        getAvailableBooks(mockMessage, mockConnection);

        expect(mockMessage.reply).toHaveBeenCalledWith(
            'No available books found.'
        );
    });

    test('should reply with "Error fetching available books" when there is an error', () => {
        const mockError = new Error('Test error');

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(mockError, null);
        });

        getAvailableBooks(mockMessage, mockConnection);

        expect(mockMessage.reply).toHaveBeenCalledWith(
            'Error fetching available books. Please try again later.'
        );
    });
});
