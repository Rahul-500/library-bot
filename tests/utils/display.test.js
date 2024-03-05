const constants = require('../../src/constants/constant');
const { availableBooks, userBooks, availableBooksWithQuantity } = require('../../src/utils/display');

describe('Book Display Functions', () => {
    test('displayAvailableBooks should reply with "No books found" when the book list is empty', () => {
        const message = {
            reply: jest.fn(),
        };
        const books = [];

        availableBooks(message, books);

        expect(message.reply).toHaveBeenCalledWith(constants.NO_BOOKS_FOUND);
    });

    test('displayAvailableBooks should reply with the list of available books', () => {
        const message = {
            reply: jest.fn(),
        };
        const books = [
            { title: 'Book 1' },
            { title: 'Book 2' },
        ];

        availableBooks(message, books);

        const expectedReply = `${constants.AVAILABEL_BOOKS}\n1 - Book 1\n2 - Book 2`;
        expect(message.reply).toHaveBeenCalledWith(expectedReply);
    });

    test('displayUserBooks should reply with "No books found" when the user\'s book list is empty', () => {
        const message = {
            reply: jest.fn(),
        };
        const books = [];

        userBooks(message, books);

        expect(message.reply).toHaveBeenCalledWith(constants.NO_BOOKS_FOUND);
    });

    test('displayUserBooks should reply with the list of user\'s books', () => {
        const message = {
            reply: jest.fn(),
        };
        const books = [
            { title: 'Book A' },
            { title: 'Book B' },
        ];

        userBooks(message, books);

        const expectedReply = `${constants.MY_BOOKS}\n1 - Book A\n2 - Book B`;
        expect(message.reply).toHaveBeenCalledWith(expectedReply);
    });
});

describe('availableBooksWithQuantity', () => {
    it('should return a formatted list of available books with quantity', () => {
        const message = { reply: jest.fn() };
        const books = [
            { title: 'Book 1', quantity_available: 5 },
            { title: 'Book 2', quantity_available: 3 },
        ];

        availableBooksWithQuantity(message, books);

        expect(message.reply).toHaveBeenCalledWith(expect.stringContaining('My books'));
        expect(message.reply).toHaveBeenCalledWith(expect.stringContaining('1 - Book 1 - 5'));
        expect(message.reply).toHaveBeenCalledWith(expect.stringContaining('2 - Book 2 - 3'));
    });

    it('should reply with NO_BOOKS_FOUND if no books are available', () => {
        const message = { reply: jest.fn() };
        const books = [];

        availableBooksWithQuantity(message, books);

        expect(message.reply).toHaveBeenCalledWith(constants.NO_BOOKS_FOUND);
    });
});
