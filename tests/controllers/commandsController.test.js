const { start } = require('../../src/controllers/commandsController')
const { EventEmitter } = require('events');
const { getAvailableBooks, checkoutBook, getUserBooks, returnBook, addBook, deleteBook, help, getLibraryHistory, updateBook, requestBook } = require('../../src/controllers/commandsController')
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

    test('start should not call addUserInfo method for existing user', () => {

        const mockResults = [{ id: '123', name: 'TestUser' }];

        mockConnection.query.mockImplementation((query, callback) => {
            if (query.includes('SELECT * FROM')) {
                callback(null, mockResults);
            }
        });
        start(mockMessage, mockConnection);
        expect(mockConnection.query).not.toHaveBeenCalledWith(expect.stringContaining('INSERT INTO'));
    })

    test('start should call addUserInfo method for new user', async () => {
        const mockResults = [];

        mockConnection.query.mockImplementation((query, callback) => {
            if (query.includes('SELECT * FROM')) {
                callback(null, mockResults);
            }
        });

        await start(mockMessage, mockConnection);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM'), expect.any(Function));
    });

    test('should reply with "Error fetching available books" when there is an error', async () => {
        const mockError = new Error('Test error');

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(mockError, null);
        });

        await start(mockMessage, mockConnection);

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

    test('should return books when there are books', async () => {
        const mockResults = [
            { id: 1, title: 'Book 1', quantity_available: 3, },
            { id: 2, title: 'Book 2', quantity_available: 5, },
        ];

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, mockResults);
        });

        const books = await getAvailableBooks(mockMessage, mockConnection, bookMap);

        expect(books).not.toBeNull();
    });

    test('should return null when there are no books', async () => {
        const mockResults = [];

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, mockResults);
        });

        const books = await getAvailableBooks(mockMessage, mockConnection);

        expect(books).toBeNull();
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
                username: 'test'
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
            [1, { id: 1, title: 'Book 1', quantity_available: 2 }],
        ]);


    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should reply with success message when book is successfully checked out', async () => {
        mockConnection.query.mockImplementationOnce((query, callback) => {

            callback(null, []);
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

            callback(null, []);
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

            callback(null, [{ name: 'test' }]);
        });

        await checkoutBook(mockMessage, mockConnection, mockBookMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(
            expect.stringContaining(constants.ALREADY_CHECKED_OUT_BOOK_MESSAGE)
        );
    });

    test('should reply with message that book is currently unavailable with users', async () => {
        let book = mockBookMap.get(1);
        book.quantity_available = 0;
        mockBookMap.set(1, book)
        mockConnection.query.mockImplementationOnce((query, callback) => {

            callback(null, [{ name: 'rahul' }]);
        });

        await checkoutBook(mockMessage, mockConnection, mockBookMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(
            expect.stringContaining(constants.BOOK_CURRENTLY_NOT_AVAILABLE_MESSAGE + '`rahul`')
        );
    });
    test('should reply with message error validating checked-out book', async () => {
        mockConnection.query.mockImplementationOnce((query, callback) => {

            callback(new Error('Query error'), null);
        });

        await checkoutBook(mockMessage, mockConnection, mockBookMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(
            expect.stringContaining(constants.ERROR_VALIDATING_CHECKED_OUT_BOOK_MESSAGE)
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

    test(`should return user's checked-out books when there are books`, async () => {
        const mockResults = [
            { id: 1, title: 'Book 1' },
            { id: 2, title: 'Book 2' },
        ];

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, mockResults);
        });

        const books = await getUserBooks(mockMessage, mockConnection, checkedOutBooks);

        expect(books).not.toBeNull()
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

    beforeEach(() => {
        mockMessage = {
            author: { id: 'test' },
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
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should handle book details collection and add book to the database', async () => {
        const mockUserResponse = { content: 'Title; Author; 2022; 5' };

        const userEventsMap = new Map()
        userEventsMap.set('test', { messageCreate: true });

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


        await addBook(mockMessage, mockConnection, userEventsMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.BOOK_DETAILS_PROMPT_MESSAGE);
        expect(mockMessage.reply).toHaveBeenCalledWith(constants.ADD_BOOK_DETAILS_RECEIVED_MESSAGE);
    });

    test('should handle parsing errors during book details collection', async () => {
        const mockUserResponse = { content: 'Title; Author; 2022; invalidQuantity' };
        const userEventsMap = new Map()
        userEventsMap.set('test', { messageCreate: true });
        const collector = new EventEmitter();
        collector.stop = jest.fn();

        mockMessage.channel.createMessageCollector.mockReturnValueOnce(collector);

        jest.spyOn(collector, 'on').mockImplementation((event, callback) => {
            if (event === 'collect') {
                callback(mockUserResponse);
            }
        });

        await addBook(mockMessage, mockConnection, userEventsMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.INVALID_DETAILS_MESSAGE);
    });

});
describe('deleteBook function', () => {
    let mockMessage;
    let mockConnection;
    let mockBookMap;
    let mockClient;
    let mockMessageCreateHandler;

    beforeEach(() => {
        mockMessage = {
            author: { id: 'test' },
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

        mockBookMap = new Map();
        mockBookMap.set(1, { title: 'Book 1', quantity_available: 5 });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should handle book deletion', async () => {
        const mockUserResponse = { content: '1; 2' };
        const userEventsMap = new Map()
        userEventsMap.set('test', { messageCreate: true });

        const collector = new EventEmitter();
        collector.stop = jest.fn();

        mockMessage.channel.createMessageCollector.mockReturnValueOnce(collector);

        jest.spyOn(collector, 'on').mockImplementation((event, callback) => {
            if (event === 'collect') {
                callback(mockUserResponse);
            }
        });

        await deleteBook(mockMessage, mockConnection, mockBookMap, userEventsMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.DELETE_BOOK_PROMPT_MESSAGE);
        expect(mockMessage.reply).toHaveBeenCalledWith(constants.DELETE_BOOK_DETAILS_RECEIVED_MESSAGE);
    });

    test('should handle parsing errors during book deletion', async () => {
        const mockUserResponse = { content: 'invalidID; invalidQuantity' };
        const userEventsMap = new Map()
        userEventsMap.set('test', { messageCreate: true });
        const collector = new EventEmitter();
        collector.stop = jest.fn();

        mockMessage.channel.createMessageCollector.mockReturnValueOnce(collector);

        jest.spyOn(collector, 'on').mockImplementation((event, callback) => {
            if (event === 'collect') {
                callback(mockUserResponse);
            }
        });

        await deleteBook(mockMessage, mockConnection, mockBookMap, userEventsMap);
        expect(mockMessage.reply).toHaveBeenCalledWith(constants.INVALID_DELETE_DETAILS_MESSAGE);
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
        expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('/add-book'));
        expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('Available Commands'));
        expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('/start'));
        expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('/available-books'));
        expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('/checkout [Book ID]'));
        expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('/my-books'));
        expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('/return [Book ID]'));
    });

    test('should send help message for non-admin', () => {
        const isAdmin = false;

        help(mockMessage, isAdmin);

        expect(mockMessage.reply).toHaveBeenCalledWith(expect.not.stringContaining('Admin Commands'));
        expect(mockMessage.reply).toHaveBeenCalledWith(expect.not.stringContaining('/add-book'));
        expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('Available Commands'));
        expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('/start'));
        expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('/available-books'));
        expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('/checkout [Book ID]'));
        expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('/my-books'));
        expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining('/return [Book ID]'));
    });
});

describe('getLibraryHistory function', () => {
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

    test('should return library history when query is successful', async () => {
        const mockResults = [
            { name: 'User1', title: 'Book1', checked_out: '2022-01-01', returned: '2022-01-10' },
            { name: 'User2', title: 'Book2', checked_out: '2022-02-01', returned: '2022-02-10' },
        ];

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(null, mockResults);
        });

        const result = await getLibraryHistory(mockMessage, mockConnection);


        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(result).toEqual(mockResults);
        expect(mockMessage.reply).not.toHaveBeenCalled();
    });

    test('should handle error and reply with an error message', async () => {
        const mockError = new Error('Database error');

        mockConnection.query.mockImplementationOnce((query, callback) => {
            callback(mockError, null);
        });

        const result = await getLibraryHistory(mockMessage, mockConnection);

        expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
        expect(result).toBeNull();
        expect(mockMessage.reply).toHaveBeenCalledWith(constants.ERROR_FETCHING_LIBRARY_HISTORY);
    });
});

describe('updateBook function', () => {
    let mockMessage;
    let mockConnection;
    let mockBooks;
    let mockUserEventsMap;

    beforeEach(() => {
        mockMessage = {
            author: { id: 'test' },
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

        mockBooks = new Map();
        mockBooks.set(1, { id: 1, title: 'Test Book', author: 'Test Author', published_year: 2022, quantity_available: 5 });

        mockUserEventsMap = new Map();
        mockUserEventsMap.set('test', { messageCreate: true });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should handle updating book details successfully', async () => {
        const mockUserResponseForCollector = { content: '1' }
        const mockUserResponseForUpdateCollector = { content: 'New Title; New Author; 2023; 10' };
        const collector = new EventEmitter();
        const updateCollector = new EventEmitter()
        collector.stop = jest.fn();
        updateCollector.stop = jest.fn()

        mockMessage.channel.createMessageCollector.mockReturnValueOnce(collector).mockReturnValueOnce(updateCollector);

        jest.spyOn(collector, 'on').mockImplementation((event, callback) => {
            if (event === 'collect') {
                callback(mockUserResponseForCollector);
            }
        });

        jest.spyOn(updateCollector, 'on').mockImplementation((event, callback) => {
            if (event === 'collect') {
                callback(mockUserResponseForUpdateCollector);
            }
        });
        mockConnection.beginTransaction.mockImplementation((callback) => {
            callback(null);
        });
        mockConnection.query.mockResolvedValueOnce([]);
        mockConnection.commit.mockResolvedValue();

        await updateBook(mockMessage, mockConnection, mockBooks, mockUserEventsMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.UPDATE_BOOK_ID_PROMPT_MESSAGE);
        expect(mockMessage.reply).toHaveBeenCalledWith(constants.UPDATE_BOOK_PROMPT_MESSAGE);
        expect(mockMessage.reply).toHaveBeenCalledWith(constants.UPDATE_BOOK_DETAILS_RECEIVED_MESSAGE);
    });

    test('should handle updating book details with invalid book ID', async () => {
        const mockUserResponseForCollector = { content: '99' }
        const collector = new EventEmitter();
        collector.stop = jest.fn();

        mockMessage.channel.createMessageCollector.mockReturnValueOnce(collector);

        jest.spyOn(collector, 'on').mockImplementation((event, callback) => {
            if (event === 'collect') {
                callback(mockUserResponseForCollector);
            }
        });

        await updateBook(mockMessage, mockConnection, mockBooks, mockUserEventsMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.UPDATE_BOOK_ID_PROMPT_MESSAGE);
        expect(mockMessage.reply).toHaveBeenCalledWith(constants.INVALID_BOOK_ID_MESSAGE);
    });

    test('should handle updating book details with invalid update details', async () => {
        const mockUserResponseForCollector = { content: '1' }
        const mockUserResponseForUpdateCollector = { content: 'New Title; New Author; 2023; invalidQuantity' };
        const collector = new EventEmitter();
        const updateCollector = new EventEmitter()
        collector.stop = jest.fn();
        updateCollector.stop = jest.fn()

        mockMessage.channel.createMessageCollector.mockReturnValueOnce(collector).mockReturnValueOnce(updateCollector);

        jest.spyOn(collector, 'on').mockImplementation((event, callback) => {
            if (event === 'collect') {
                callback(mockUserResponseForCollector);
            }
        });

        jest.spyOn(updateCollector, 'on').mockImplementation((event, callback) => {
            if (event === 'collect') {
                callback(mockUserResponseForUpdateCollector);
            }
        });

        await updateBook(mockMessage, mockConnection, mockBooks, mockUserEventsMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.UPDATE_BOOK_PROMPT_MESSAGE);
        expect(mockMessage.reply).toHaveBeenCalledWith(constants.INVALID_UPDATE_DETAILS_MESSAGE);
    });
});

describe('requestBook function', () => {
    let mockMessage;
    let mockConnection;
    let mockUserEventsMap;
    let mockCollector;

    beforeEach(() => {
        mockMessage = {
            author: { id: 'test' },
            reply: jest.fn(),
            channel: {
                createMessageCollector: jest.fn(),
            },
        };

        mockConnection = {
            query: jest.fn(),
        };

        mockUserEventsMap = new Map();
        mockUserEventsMap.set('test', { messageCreate: true });

        mockCollector = {
            on: jest.fn(),
            stop: jest.fn(),
        };

    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should handle requesting a new book successfully', async () => {
        const mockUserResponse = { content: 'Sample Book Title' };
        const collector = new EventEmitter();
        collector.stop = jest.fn();
        mockMessage.channel.createMessageCollector.mockReturnValueOnce(collector)
        jest.spyOn(collector, 'on').mockImplementation((event, callback) => {
            if (event === 'collect') {
                callback(mockUserResponse);
            }
        });

        await requestBook(null, mockMessage, mockConnection, mockUserEventsMap);

        expect(mockMessage.reply).toHaveBeenCalledWith("Enter the title or link of the book");
    });

    test('should throw error with message unexpected request new book', async () => {
        const mockUserResponse = { content: 'exit' };
        const collector = new EventEmitter();
        collector.stop = jest.fn();
        mockMessage.channel.createMessageCollector.mockReturnValueOnce(collector);
    
        jest.spyOn(collector, 'on').mockImplementation((event, callback) => {
            if (event === 'collect') {
                callback(mockUserResponse);
            }
        });
    
        await requestBook(null, mockMessage, mockConnection, mockUserEventsMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.EXIT_REQUEST_BOOK_MESSAGE);
    });
    
});
