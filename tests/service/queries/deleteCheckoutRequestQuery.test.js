const sinon = require("sinon");
const { deleteCheckoutRequestQuery } = require("../../../src/service/queries/deleteCheckoutRequestQuery");
const transactions = require("../../../src/service/transactions");

describe("deleteCheckoutRequestQuery", () => {
  let mockConnection;
  let mockCheckoutRequestId;

  beforeEach(() => {
    mockConnection = { query: sinon.stub().callsArgWith(1, null, { affectedRows: 1 }) };
    mockCheckoutRequestId = 123;
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should successfully delete a checkout request", async () => {
    const beginTransactionStub = sinon.stub(transactions, "beginTransaction");
    const commitTransactionStub = sinon.stub(transactions, "commitTransaction");
    const rollbackTransactionStub = sinon.stub(transactions, "rollbackTransaction");

    const result = await deleteCheckoutRequestQuery(mockConnection, mockCheckoutRequestId);

    expect(mockConnection.query.calledOnce).toBe(true);
    expect(beginTransactionStub.calledOnce).toBe(true);
    expect(commitTransactionStub.calledOnce).toBe(true);
    expect(rollbackTransactionStub.called).toBe(false);
    expect(result).toEqual({ affectedRows: 1 });
  });

  it("should handle errors and rollback transaction", async () => {
    const beginTransactionStub = sinon.stub(transactions, "beginTransaction");
    const commitTransactionStub = sinon.stub(transactions, "commitTransaction");
    const rollbackTransactionStub = sinon.stub(transactions, "rollbackTransaction");
    mockConnection.query.callsArgWith(1, new Error("Fake database error"));

    const result = await deleteCheckoutRequestQuery(mockConnection, mockCheckoutRequestId);

    expect(mockConnection.query.calledOnce).toBe(true);
    expect(beginTransactionStub.calledOnce).toBe(true);
    expect(commitTransactionStub.calledOnce).toBe(false);
    expect(rollbackTransactionStub.calledOnce).toBe(true);
    expect(result).toBeNull();
  });
});
