const { returnBook } = require('../../../src/controllers/commands/returnBook');
const constants = require('../../../src/constants/constant');
const { notifyAdminReturnBookRequest } = require('../../../src/service/notifier');
const {validateReturnQuery} = require('../../../src/service/queries/validateReturnQuery')
const {getReturnRequestsForBookQuery} = require('../../../src/service/queries/getReturnRequestsForBookQuery')

jest.mock('../../../src/service/queries/validateReturnQuery', () => ({
    validateReturnQuery: jest.fn(),
}));
jest.mock('../../../src/service/queries/getReturnRequestsForBookQuery', () => ({
    getReturnRequestsForBookQuery: jest.fn(),
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
        expect(validateReturnQuery).not.toHaveBeenCalled();
        expect(getReturnRequestsForBookQuery).not.toHaveBeenCalled();
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

        validateReturnQuery.mockResolvedValue(false);

        await returnBook(mockMessage, mockClient, mockConnection, mockCheckedOutBooks);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.CANNOT_RETURN_BOOK_MESSAGE);
        expect(validateReturnQuery).toHaveBeenCalledWith(mockConnection, '1234567890', 1);
        expect(getReturnRequestsForBookQuery).not.toHaveBeenCalled();
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

        validateReturnQuery.mockResolvedValue(true);
        getReturnRequestsForBookQuery.mockResolvedValue(mockUserIdList);

        await returnBook(mockMessage, mockClient, mockConnection, mockCheckedOutBooks);

        expect(mockMessage.reply).not.toHaveBeenCalledWith(constants.BOOK_WITH_THAT_ID_NOT_FOUND_MESSAGE);
        expect(mockMessage.reply).not.toHaveBeenCalledWith(constants.CANNOT_RETURN_BOOK_MESSAGE);
        expect(validateReturnQuery).toHaveBeenCalledWith(mockConnection, '1234567890', 1);
        expect(getReturnRequestsForBookQuery).toHaveBeenCalledWith(mockConnection, 1);
    });
});

