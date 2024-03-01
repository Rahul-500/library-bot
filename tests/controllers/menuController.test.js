const menuController = require('../../src/controllers/menuController');
const commandsController = require('../../src/controllers/commandsController');
const validateUser = require('../../src/service/validateUser')


describe('menu', () => {
    let mockMessage;
    let mockConnection;
    let bookMap;
    let checkedOutBooks;
    beforeEach(() => {
        mockMessage = {
            reply: jest.fn(),
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

        commandsController.start = jest.fn()
        validateUser.checkForExistingUser = jest.fn()
        const mockMessage = {
            reply: jest.fn(),
            author: { username: 'TestUser', bot: false },
            content: '/start'
        };

        validateUser.checkForExistingUser.mockResolvedValue(true);

        let dependencies = { message: mockMessage, commandsController, connection: mockConnection, validateUser, bookMap };

        await menuController.menu(dependencies);

        expect(commandsController.start).toHaveBeenCalledWith(mockMessage, mockConnection);
    });

    test('On /1 getAvailableBooks method should be invoked', async () => {
        commandsController.getAvailableBooks = jest.fn();
        const mockMessage = {
            reply: jest.fn(),
            author: { username: 'TestUser', bot: false },
            content: '/1'
        };

        let dependencies = { message: mockMessage, commandsController, connection: mockConnection, validateUser, bookMap };

        await menuController.menu(dependencies);

        expect(commandsController.getAvailableBooks).toHaveBeenCalledWith(mockMessage, mockConnection, bookMap);
    });

    test('On /2 getUserBooks method should be invoked', async () => {
        commandsController.getUserBooks = jest.fn();
        const mockMessage = {
            reply: jest.fn(),
            author: { username: 'TestUser', bot: false },
            content: '/2'
        };

        let dependencies = { message: mockMessage, commandsController, connection: mockConnection, validateUser, checkedOutBooks };

        await menuController.menu(dependencies);

        expect(commandsController.getUserBooks).toHaveBeenCalledWith(mockMessage, mockConnection, checkedOutBooks);
    });
});
