const assert = require('assert');
const sinon = require('sinon');
const bookService = require('../../src/service/databaseService');
const transactions = require('../../src/service/transactions');
const constants = require('../../src/constants/constant')

describe('addBookToDatabase', () => {
    let mockMessage;
    let mockConnection;
    let mockBookDetails;

    beforeEach(() => {
        mockMessage = { reply: sinon.spy() };
        mockConnection = {
            query: sinon.stub().callsArgWith(2, null, { insertId: 1 }),
        };
        mockBookDetails = {
            title: 'Test Book',
            author: 'Test Author',
            published_year: 2022,
            quantity_available: 5,
        };
    });

    it('should add a book to the database successfully', async () => {
        const beginTransactionStub = sinon.stub(transactions, 'beginTransaction');
        const commitTransactionStub = sinon.stub(transactions, 'commitTransaction');
        const rollbackTransactionStub = sinon.stub(transactions, 'rollbackTransaction');

        await bookService.addBookToDatabase(mockMessage, mockConnection, mockBookDetails);

        assert.ok(beginTransactionStub.calledOnce);
        assert.ok(commitTransactionStub.calledOnce);
        assert.ok(!rollbackTransactionStub.called);
        assert.ok(mockMessage.reply.calledWith('Book added successfully! Title: Test Book'));

        beginTransactionStub.restore();
        commitTransactionStub.restore();
        rollbackTransactionStub.restore();
    });


    it('should handle errors and rollback transaction', async () => {
        const beginTransactionStub = sinon.stub(transactions, 'beginTransaction');
        const commitTransactionStub = sinon.stub(transactions, 'commitTransaction');
        const rollbackTransactionStub = sinon.stub(transactions, 'rollbackTransaction');
        mockConnection.query.callsArgWith(2, new Error('Fake database error'));

        await bookService.addBookToDatabase(mockMessage, mockConnection, mockBookDetails);

        assert.ok(beginTransactionStub.calledOnce);
        assert.ok(!commitTransactionStub.called);
        assert.ok(rollbackTransactionStub.calledOnce);
        assert.ok(mockMessage.reply.calledWith('An unexpected error occurred while processing the command.'));

        beginTransactionStub.restore();
        commitTransactionStub.restore();
        rollbackTransactionStub.restore();
    });
});

describe('deleteBookWithQuantity', () => {
    let mockMessage;
    let mockConnection;
    let mockBook;
    let mockQuantity;

    beforeEach(() => {
        mockMessage = { reply: sinon.spy() };
        mockConnection = {
            query: sinon.stub(),
        };
        mockBook = { id: 1, title: 'Test Book' };
        mockQuantity = 5;
    });

    it('should delete book quantity successfully', async () => {
        const beginTransactionStub = sinon.stub(transactions, 'beginTransaction');
        const commitTransactionStub = sinon.stub(transactions, 'commitTransaction');
        const rollbackTransactionStub = sinon.stub(transactions, 'rollbackTransaction');
        mockConnection.query.callsArgWith(1, null, {}); // simulate successful query

        await bookService.deleteBookWithQuantity(mockMessage, mockConnection, mockBook, mockQuantity);

        assert.ok(beginTransactionStub.calledOnce);
        assert.ok(commitTransactionStub.calledOnce);
        assert.ok(!rollbackTransactionStub.called);
        assert.ok(mockMessage.reply.calledWith('Book quantity deleted successfully!'));

        beginTransactionStub.restore();
        commitTransactionStub.restore();
        rollbackTransactionStub.restore();
    });

    it('should handle errors and rollback transaction', async () => {
        const beginTransactionStub = sinon.stub(transactions, 'beginTransaction');
        const commitTransactionStub = sinon.stub(transactions, 'commitTransaction');
        const rollbackTransactionStub = sinon.stub(transactions, 'rollbackTransaction');
        mockConnection.query.callsArgWith(1, new Error('Fake database error'));

        await bookService.deleteBookWithQuantity(mockMessage, mockConnection, mockBook, mockQuantity);

        assert.ok(beginTransactionStub.calledOnce);
        assert.ok(!commitTransactionStub.called);
        assert.ok(rollbackTransactionStub.calledOnce);
        assert.ok(mockMessage.reply.calledWith('An unexpected error occurred while processing the command.'));

        beginTransactionStub.restore();
        commitTransactionStub.restore();
        rollbackTransactionStub.restore();
    });
});

describe('updateBookDetails', () => {
    let mockMessage;
    let mockConnection;
    let mockBook;
    let mockTitle;
    let mockAuthor;
    let mockPublishedYear;
    let mockQuantity;

    beforeEach(() => {
        mockMessage = { reply: sinon.spy() };
        mockConnection = {
            query: sinon.stub(),
        };
        mockBook = { id: 1, title: 'Test Book', author: 'Test Author', published_year: 2022, quantity_available: 5 };
        mockTitle = 'Updated Test Book';
        mockAuthor = 'Updated Test Author';
        mockPublishedYear = 2023;
        mockQuantity = 10;
    });

    it('should update book details successfully', async () => {
        const beginTransactionStub = sinon.stub(transactions, 'beginTransaction').resolves();
        const commitTransactionStub = sinon.stub(transactions, 'commitTransaction').resolves();
        const rollbackTransactionStub = sinon.stub(transactions, 'rollbackTransaction').resolves();
        mockConnection.query.callsArgWith(1, null, {}); // simulate successful query

        await bookService.updateBookDetails(mockMessage, mockConnection, mockBook, mockTitle, mockAuthor, mockPublishedYear, mockQuantity);

        assert.ok(beginTransactionStub.calledOnce);
        assert.ok(commitTransactionStub.calledOnce);
        assert.ok(!rollbackTransactionStub.called);
        assert.ok(mockMessage.reply.calledWith(constants.BOOK_UPDATED_MESSAGE));

        beginTransactionStub.restore();
        commitTransactionStub.restore();
        rollbackTransactionStub.restore();
    });

    it('should handle errors and rollback transaction', async () => {
        const beginTransactionStub = sinon.stub(transactions, 'beginTransaction').resolves();
        const commitTransactionStub = sinon.stub(transactions, 'commitTransaction').resolves();
        const rollbackTransactionStub = sinon.stub(transactions, 'rollbackTransaction').resolves();
        mockConnection.query.callsArgWith(1, new Error('Fake database error'));

        await bookService.updateBookDetails(mockMessage, mockConnection, mockBook, mockTitle, mockAuthor, mockPublishedYear, mockQuantity);

        assert.ok(beginTransactionStub.calledOnce);
        assert.ok(!commitTransactionStub.called);
        assert.ok(rollbackTransactionStub.calledOnce);
        assert.ok(mockMessage.reply.calledWith(constants.ERROR_UPDATE_BOOK_MESSAGE));

        beginTransactionStub.restore();
        commitTransactionStub.restore();
        rollbackTransactionStub.restore();
    });
});
