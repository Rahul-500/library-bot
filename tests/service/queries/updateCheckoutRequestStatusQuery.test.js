const sinon = require("sinon");
const { updateCheckoutRequestStatusQuery } = require("../../../src/service/queries/updateCheckoutRequestStatusQuery");
const transactions = require("../../../src/service/transactions");

describe("updateCheckoutRequestStatusQuery", () => {
  let mockConnection;
  let mockCheckoutRequest;
  let mockCheckoutRequestStatus;

  beforeEach(() => {
    mockConnection = { query: sinon.stub().callsArgWith(1, null, { affectedRows: 1 }) };
    mockCheckoutRequest = { id: 123, user_id: 456, book_id: 789 };
    mockCheckoutRequestStatus = "approved";
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should handle errors and rollback transaction", async () => {
    const beginTransactionStub = sinon.stub(transactions, "beginTransaction");
    const commitTransactionStub = sinon.stub(transactions, "commitTransaction");
    const rollbackTransactionStub = sinon.stub(transactions, "rollbackTransaction");
    mockConnection.query.callsArgWith(1, new Error("Fake database error"));

    const result = await updateCheckoutRequestStatusQuery(mockConnection, mockCheckoutRequest, mockCheckoutRequestStatus);

    expect(mockConnection.query.calledOnce).toBe(true);
    expect(beginTransactionStub.calledOnce).toBe(true);
    expect(commitTransactionStub.calledOnce).toBe(false);
    expect(rollbackTransactionStub.calledOnce).toBe(true);
    expect(result).toBeNull();
  });
});
