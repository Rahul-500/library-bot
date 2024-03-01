const menuController = require('../../src/controllers/menuController');
const commandsController = require('../../src/controllers/commandsController');
const validateUser = require('../../src/service/validateUser')


describe('menu', () => {
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
});
