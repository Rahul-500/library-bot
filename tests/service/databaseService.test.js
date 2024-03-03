const assert = require('assert');
const sinon = require('sinon');
const bookService = require('../../src/service/databaseService');
const transactions = require('../../src/service/transactions');

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
        assert.ok(mockMessage.reply.calledWith('Book added successfully! ID: 1, Title: Test Book'));

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