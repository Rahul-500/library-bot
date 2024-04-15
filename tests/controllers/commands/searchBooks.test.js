const { searchBooks } = require('../../../src/controllers/commands/searchBooks');
const constants = require('../../../src/constants/constant');
const { getBooksByTitleQuery } = require('../../../src/service/queries/getBooksByTitleQuery');

jest.mock('../../../src/service/queries/getBooksByTitleQuery');

describe('searchBooks function', () => {
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
        const mockUserEventsMap = new Map();
        mockUserEventsMap.set('1234567890', { messageCreate: false });
        const mockBookMap = new Map();

        const result = await searchBooks(mockMessage, mockConnection, mockUserEventsMap, mockBookMap);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.EXIT_SEARCH_BOOK_MESSAGE);
        expect(mockBookMap.size).toBe(0);
        expect(result).toEqual([]);
    });

    test('should return books when user provides a valid book title', async () => {
        const mockMessage = {
            content: 'Harry Potter',
            author: { id: '1234567890' },
            reply: jest.fn(),
            channel: {
                createMessageCollector: jest.fn(() => ({
                    on: jest.fn((event, callback) => {
                        if (event === 'collect') {
                            callback({ content: 'Harry Potter' });
                        } else if (event === 'end') {
                            callback();
                        }
                    }),
                    stop: jest.fn(),
                })),
            },
        };

        const mockConnection = {};
        const mockUserEventsMap = new Map();
        mockUserEventsMap.set('1234567890', { messageCreate: false });
        const mockBookMap = new Map();
        const mockBooks = [{ id: 1, title: 'Harry Potter' }];

        getBooksByTitleQuery.mockResolvedValue(mockBooks);

        const result = await searchBooks(mockMessage, mockConnection, mockUserEventsMap, mockBookMap);

        expect(mockMessage.reply).not.toHaveBeenCalledWith(constants.EXIT_SEARCH_BOOK_MESSAGE);
        expect(mockBookMap.size).toBe(1);
        expect(mockBookMap.get(1)).toEqual(mockBooks[0]);
        expect(result).toEqual(mockBooks);
    });
});

