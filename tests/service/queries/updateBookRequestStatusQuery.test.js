const sinon = require("sinon");
const { updateBookRequestStatusQuery } = require("../../../src/service/queries/updateBookRequestStatusQuery");
const transactions = require("../../../src/service/transactions");
const { deleteBookRequestQuery } = require("../../../src/service/queries/deleteBookRequestQuery");

describe("updateBookRequestStatusQuery", () => {
  let mockConnection;
  let mockBookRequestId;
  let mockBookRequestStatus;

  beforeEach(() => {
    mockConnection = { query: sinon.stub() };
    mockBookRequestId = 123;
    mockBookRequestStatus = "approved";
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should handle errors and rollback transaction", async () => {
    const beginTransactionStub = sinon.stub(transactions, "beginTransaction");
    const commitTransactionStub = sinon.stub(transactions, "commitTransaction");
    const rollbackTransactionStub = sinon.stub(transactions, "rollbackTransaction");

    mockConnection.query.callsArgWith(1, new Error("Fake database error"));

    const result = await updateBookRequestStatusQuery(mockConnection, mockBookRequestId, mockBookRequestStatus);

    expect(mockConnection.query.calledOnce).toBe(true);
    expect(beginTransactionStub.calledOnce).toBe(true);
    expect(commitTransactionStub.calledOnce).toBe(false);
    expect(rollbackTransactionStub.calledOnce).toBe(true);
    expect(result).toBeNull();
  });
});
