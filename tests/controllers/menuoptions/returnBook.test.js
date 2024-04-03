const constants = require('../../../src/constants/constant');
const { returnBook } = require('../../../src/controllers/commands/returnBook');
const { returnBook: returnBookFunction } = require('../../../src/controllers/menuoptions/returnBook');

jest.mock('../../../src/controllers/commands/returnBook', () => ({
    returnBook: jest.fn(),
}));

describe('returnBook function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should reply with message if checkedOutBooks size is 0', async () => {
        const mockMessage = {
            reply: jest.fn(),
        };
        const mockClient = {};
        const mockConnection = {};
        const mockCheckedOutBooks = new Map(); 
        await returnBookFunction(mockMessage, mockClient, mockConnection, mockCheckedOutBooks);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.GET_AVAILABLE_BEFORE_RETURN_MESSAGE);
        expect(returnBook).not.toHaveBeenCalled();
    });

    test('should call returnBook if checkedOutBooks size is not 0', async () => {
        const mockMessage = {};
        const mockClient = {};
        const mockConnection = {};
        const mockCheckedOutBooks = new Map([['book1', 'user1']]);
        await returnBookFunction(mockMessage, mockClient, mockConnection, mockCheckedOutBooks);

        expect(returnBook).toHaveBeenCalledWith(mockMessage, mockClient, mockConnection, mockCheckedOutBooks);
    });
});
