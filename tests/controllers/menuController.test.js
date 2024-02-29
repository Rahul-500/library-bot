const menuController = require('../../src/controllers/menuController'); 
const commandsController = require('../../src/controllers/commandsController');

describe('menu', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('On /start start method should be invoked', () => {
        commandsController.start = jest.fn()
        const mockMessage = {
            reply: jest.fn(), 
            author: { username: 'TestUser', bot: false },
            content: '/start'
        };

        menuController.menu(mockMessage, commandsController);

        expect(commandsController.start).toHaveBeenCalledWith(mockMessage);
    });
});
