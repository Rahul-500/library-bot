const sinon = require("sinon");
const { updateReturnRequestStatusQuery } = require("../../../src/service/queries/updateReturnRequestStatusQuery");
const transactions = require("../../../src/service/transactions");
const { returnBookWithIdQuery } = require("../../../src/service/queries/returnBookWithIdQuery");
const { deleteReturnRequestQuery } = require("../../../src/service/queries/deleteReturnRequestQuery");

describe("updateReturnRequestStatusQuery", () => {
  let mockConnection;
  let mockReturnRequest;
  let mockReturnRequestStatus;

  beforeEach(() => {
    mockConnection = { query: sinon.stub() };
    mockReturnRequest = { id: 123, user_id: 456, book_id: 789 };
    mockReturnRequestStatus = "approved";
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should handle errors and rollback transaction", async () => {
    const beginTransactionStub = sinon.stub(transactions, "beginTransaction");
    const commitTransactionStub = sinon.stub(transactions, "commitTransaction");
    const rollbackTransactionStub = sinon.stub(transactions, "rollbackTransaction");

    mockConnection.query.callsArgWith(1, new Error("Fake database error"));

    const result = await updateReturnRequestStatusQuery(mockConnection, mockReturnRequest, mockReturnRequestStatus);

    expect(mockConnection.query.calledOnce).toBe(true);
    expect(beginTransactionStub.calledOnce).toBe(true);
    expect(commitTransactionStub.calledOnce).toBe(false);
    expect(rollbackTransactionStub.calledOnce).toBe(true);
  });
});
