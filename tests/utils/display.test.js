const constants = require('../../src/constants/constant');
const { displayAvailableBooks, displayUserBooks } = require('../../src/utils/display'); 

describe('Book Display Functions', () => {
    test('displayAvailableBooks should reply with "No books found" when the book list is empty', () => {
        const message = {
            reply: jest.fn(),
        };
        const books = [];

        displayAvailableBooks(message, books);

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

        displayAvailableBooks(message, books);

        const expectedReply = `${constants.AVAILABEL_BOOKS}\n1 - Book 1\n2 - Book 2`;
        expect(message.reply).toHaveBeenCalledWith(expectedReply);
    });

    test('displayUserBooks should reply with "No books found" when the user\'s book list is empty', () => {
        const message = {
            reply: jest.fn(),
        };
        const books = [];

        displayUserBooks(message, books);

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

        displayUserBooks(message, books);

        const expectedReply = `${constants.MY_BOOKS}\n1 - Book A\n2 - Book B`;
        expect(message.reply).toHaveBeenCalledWith(expectedReply);
    });
});
