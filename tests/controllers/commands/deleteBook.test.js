const { deleteBook } = require('../../../src/controllers/commands/deleteBook');
const constants = require('../../../src/constants/constant');
const { deleteBookWithQuantityQuery } = require('../../../src/service/queries/deleteBookWithQuantityQuery');

jest.mock('../../../src/service/queries/deleteBookWithQuantityQuery')

describe('deleteBook function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should reply with invalid delete book ID message if book ID does not exist', async () => {
        const mockMessage = {
            content: '123;5',
            author: { id: '1234567890' },
            channel: {
                createMessageCollector: jest.fn(() => ({
                    on: jest.fn((event, callback) => {
                        if (event === 'collect') {
                            callback({ content: '123;5' });
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
        const mockBookMap = new Map();
        const mockUserEventsMap = new Map();
        mockUserEventsMap.set('1234567890', { messageCreate: false });

        await deleteBook(mockMessage, mockConnection, mockBookMap, mockUserEventsMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.INVALID_DELETE_BOOK_ID_MESSAGE);
        expect(deleteBookWithQuantityQuery).not.toHaveBeenCalled();
    });

    test('should reply with quantity not in limit message if quantity to delete is more than available', async () => {
        const mockMessage = {
            content: '123;10',
            author: { id: '1234567890' },
            channel: {
                createMessageCollector: jest.fn(() => ({
                    on: jest.fn((event, callback) => {
                        if (event === 'collect') {
                            callback({ content: '123;10' });
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
        const mockBookMap = new Map([[123, { id: 123, quantity_available: 5 }]]);
        const mockUserEventsMap = new Map();
        mockUserEventsMap.set('1234567890', { messageCreate: false });

        await deleteBook(mockMessage, mockConnection, mockBookMap, mockUserEventsMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.QUANTITY_NOT_IN_LIMIT_MESSAGE);
        expect(deleteBookWithQuantityQuery).not.toHaveBeenCalled();
    });

    test('should call deleteBookWithQuantityQuery and reply with delete book details received message', async () => {
        const mockMessage = {
            content: '123;3',
            author: { id: '1234567890' },
            channel: {
                createMessageCollector: jest.fn(() => ({
                    on: jest.fn((event, callback) => {
                        if (event === 'collect') {
                            callback({ content: '123;3' });
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
        const mockBookMap = new Map([[123, { id: 123, quantity_available: 5 }]]);
        const mockUserEventsMap = new Map();
        mockUserEventsMap.set('1234567890', { messageCreate: false });

        await deleteBook(mockMessage, mockConnection, mockBookMap, mockUserEventsMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.DELETE_BOOK_DETAILS_RECEIVED_MESSAGE);
        expect(deleteBookWithQuantityQuery).toHaveBeenCalledWith(mockMessage, mockConnection, mockBookMap.get(123), 3);
    });
});
