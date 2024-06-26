const { checkoutBook } = require('../../../src/controllers/commands/checkoutBook');
const { notifyAdminCheckoutRequest } = require('../../../src/service/notifier');
const constants = require('../../../src/constants/constant');
const { getCheckedOutUsersQuery } = require('../../../src/service/queries/getCheckedOutUsersQuery')

jest.mock('../../../src/service/queries/getCheckedOutUsersQuery')

jest.mock('../../../src/service/notifier', () => ({
    notifyAdminCheckoutRequest: jest.fn(),
}));

describe('checkoutBook function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should reply with book not found message if book with given ID does not exist', async () => {
        const mockMessage = {
            content: '!checkout 123',
            author: { id: '1234567890', username: 'testuser' },
            reply: jest.fn(),
        };

        const mockConnection = {};
        const mockBookMap = new Map();

        await checkoutBook(mockMessage, mockConnection, mockBookMap, {});

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.BOOK_WITH_THAT_ID_NOT_FOUND_MESSAGE);
        expect(getCheckedOutUsersQuery).not.toHaveBeenCalled();
        expect(notifyAdminCheckoutRequest).not.toHaveBeenCalled();
    });

    test('should reply with error message if checking for checked out users fails', async () => {
        const mockMessage = {
            content: '!checkout 1',
            author: { id: '1234567890', username: 'testuser' },
            reply: jest.fn(),
        };

        const mockConnection = {};
        const mockBookMap = new Map([[1, { id: 1, quantity_available: 1 }]]);

        getCheckedOutUsersQuery.mockResolvedValue(null);

        await checkoutBook(mockMessage, mockConnection, mockBookMap, {});

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.ERROR_VALIDATING_CHECKED_OUT_BOOK_MESSAGE);
        expect(getCheckedOutUsersQuery).toHaveBeenCalled();
        expect(notifyAdminCheckoutRequest).not.toHaveBeenCalled();
    });

    test('should reply with already checked out message if user has already checked out the book', async () => {
        const mockMessage = {
            content: '!checkout 1',
            author: { id: '1234567890', username: 'testuser' },
            reply: jest.fn(),
        };

        const mockConnection = {};
        const mockBookMap = new Map([[1, { id: 1, quantity_available: 1 }]]);
        const mockUsers = [{ name: 'testuser' }];

        getCheckedOutUsersQuery.mockResolvedValue(mockUsers);

        await checkoutBook(mockMessage, mockConnection, mockBookMap, {});

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.ALREADY_CHECKED_OUT_BOOK_MESSAGE);
        expect(getCheckedOutUsersQuery).toHaveBeenCalled();
        expect(notifyAdminCheckoutRequest).not.toHaveBeenCalled();
    });

});
