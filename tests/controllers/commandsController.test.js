const { start } = require('../../src/controllers/commandsController')
const { getAvailableBooks, checkoutBook, getUserBooks, returnBook, addBook, help } = require('../../src/controllers/commandsController')
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
        bookMap.clear();
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

            callback(null, [{ bookCount: 0 }]);
        });
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

            callback(null, [{ bookCount: 0 }]);
        });

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

    test('should reply with message that book is already checked out', async () => {
        mockConnection.query.mockImplementationOnce((query, callback) => {

            callback(null, [{ bookCount: 1 }]);
        });

        await checkoutBook(mockMessage, mockConnection, mockBookMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(
            expect.stringContaining(constants.ALREADY_CHECKED_OUT_BOOK_MESSAGE)
        );
    });
});

describe('getUserBooks', () => {
    let mockMessage;
    let mockConnection;
    let checkedOutBooks = new Map();

    beforeEach(() => {
        mockMessage = {
            reply: jest.fn(),
            author: { id: '1' },
        };

        mockConnection = {
            query: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
        checkedOutBooks.clear();
    });

    test(`should reply with user's checked-out books when there are books`, async () => {
        const mockResults = [
            { id: 1, title: 'Book 1' },
            { id: 2, title: 'Book 2' },
        ];

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, mockResults);
        });

        await getUserBooks(mockMessage, mockConnection, checkedOutBooks);

        expect(mockMessage.reply).toHaveBeenCalledWith(
            expect.stringContaining("My books\n1 - Book 1\n2 - Book 2")
        );
    });

    test('should reply with "No checked-out books found" when there are no books', async () => {
        const mockResults = [];

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, mockResults);
        });

        await getUserBooks(mockMessage, mockConnection, checkedOutBooks);

        expect(mockMessage.reply).toHaveBeenCalledWith(
            constants.NO_CHECKED_OUT_BOOK_MESSAGE
        );
    });

    test('should reply with "Error fetching checked-out books" when there is an error', async () => {
        const mockError = new Error('Test error');

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(mockError, null);
        });

        await getUserBooks(mockMessage, mockConnection, checkedOutBooks);

        expect(mockMessage.reply).toHaveBeenCalledWith(
            constants.ERROR_FETCHING_BOOKS
        );
    });
});

describe('returnBook', () => {
    let mockMessage;
    let mockConnection;
    let mockCheckedOutBooks;

    beforeEach(() => {
        mockMessage = {
            content: '/return 1',
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

        mockCheckedOutBooks = new Map([
            [1, { id: 1, title: 'Book 1' }],
        ]);

    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should reply with success message when book is successfully returned', async () => {
        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, [{ bookCount: 1 }]);
        });
        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null);
        });
        mockConnection.beginTransaction.mockImplementation((callback) => {
            callback(null);
        });
        mockConnection.commit.mockImplementation((callback) => {
            callback(null);
        });

        await returnBook(mockMessage, mockConnection, mockCheckedOutBooks);

        expect(mockMessage.reply).toHaveBeenCalledWith(
            expect.stringContaining(constants.RETURN_BOOK_SUCCUESSFULLY_MESSAGE)
        );
    });

    test('should reply with error message when there is an error during return', async () => {
        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, [{ bookCount: 1 }]);
        });

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(new Error('Test error'), null);
        });
        mockConnection.beginTransaction.mockImplementationOnce((callback) => {
            callback(new Error('Failed to begin transaction'));
        });
        mockConnection.rollback.mockImplementationOnce((callback) => {
            callback(null);
        });

        await returnBook(mockMessage, mockConnection, mockCheckedOutBooks);

        expect(mockMessage.reply).toHaveBeenCalledWith(
            expect.stringContaining(constants.ERROR_RETURN_MESSAGE)
        );
    });

    test('should reply with message that the book cannot be returned', async () => {
        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, [{ bookCount: 0 }]);
        });

        await returnBook(mockMessage, mockConnection, mockCheckedOutBooks);

        expect(mockMessage.reply).toHaveBeenCalledWith(
            expect.stringContaining(constants.CANNOT_RETURN_BOOK_MESSAGE)
        );
    });
});

describe('addBook function', () => {
    let mockMessage;
    let mockConnection;
    let mockClient;
    let mockMessageCreateHandler;

    beforeEach(() => {
        mockMessage = {
            reply: jest.fn(),
            channel: {
                createMessageCollector: jest.fn(),
            },
        };

        mockConnection = {
            query: jest.fn(),
            beginTransaction: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn(),
        };

        mockClient = {
            on: jest.fn(),
            off: jest.fn(),
        };

        mockMessageCreateHandler = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should handle book details collection and add book to the database', async () => {
        const mockUserResponse = { content: 'Title; Author; 2022; 5' };

        const { EventEmitter } = require('events');

        const collector = new EventEmitter();
        collector.stop = jest.fn();

        mockMessage.channel.createMessageCollector.mockReturnValueOnce(collector);

        jest.spyOn(collector, 'on').mockImplementation((event, callback) => {
            if (event === 'collect') {
                callback(mockUserResponse);
            }
        });

        mockConnection.beginTransaction.mockImplementation((callback) => {
            callback(null);
        });
        mockConnection.query.mockResolvedValueOnce([{ insertId: 5 }]);
        mockConnection.commit.mockResolvedValue();


        await addBook(mockMessage, mockConnection, mockMessageCreateHandler, mockClient);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.BOOK_DETAILS_PROMPT_MESSAGE);
        expect(mockMessage.reply).toHaveBeenCalledWith(constants.BOOK_DETAILS_RECEIVED_MESSAGE);
    });

    test('should handle unexpected error', async () => {
        const mockUserResponse = { content: 'Title; Author; 2022; 5' };

        const { EventEmitter } = require('events');

        const collector = new EventEmitter();
        collector.stop = jest.fn();

        mockMessage.channel.createMessageCollector.mockReturnValueOnce(collector);

        jest.spyOn(collector, 'on').mockImplementation((event, callback) => {
            if (event === 'collect') {
                throw new Error('Simulated error');
            }
        });

        mockConnection.beginTransaction.mockResolvedValue();
        mockConnection.query.mockResolvedValueOnce([{ insertId: 5 }]);
        mockConnection.commit.mockResolvedValue();

        await addBook(mockMessage, mockConnection, mockMessageCreateHandler, mockClient);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.UNEXPECTED_ERROR_MESSAGE);
    });

    test('should handle parsing errors during book details collection', async () => {
        const mockUserResponse = { content: 'Title; Author; 2022; invalidQuantity' };

        const { EventEmitter } = require('events');

        const collector = new EventEmitter();
        collector.stop = jest.fn();

        mockMessage.channel.createMessageCollector.mockReturnValueOnce(collector);

        jest.spyOn(collector, 'on').mockImplementation((event, callback) => {
            if (event === 'collect') {
                callback(mockUserResponse);
            }
        });

        await addBook(mockMessage, mockConnection, mockMessageCreateHandler, mockClient);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.INVALID_DETAILS_MESSAGE);
    });

});

describe('help function', () => {
    let mockMessage;

    beforeEach(() => {
        mockMessage = {
            reply: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should send help message for admin', () => {
        const isAdmin = true;

        help(mockMessage, isAdmin);

        expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('Admin Commands'));
        expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('/3'));
        expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('Available Commands'));
        expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('/start'));
        expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('/1'));
        expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('/checkout [Book ID]'));
        expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('/2'));
        expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('/return [Book ID]'));
    });

    test('should send help message for non-admin', () => {
        const isAdmin = false;

        help(mockMessage, isAdmin);

        expect(mockMessage.reply).toHaveBeenCalledWith(expect.not.stringContaining('Admin Commands'));
        expect(mockMessage.reply).toHaveBeenCalledWith(expect.not.stringContaining('/3'));
        expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('Available Commands'));
        expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('/start'));
        expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('/1'));
        expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('/checkout [Book ID]'));
        expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('/2'));
        expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('/return [Book ID]'));
    });
});