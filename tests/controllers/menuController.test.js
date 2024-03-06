const menuController = require('../../src/controllers/menuController');
const commandsController = require('../../src/controllers/commandsController');
const validateUser = require('../../src/service/validateUser')
const constants = require('../../src/constants/constant')
const display = require('../../src/utils/display')

describe('menu', () => {
    let mockMessage;
    let mockConnection;
    let bookMap;
    let checkedOutBooks;
    beforeEach(() => {
        mockMessage = {
            reply: jest.fn(),
            author: { username: 'TestUser', bot: false },
            content: ''
        };

        mockConnection = {
            query: jest.fn(),
        };

        bookMap = new Map();
        checkedOutBooks = new Map();

    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('On /start start method should be invoked', async () => {
        const command = '/start';
        commandsController.start = jest.fn()
        validateUser.checkForExistingUser = jest.fn()
        mockMessage.content = command
        display.welcomeMessage = jest.fn();
        validateUser.checkForExistingUser.mockResolvedValue(true);

        let dependencies = {
            message: mockMessage,
            commandsController,
            connection: mockConnection,
            validateUser,
            bookMap,
            display
        };

        commandsController.start.mockImplementationOnce((message, connection) => {
            return Promise.resolve([]);
        });
        await menuController.menu(dependencies);

        expect(commandsController.start).toHaveBeenCalledWith(mockMessage, mockConnection);
        expect(display.welcomeMessage).toHaveBeenCalledWith(mockMessage);
    });

    test('On /1 display availableBooks method should be invoked', async () => {
        const command = '/1';

        commandsController.getAvailableBooks = jest.fn();
        commandsController.getAvailableBooks.mockImplementationOnce((message, connection, bookMap) => {
            return Promise.resolve([]);
        });

        display.availableBooks = jest.fn();
        mockMessage.content = command;

        let dependencies = {
            message: mockMessage,
            commandsController,
            connection: mockConnection,
            validateUser,
            bookMap,
            display,
        };

        await menuController.menu(dependencies);
        expect(commandsController.getAvailableBooks).toHaveBeenCalledWith(mockMessage, mockConnection, bookMap);
        expect(display.availableBooks).toHaveBeenCalled();

    });

    test('On /1 display availableBooks method should not be invoked', async () => {
        const command = '/1';

        commandsController.getAvailableBooks = jest.fn();
        commandsController.getAvailableBooks.mockImplementationOnce((message, connection, bookMap) => {
            return Promise.resolve(null);
        });

        display.availableBooks = jest.fn();
        mockMessage.content = command;

        let dependencies = {
            message: mockMessage,
            commandsController,
            connection: mockConnection,
            validateUser,
            bookMap,
            display,
        };

        await menuController.menu(dependencies);
        expect(commandsController.getAvailableBooks).toHaveBeenCalledWith(mockMessage, mockConnection, bookMap);
        expect(display.availableBooks).not.toHaveBeenCalled();

    });

    test('On /2 getUserBooks method should be invoked', async () => {
        commandsController.getUserBooks = jest.fn();
        commandsController.getUserBooks.mockImplementationOnce((message, connection, checkedOutBooks) => {
            return Promise.resolve([]);
        });
        display.userBooks = jest.fn();

        const command = '/2'
        mockMessage.content = command

        let dependencies = {
            message: mockMessage,
            commandsController,
            connection: mockConnection,
            validateUser,
            checkedOutBooks,
            display
        };

        await menuController.menu(dependencies);

        expect(commandsController.getUserBooks).toHaveBeenCalledWith(mockMessage, mockConnection, checkedOutBooks);
        expect(display.userBooks).toHaveBeenCalled()
    });

    test('On /2 getUserBooks method should not be invoked', async () => {
        commandsController.getUserBooks = jest.fn();
        commandsController.getUserBooks.mockImplementationOnce((message, connection, checkedOutBooks) => {
            return Promise.resolve(null);
        });
        display.userBooks = jest.fn();

        const command = '/2'
        mockMessage.content = command

        let dependencies = {
            message: mockMessage,
            commandsController,
            connection: mockConnection,
            validateUser,
            checkedOutBooks,
            display
        };

        await menuController.menu(dependencies);

        expect(commandsController.getUserBooks).toHaveBeenCalledWith(mockMessage, mockConnection, checkedOutBooks);
        expect(display.userBooks).not.toHaveBeenCalled()
    });

    test('should reply with GET_AVAILABLE_BEFORE_CHECKOUT_MESSAGE if bookMap is empty', async () => {
        const command = '/checkout 1';
        mockMessage.content = command;
        commandsController.checkoutBook = jest.fn();

        await menuController.menu({
            message: mockMessage,
            commandsController,
            connection: mockConnection,
            validateUser,
            bookMap,
        });

        expect(mockMessage.reply).toHaveBeenCalledWith(
            expect.stringContaining(constants.GET_AVAILABLE_BEFORE_CHECKOUT_MESSAGE)
        );
        expect(commandsController.checkoutBook).not.toHaveBeenCalled();
    });


    test('should invoke checkoutBook if bookMap is not empty and command matches checkoutPattern', async () => {
        const mockCommand = '/checkout 1';
        mockMessage.content = mockCommand;
        commandsController.reut = jest.fn();

        bookMap.set(1, { id: 1, title: 'Sample Book', author: 'Sample Author', published_year: 2022, quantity_available: 5 });

        await menuController.menu({
            message: mockMessage,
            commandsController,
            connection: mockConnection,
            validateUser,
            bookMap,
        });

        expect(mockMessage.reply).not.toHaveBeenCalledWith(expect.stringContaining(constants.GET_AVAILABLE_BEFORE_CHECKOUT_MESSAGE));
        expect(commandsController.checkoutBook).toHaveBeenCalledWith(mockMessage, mockConnection, bookMap);
    });

    test('should reply with GET_AVAILABLE_BEFORE_RETURN_MESSAGE if checkedOutBooks is empty', async () => {
        const command = '/return 1';
        mockMessage.content = command;
        commandsController.returnBook = jest.fn();

        await menuController.menu({
            message: mockMessage,
            commandsController,
            connection: mockConnection,
            validateUser,
            checkedOutBooks,
        });

        expect(mockMessage.reply).toHaveBeenCalledWith(
            expect.stringContaining(constants.GET_AVAILABLE_BEFORE_RETURN_MESSAGE)
        );
        expect(commandsController.returnBook).not.toHaveBeenCalled();
    });

    test('should invoke returnBook if checkedOutBooks is not empty and command matches returnPattern', async () => {
        const mockCommand = '/return 1';
        mockMessage.content = mockCommand;
        commandsController.returnBook = jest.fn();

        checkedOutBooks.set(1, { id: 1, title: 'Sample Book' });

        await menuController.menu({
            message: mockMessage,
            commandsController,
            connection: mockConnection,
            validateUser,
            checkedOutBooks,
        });

        expect(mockMessage.reply).not.toHaveBeenCalledWith(expect.stringContaining(constants.GET_AVAILABLE_BEFORE_RETURN_MESSAGE));
        expect(commandsController.returnBook).toHaveBeenCalledWith(mockMessage, mockConnection, checkedOutBooks);
    });
    test('should invoke addBook for admin with command /3', async () => {
        const mockCommand = '/3';
        mockMessage.content = mockCommand;
        commandsController.addBook = jest.fn();
        const checkedOutBooks = new Map();
        const userEventsMap = new Map();
        const validateUser = {
            isAdmin: jest.fn().mockReturnValue(true),
            checkForExistingUser: jest.fn().mockReturnValue(true)
        };

        await menuController.menu({
            message: mockMessage,
            commandsController,
            connection: mockConnection,
            validateUser,
            bookMap,
            checkedOutBooks,
            userEventsMap
        });


        expect(validateUser.isAdmin).toHaveBeenCalledWith(mockMessage);
        expect(commandsController.addBook).toHaveBeenCalledWith(mockMessage, mockConnection, userEventsMap);
    });

    test('should not invoke addBook for non-admin with command /3', async () => {
        const mockCommand = '/3';
        mockMessage.content = mockCommand;
        commandsController.addBook = jest.fn();
        const checkedOutBooks = new Map();
        const messageCreateHandler = jest.fn();
        const client = {};
        const validateUser = {
            isAdmin: jest.fn().mockReturnValue(false),
            checkForExistingUser: jest.fn().mockReturnValue(true)
        };

        await menuController.menu({
            message: mockMessage,
            commandsController,
            connection: mockConnection,
            validateUser,
            bookMap,
            checkedOutBooks,
            messageCreateHandler,
            client,
        });

        expect(validateUser.isAdmin).toHaveBeenCalledWith(mockMessage);
        expect(commandsController.addBook).not.toHaveBeenCalledWith(mockMessage, mockConnection, messageCreateHandler, client);
    });
    test('should call helpCommand when command is !help', async () => {
        const mockCommand = '!help';
        mockMessage.content = mockCommand;
        commandsController.help = jest.fn();
        const checkedOutBooks = new Map();
        const messageCreateHandler = jest.fn();
        const client = {};
        const validateUser = {
            isAdmin: jest.fn().mockReturnValue(true),
            checkForExistingUser: jest.fn().mockReturnValue(true)
        };
        await menuController.menu({
            message: mockMessage,
            commandsController,
            connection: mockConnection,
            validateUser,
            bookMap,
            checkedOutBooks,
            messageCreateHandler,
            client,
        });

        expect(commandsController.help).toHaveBeenCalledWith(mockMessage, true);
    });

    test('should invoke deleteBook for admin with command /4', async () => {
        const mockCommand = '/4';
        mockMessage.content = mockCommand;
        commandsController.deleteBook = jest.fn();
        const checkedOutBooks = new Map();
        const userEventsMap = new Map()
        display.availableBooksWithQuantity = jest.fn();
        const validateUser = {
            isAdmin: jest.fn().mockReturnValue(true),
            checkForExistingUser: jest.fn().mockReturnValue(true)
        };


        commandsController.getAvailableBooks.mockImplementationOnce((message, connection, checkedOutBooks) => {
            return Promise.resolve([]);
        });

        await menuController.menu({
            message: mockMessage,
            commandsController,
            connection: mockConnection,
            validateUser,
            bookMap,
            checkedOutBooks,
            userEventsMap,
            display,
        });

        expect(validateUser.isAdmin).toHaveBeenCalledWith(mockMessage);
        expect(display.availableBooksWithQuantity).toHaveBeenCalled();
        expect(commandsController.deleteBook).toHaveBeenCalledWith(mockMessage, mockConnection, bookMap, userEventsMap);
    });

    test('should not invoke deleteBook for non-admin with command /4', async () => {
        const mockCommand = '/4';
        mockMessage.content = mockCommand;
        commandsController.deleteBook = jest.fn();
        const checkedOutBooks = new Map();
        const messageCreateHandler = jest.fn();
        const client = {};
        const validateUser = {
            isAdmin: jest.fn().mockReturnValue(false),
            checkForExistingUser: jest.fn().mockReturnValue(true)
        };

        await menuController.menu({
            message: mockMessage,
            commandsController,
            connection: mockConnection,
            validateUser,
            bookMap,
            checkedOutBooks,
            messageCreateHandler,
            client,
        });

        expect(validateUser.isAdmin).toHaveBeenCalledWith(mockMessage);
        expect(commandsController.deleteBook).not.toHaveBeenCalledWith(mockMessage, mockConnection, bookMap, messageCreateHandler, client);
    });

});

