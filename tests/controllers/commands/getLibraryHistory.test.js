const { addBook } = require('../../../src/controllers/commands/addBook');
const constants = require('../../../src/constants/constant');
const { addBookToDatabase } = require('../../../src/service/databaseService');

jest.mock('../../../src/service/databaseService', () => ({
    addBookToDatabase: jest.fn(),
}));

describe('addBook function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should add book to database when valid details are provided', async () => {
        const mockMessage = {
            author: { id: '1234567890' },
            channel: {
                createMessageCollector: jest.fn(() => ({
                    on: jest.fn((event, callback) => {
                        if (event === 'collect') {
                            callback({ content: 'Title; Author; 2022; 5' });
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

        await addBook(mockMessage, mockConnection, mockUserEventsMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.ADD_BOOK_DETAILS_RECEIVED_MESSAGE);
        expect(addBookToDatabase).toHaveBeenCalled();

        const [[messageArg, connectionArg, bookDetailsArg]] = addBookToDatabase.mock.calls;

        expect(messageArg).toBe(mockMessage);
        expect(connectionArg).toBe(mockConnection);
        expect(bookDetailsArg).toEqual({
            title: 'Title',
            author: 'Author',
            published_year: 2022,
            quantity_available: 5,
        });
    });

    test('should reply with invalid details message if details are incomplete', async () => {
        const mockMessage = {
            author: { id: '1234567890' },
            channel: {
                createMessageCollector: jest.fn(() => ({
                    on: jest.fn((event, callback) => {
                        if (event === 'collect') {
                            callback({ content: 'Title; Author; 2022;' });
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

        await addBook(mockMessage, mockConnection, mockUserEventsMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.INVALID_DETAILS_MESSAGE);
        expect(addBookToDatabase).not.toHaveBeenCalled();
    });

    test('should reply with exit message and stop collecting if user enters "exit"', async () => {
        const mockMessage = {
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

        await addBook(mockMessage, mockConnection, mockUserEventsMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.EXIT_ADD_MESSAGE);
        expect(addBookToDatabase).not.toHaveBeenCalled();
    });
});
