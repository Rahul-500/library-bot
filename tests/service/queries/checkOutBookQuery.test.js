const sinon = require("sinon");
const { checkOutBookQuery } = require("../../../src/service/queries/checkOutBookQuery");
const transactions = require("../../../src/service/transactions");

describe("checkOutBookQuery", () => {
  let mockConnection;
  let mockUserId;
  let mockBookId;

  beforeEach(() => {
    mockConnection = { query: sinon.stub().callsArgWith(1, null, { insertId: 1 }) };
    mockUserId = '123';
    mockBookId = 1;
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should successfully check out a book", async () => {
    const beginTransactionStub = sinon.stub(transactions, "beginTransaction");
    const commitTransactionStub = sinon.stub(transactions, "commitTransaction");
    const rollbackTransactionStub = sinon.stub(transactions, "rollbackTransaction");

    const checkout = await checkOutBookQuery(mockConnection, mockUserId, mockBookId);

    expect(mockConnection.query.calledOnce).toBe(true);
    expect(beginTransactionStub.calledOnce).toBe(true);
    expect(commitTransactionStub.calledOnce).toBe(true);
    expect(rollbackTransactionStub.called).toBe(false);
    expect(checkout).toEqual({ insertId: 1 });
  });

  it("should handle errors and rollback transaction", async () => {
    const beginTransactionStub = sinon.stub(transactions, "beginTransaction");
    const commitTransactionStub = sinon.stub(transactions, "commitTransaction");
    const rollbackTransactionStub = sinon.stub(transactions, "rollbackTransaction");
    mockConnection.query.callsArgWith(1, new Error("Fake database error"));

    const checkout = await checkOutBookQuery(mockConnection, mockUserId, mockBookId);

    expect(mockConnection.query.calledOnce).toBe(true);
    expect(beginTransactionStub.calledOnce).toBe(true);
    expect(commitTransactionStub.calledOnce).toBe(false);
    expect(rollbackTransactionStub.calledOnce).toBe(true);
    expect(checkout).toBeNull();
  });
});
