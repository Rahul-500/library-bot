const { returnBook } = require('../../../src/controllers/commands/returnBook');
const { validateReturn, getReturnRequestsForBook } = require('../../../src/service/databaseService');
const constants = require('../../../src/constants/constant');
const { notifyAdminReturnBookRequest } = require('../../../src/service/notifier');

jest.mock('../../../src/service/databaseService', () => ({
    validateReturn: jest.fn(),
    getReturnRequestsForBook: jest.fn(),
}));
jest.mock('../../../src/service/notifier', () => ({
    notifyAdminReturnBookRequest: jest.fn(),
}));

describe('returnBook function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should reply with book not found message if the book ID does not exist', async () => {
        const mockMessage = {
            content: '/return 1',
            author: { id: '1234567890' },
            reply: jest.fn(),
        };

        const mockClient = {};
        const mockConnection = {};
        const mockCheckedOutBooks = new Map();

        await returnBook(mockMessage, mockClient, mockConnection, mockCheckedOutBooks);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.BOOK_WITH_THAT_ID_NOT_FOUND_MESSAGE);
        expect(validateReturn).not.toHaveBeenCalled();
        expect(getReturnRequestsForBook).not.toHaveBeenCalled();
        expect(notifyAdminReturnBookRequest).not.toHaveBeenCalled();
    });

    test('should reply with cannot return book message if the return validation fails', async () => {
        const mockMessage = {
            content: '/return 1',
            author: { id: '1234567890' },
            reply: jest.fn(),
        };

        const mockClient = {};
        const mockConnection = {};
        const mockCheckedOutBooks = new Map([[1, { id: 1 }]]);

        validateReturn.mockResolvedValue(false);

        await returnBook(mockMessage, mockClient, mockConnection, mockCheckedOutBooks);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.CANNOT_RETURN_BOOK_MESSAGE);
        expect(validateReturn).toHaveBeenCalledWith(mockConnection, '1234567890', 1);
        expect(getReturnRequestsForBook).not.toHaveBeenCalled();
        expect(notifyAdminReturnBookRequest).not.toHaveBeenCalled();
    });

    test('should notify admin and process return request if all validations pass', async () => {
        const mockMessage = {
            content: '/return 1',
            author: { id: '1234567890' },
            reply: jest.fn(),
        };

        const mockClient = {};
        const mockConnection = {};
        const mockCheckedOutBooks = new Map([[1, { id: 1 }]]);
        const mockUserIdList = [{ user_id: '1234567890' }];

        validateReturn.mockResolvedValue(true);
        getReturnRequestsForBook.mockResolvedValue(mockUserIdList);

        await returnBook(mockMessage, mockClient, mockConnection, mockCheckedOutBooks);

        expect(mockMessage.reply).not.toHaveBeenCalledWith(constants.BOOK_WITH_THAT_ID_NOT_FOUND_MESSAGE);
        expect(mockMessage.reply).not.toHaveBeenCalledWith(constants.CANNOT_RETURN_BOOK_MESSAGE);
        expect(validateReturn).toHaveBeenCalledWith(mockConnection, '1234567890', 1);
        expect(getReturnRequestsForBook).toHaveBeenCalledWith(mockConnection, 1);
    });
});

