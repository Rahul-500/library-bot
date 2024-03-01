const { start } = require('../../src/controllers/commandsController')
const { getAvailableBooks, checkoutBook } = require('../../src/controllers/commandsController')
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

    test('start should call addUserInfo method for new user', () => {
        const mockResults = [];

        mockConnection.query.mockImplementation((query, callback) => {
            if (query.includes('SELECT * FROM library.users')) {
                callback(null, mockResults);
            }
        });
        start(mockMessage, mockConnection);
        expect(mockConnection.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO library.users'));
    })

    test('start should not call addUserInfo method for existing user', () => {
        const mockResults = [{ id: '123', name: 'TestUser' }];

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
            constants.ERROR_FETCHING_USER
        );
    });
});

describe('getAvailableBooks', () => {
    let mockMessage;
    let mockConnection;
    let bookMap = new Map();
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

    test('should reply with available books when there are books', async () => {
        const mockResults = [
            { id: 1, title: 'Book 1', quantity_available: 3, },
            { id: 2, title: 'Book 2', quantity_available: 5, },
        ];

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, mockResults);
        });

        await getAvailableBooks(mockMessage, mockConnection, bookMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(
            expect.stringContaining("Available Books:\n1 - Book 1\n2 - Book 2")
        );
    });

    test('should reply with "No available books found" when there are no books', async () => {
        const mockResults = [];

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, mockResults);
        });

        await getAvailableBooks(mockMessage, mockConnection);

        expect(mockMessage.reply).toHaveBeenCalledWith(
            constants.NO_BOOKS_FOUND
        );
    });

    test('should reply with "Error fetching available books" when there is an error', async () => {
        const mockError = new Error('Test error');

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(mockError, null);
        });

        await getAvailableBooks(mockMessage, mockConnection);

        expect(mockMessage.reply).toHaveBeenCalledWith(
            constants.ERROR_FETCHING_BOOKS
        );
    });
});


describe('checkoutBook', () => {
    let mockMessage;
    let mockConnection;
    let mockBookMap;

    beforeEach(() => {
        mockMessage = {
            content: '/checkout 1',
            author: {
                id: 'user123',
            },
            reply: jest.fn(),
        };

        mockConnection = {
            query: jest.fn(),
            beginTransaction: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn(),
        };

        mockBookMap = new Map([
            [1, { id: 1, title: 'Book 1' }],
        ]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should reply with success message when book is successfully checked out', async () => {
        mockConnection.query.mockImplementationOnce((query, callback) => {

            callback(null, [{}]);
        });
        mockConnection.beginTransaction.mockImplementation((callback) => {
            callback(null);
        });
        mockConnection.commit.mockImplementation((callback) => {
            callback(null);
        });

        await checkoutBook(mockMessage, mockConnection, mockBookMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(
            expect.stringContaining(constants.CHECKED_BOOK_SUCCUESSFULLY_MESSAGE)
        );
    });

    test('should reply with error message when there is an error during checkout', async () => {
        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(new Error('Test error'), null);
        });
        mockConnection.beginTransaction.mockImplementationOnce((callback) => {
            callback(new Error('Failed to begin transaction'));
        });
        mockConnection.rollback.mockImplementationOnce((callback) => {
            callback(null);
        });

        await checkoutBook(mockMessage, mockConnection, mockBookMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(
            expect.stringContaining(constants.ERROR_CHECKED_OUT_MESSAGE)
        );
    });
});
