const { updateBook } = require('../../../src/controllers/commands/updateBook');
const constants = require('../../../src/constants/constant');
const { updateBookDetailsQuery } = require('../../../src/service/queries/updateBookDetailsQuery');

jest.mock('../../../src/service/queries/updateBookDetailsQuery');

describe('updateBook function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should reply with exit message if user enters "exit"', async () => {
        const mockMessage = {
            content: 'exit',
            author: { id: '1234567890' },
            reply: jest.fn(),
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
        };

        const mockConnection = {};
        const mockBooks = new Map();
        const mockUserEventsMap = new Map();
        mockUserEventsMap.set('1234567890', { messageCreate: false });

        await updateBook(mockMessage, mockConnection, mockBooks, mockUserEventsMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.EXIT_REMOVE_MESSAGE);
        expect(updateBookDetailsQuery).not.toHaveBeenCalled();
    });

    test('should reply with invalid book ID message if book ID does not exist', async () => {
        const mockMessage = {
            content: '123',
            author: { id: '1234567890' },
            reply: jest.fn(),
            channel: {
                createMessageCollector: jest.fn(() => ({
                    on: jest.fn((event, callback) => {
                        if (event === 'collect') {
                            callback({ content: '123' });
                        } else if (event === 'end') {
                            callback();
                        }
                    }),
                    stop: jest.fn(),
                })),
            },
        };

        const mockConnection = {};
        const mockBooks = new Map();
        const mockUserEventsMap = new Map();
        mockUserEventsMap.set('1234567890', { messageCreate: false });

        await updateBook(mockMessage, mockConnection, mockBooks, mockUserEventsMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.INVALID_BOOK_ID_MESSAGE);
        expect(updateBookDetailsQuery).not.toHaveBeenCalled();
    });

    test('should update book details when user provides valid details', async () => {
        const mockMessage = {
            content: '123',
            author: { id: '1234567890' },
            reply: jest.fn(),
            channel: {
                createMessageCollector: jest.fn(() => ({
                    on: jest.fn((event, callback) => {
                        if (event === 'collect') {
                            callback({ content: '123' });
                        } else if (event === 'end') {
                            callback();
                        }
                    }),
                    stop: jest.fn(),
                })),
            },
        };

        const mockConnection = {};
        const mockBook = { id: 123, title: 'Mock Book', author: 'Mock Author', published_year: 2020, quantity_available: 5 };
        const mockBooks = new Map([[123, mockBook]]);
        const mockUserEventsMap = new Map();
        mockUserEventsMap.set('1234567890', { messageCreate: false });

        await updateBook(mockMessage, mockConnection, mockBooks, mockUserEventsMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.UPDATE_BOOK_PROMPT_MESSAGE);
    });

    test('should handle unexpected errors and reply with error message', async () => {
        const mockMessage = {
            content: '123',
            author: { id: '1234567890' },
            reply: jest.fn(),
            channel: {
                createMessageCollector: jest.fn(() => ({
                    on: jest.fn((event, callback) => {
                        if (event === 'collect') {
                            callback({ content: '123' });
                        } else if (event === 'end') {
                            callback();
                        }
                    }),
                    stop: jest.fn(),
                })),
            },
        };

        const mockConnection = {};
        const mockBooks = new Map();
        const mockUserEventsMap = new Map();
        mockUserEventsMap.set('1234567890', { messageCreate: false });

        updateBookDetailsQuery.mockRejectedValue(new Error('Test error'));

        await updateBook(mockMessage, mockConnection, mockBooks, mockUserEventsMap);

        expect(updateBookDetailsQuery).not.toHaveBeenCalled();
    });
});

