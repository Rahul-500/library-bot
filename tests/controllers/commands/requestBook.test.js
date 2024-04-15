const { requestBook } = require('../../../src/controllers/commands/requestBook');
const constants = require('../../../src/constants/constant');
const { notifyAdminNewBookRequest } = require('../../../src/service/notifier');
const { addBookRequestQuery } = require('../../../src/service/queries/addBookRequestQuery');

jest.mock('../../../src/service/queries/addBookRequestQuery')
jest.mock('../../../src/service/notifier', () => ({
    notifyAdminNewBookRequest: jest.fn(),
}));

describe('requestBook function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should reply with exit message when user cancels the book request', async () => {
        const mockClient = {};
        const mockMessage = {
            content: 'exit',
            author: { id: '1234567890' },
            channel: {
                createMessageCollector: jest.fn(() => ({
                    on: jest.fn((event, callback) => {
                        if (event === 'collect') {
                            callback({ content: 'exit' });
                        } else if (event === 'end') {
                            callback();
                        }
                    }),
                    stop: jest.fn(),
                })),
            },
            reply: jest.fn(),
        };

        const mockConnection = {};
        const mockUserEventsMap = new Map();
        mockUserEventsMap.set('1234567890', { messageCreate: false });

        await requestBook(mockClient, mockMessage, mockConnection, mockUserEventsMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.EXIT_REQUEST_BOOK_MESSAGE);
        expect(addBookRequestQuery).not.toHaveBeenCalled();
        expect(notifyAdminNewBookRequest).not.toHaveBeenCalled();
    });

    test('should add book request and notify admin when user submits a book request', async () => {
        const mockClient = {};
        const mockMessage = {
            content: 'Title or link of the book',
            author: { id: '1234567890' },
            channel: {
                createMessageCollector: jest.fn(() => ({
                    on: jest.fn((event, callback) => {
                        if (event === 'collect') {
                            callback({ content: 'Title or link of the book' });
                        } else if (event === 'end') {
                            callback();
                        }
                    }),
                    stop: jest.fn(),
                })),
            },
            reply: jest.fn(),
        };

        const mockConnection = {};
        const mockUserEventsMap = new Map();
        mockUserEventsMap.set('1234567890', { messageCreate: false });

        await requestBook(mockClient, mockMessage, mockConnection, mockUserEventsMap);

        expect(mockMessage.reply).not.toHaveBeenCalledWith(constants.EXIT_REQUEST_BOOK_MESSAGE);
        expect(addBookRequestQuery).toHaveBeenCalledWith(mockConnection, 'Title or link of the book', mockMessage);
        expect(notifyAdminNewBookRequest).toHaveBeenCalledWith(mockClient, mockMessage, mockConnection, 'Title or link of the book');
    });
});
