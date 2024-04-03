const { help } = require('../../../src/controllers/menuoptions/help');
const { help:helpCommand } = require('../../../src/controllers/commands/help');
const { isAdmin } = require('../../../src/middleware/validateAdmin');

jest.mock('../../../src/middleware/validateAdmin', () => ({
    isAdmin: jest.fn(),
}));

jest.mock('../../../src/controllers/commands/help', () => ({
    help: jest.fn(),
}));

describe('help function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should call help function with isAdmin result', async () => {
        const mockMessage = {
            content: '!help',
        };

        isAdmin.mockReturnValue(true);

        await help(mockMessage);

        expect(isAdmin).toHaveBeenCalledWith(mockMessage);
        expect(helpCommand).toHaveBeenCalledWith(mockMessage, true);
    });

    test('should call help function with false for isAdmin result', async () => {
        const mockMessage = {
            content: '!help',
        };

        isAdmin.mockReturnValue(false);

        await help(mockMessage);

        expect(isAdmin).toHaveBeenCalledWith(mockMessage);
        expect(helpCommand).toHaveBeenCalledWith(mockMessage, false);
    });
});

