const {start} = require('../../src/controllers/commandsController')
const constants=require('../../src/constants/constant')
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