const { start } = require('../../src/controllers/commandsController')
const { getAvailableBooks } = require('../../src/controllers/commandsController')
const constants = require('../../src/constants/constant')
describe('/start command', () => {
    let mockMessage;
    let mockConnection;

    beforeEach(() => {
        mockMessage = {
            reply: jest.fn(),
            author: { id: '123', username: 'TestUser' },
        };

        mockConnection = {
            query: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('start should reply with welcome message and menu', () => {
        start(mockMessage, mockConnection);
        expect(mockMessage.reply).toHaveBeenCalledWith(`${constants.WELCOME_MESSAGE}, TestUser!`);
        expect(mockMessage.reply).toHaveBeenCalledWith(constants.MENU_OPTIONS);
    });

    test('start should call addUserInfo method for new user', ()=>{
        const mockResults = [];

        mockConnection.query.mockImplementation((query, callback) => {
            if (query.includes('SELECT * FROM library.users')) {
                callback(null, mockResults);
            }
        });
        start(mockMessage, mockConnection);
        expect(mockConnection.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO library.users'));
    })

    test('start should not call addUserInfo method for existing user', ()=>{
        const mockResults = [{id : '123', name : 'TestUser'}];

        mockConnection.query.mockImplementation((query, callback) => {
            if (query.includes('SELECT * FROM library.users')) {
                callback(null, mockResults);
            }
        });
        start(mockMessage, mockConnection);
        expect(mockConnection.query).not.toHaveBeenCalledWith(expect.stringContaining('INSERT INTO library.users'));
    })

    test('should reply with "Error fetching available books" when there is an error', () => {
        const mockError = new Error('Test error');

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(mockError, null);
        });

        start(mockMessage, mockConnection);

        expect(mockMessage.reply).toHaveBeenCalledWith(
            'Error fetching user. Please try again later.'
        );
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
