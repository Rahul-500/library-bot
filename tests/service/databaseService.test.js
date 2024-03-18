const assert = require("assert");
const sinon = require("sinon");
const bookService = require("../../src/service/databaseService");
const transactions = require("../../src/service/transactions");
const constants = require("../../src/constants/constant");
const { DB_NAME, TABLE_NAME_BOOKS, TABLE_NAME_USERS, TABLE_NAME_ISSUED_BOOKS } =
  process.env;

describe("addBookToDatabase", () => {
  let mockMessage;
  let mockConnection;
  let mockBookDetails;

  beforeEach(() => {
    mockMessage = { reply: sinon.spy() };
    mockConnection = {
      query: sinon.stub().callsArgWith(2, null, { insertId: 1 }),
    };
    mockBookDetails = {
      title: "Test Book",
      author: "Test Author",
      published_year: 2022,
      quantity_available: 5,
    };
  });

  it("should add a book to the database successfully", async () => {
    const beginTransactionStub = sinon.stub(transactions, "beginTransaction");
    const commitTransactionStub = sinon.stub(transactions, "commitTransaction");
    const rollbackTransactionStub = sinon.stub(
      transactions,
      "rollbackTransaction",
    );

    await bookService.addBookToDatabase(
      mockMessage,
      mockConnection,
      mockBookDetails,
    );

    assert.ok(beginTransactionStub.calledOnce);
    assert.ok(commitTransactionStub.calledOnce);
    assert.ok(!rollbackTransactionStub.called);
    assert.ok(
      mockMessage.reply.calledWith("Book added successfully! Title: Test Book"),
    );

    beginTransactionStub.restore();
    commitTransactionStub.restore();
    rollbackTransactionStub.restore();
  });

  it("should handle errors and rollback transaction", async () => {
    const beginTransactionStub = sinon.stub(transactions, "beginTransaction");
    const commitTransactionStub = sinon.stub(transactions, "commitTransaction");
    const rollbackTransactionStub = sinon.stub(
      transactions,
      "rollbackTransaction",
    );
    mockConnection.query.callsArgWith(2, new Error("Fake database error"));

    await bookService.addBookToDatabase(
      mockMessage,
      mockConnection,
      mockBookDetails,
    );

    assert.ok(beginTransactionStub.calledOnce);
    assert.ok(!commitTransactionStub.called);
    assert.ok(rollbackTransactionStub.calledOnce);
    assert.ok(
      mockMessage.reply.calledWith(
        "An unexpected error occurred while processing the command.",
      ),
    );

    beginTransactionStub.restore();
    commitTransactionStub.restore();
    rollbackTransactionStub.restore();
  });
});

describe("deleteBookWithQuantity", () => {
  let mockMessage;
  let mockConnection;
  let mockBook;
  let mockQuantity;

  beforeEach(() => {
    mockMessage = { reply: sinon.spy() };
    mockConnection = {
      query: sinon.stub(),
    };
    mockBook = { id: 1, title: "Test Book" };
    mockQuantity = 5;
  });

  it("should delete book quantity successfully", async () => {
    const beginTransactionStub = sinon.stub(transactions, "beginTransaction");
    const commitTransactionStub = sinon.stub(transactions, "commitTransaction");
    const rollbackTransactionStub = sinon.stub(
      transactions,
      "rollbackTransaction",
    );
    mockConnection.query.callsArgWith(1, null, {}); // simulate successful query

    await bookService.deleteBookWithQuantity(
      mockMessage,
      mockConnection,
      mockBook,
      mockQuantity,
    );

    assert.ok(beginTransactionStub.calledOnce);
    assert.ok(commitTransactionStub.calledOnce);
    assert.ok(!rollbackTransactionStub.called);
    assert.ok(
      mockMessage.reply.calledWith("Book quantity deleted successfully!"),
    );

    beginTransactionStub.restore();
    commitTransactionStub.restore();
    rollbackTransactionStub.restore();
  });

  it("should handle errors and rollback transaction", async () => {
    const beginTransactionStub = sinon.stub(transactions, "beginTransaction");
    const commitTransactionStub = sinon.stub(transactions, "commitTransaction");
    const rollbackTransactionStub = sinon.stub(
      transactions,
      "rollbackTransaction",
    );
    mockConnection.query.callsArgWith(1, new Error("Fake database error"));

    await bookService.deleteBookWithQuantity(
      mockMessage,
      mockConnection,
      mockBook,
      mockQuantity,
    );

    assert.ok(beginTransactionStub.calledOnce);
    assert.ok(!commitTransactionStub.called);
    assert.ok(rollbackTransactionStub.calledOnce);
    assert.ok(
      mockMessage.reply.calledWith(
        "An unexpected error occurred while processing the command.",
      ),
    );

    beginTransactionStub.restore();
    commitTransactionStub.restore();
    rollbackTransactionStub.restore();
  });
});

describe("updateBookDetails", () => {
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
    mockBook = {
      id: 1,
      title: "Test Book",
      author: "Test Author",
      published_year: 2022,
      quantity_available: 5,
    };
    mockTitle = "Updated Test Book";
    mockAuthor = "Updated Test Author";
    mockPublishedYear = 2023;
    mockQuantity = 10;
  });

  it("should update book details successfully", async () => {
    const beginTransactionStub = sinon
      .stub(transactions, "beginTransaction")
      .resolves();
    const commitTransactionStub = sinon
      .stub(transactions, "commitTransaction")
      .resolves();
    const rollbackTransactionStub = sinon
      .stub(transactions, "rollbackTransaction")
      .resolves();
    mockConnection.query.callsArgWith(1, null, {}); // simulate successful query

    await bookService.updateBookDetails(
      mockMessage,
      mockConnection,
      mockBook,
      mockTitle,
      mockAuthor,
      mockPublishedYear,
      mockQuantity,
    );

    assert.ok(beginTransactionStub.calledOnce);
    assert.ok(commitTransactionStub.calledOnce);
    assert.ok(!rollbackTransactionStub.called);
    assert.ok(mockMessage.reply.calledWith(constants.BOOK_UPDATED_MESSAGE));

    beginTransactionStub.restore();
    commitTransactionStub.restore();
    rollbackTransactionStub.restore();
  });

  it("should handle errors and rollback transaction", async () => {
    const beginTransactionStub = sinon
      .stub(transactions, "beginTransaction")
      .resolves();
    const commitTransactionStub = sinon
      .stub(transactions, "commitTransaction")
      .resolves();
    const rollbackTransactionStub = sinon
      .stub(transactions, "rollbackTransaction")
      .resolves();
    mockConnection.query.callsArgWith(1, new Error("Fake database error"));

    await bookService.updateBookDetails(
      mockMessage,
      mockConnection,
      mockBook,
      mockTitle,
      mockAuthor,
      mockPublishedYear,
      mockQuantity,
    );

    assert.ok(beginTransactionStub.calledOnce);
    assert.ok(!commitTransactionStub.called);
    assert.ok(rollbackTransactionStub.calledOnce);
    assert.ok(
      mockMessage.reply.calledWith(constants.ERROR_UPDATE_BOOK_MESSAGE),
    );

    beginTransactionStub.restore();
    commitTransactionStub.restore();
    rollbackTransactionStub.restore();
  });
});

describe("addUserInfo", () => {
  let mockConnection;
  let id;
  let name;

  beforeEach(() => {
    mockConnection = {
      query: sinon.stub().callsArgWith(1, null, { insertId: 1 }),
    };
    id = 123;
    name = "Test User";
  });

  it("should add user info to the database successfully", async () => {
    const beginTransactionStub = sinon.stub(transactions, "beginTransaction");
    const commitTransactionStub = sinon.stub(transactions, "commitTransaction");
    const rollbackTransactionStub = sinon.stub(
      transactions,
      "rollbackTransaction",
    );

    await bookService.addUserInfo(id, name, mockConnection);

    assert.ok(beginTransactionStub.calledOnce);
    assert.ok(commitTransactionStub.calledOnce);
    assert.ok(!rollbackTransactionStub.called);

    beginTransactionStub.restore();
    commitTransactionStub.restore();
    rollbackTransactionStub.restore();
  });

  it("should handle errors and rollback transaction", async () => {
    const beginTransactionStub = sinon.stub(transactions, "beginTransaction");
    const commitTransactionStub = sinon.stub(transactions, "commitTransaction");
    const rollbackTransactionStub = sinon.stub(
      transactions,
      "rollbackTransaction",
    );
    mockConnection.query.callsArgWith(1, new Error("Fake database error"));

    await bookService.addUserInfo(id, name, mockConnection);

    assert.ok(beginTransactionStub.calledOnce);
    assert.ok(!commitTransactionStub.called);
    assert.ok(rollbackTransactionStub.calledOnce);

    beginTransactionStub.restore();
    commitTransactionStub.restore();
    rollbackTransactionStub.restore();
  });
});

describe("getCheckedOutUsers", () => {
  let mockConnection;
  let mockBook;
  const mockUsers = [{ name: "User1" }, { name: "User2" }, { name: "User3" }];

  beforeEach(() => {
    mockConnection = {
      query: jest.fn(),
    };
    mockBook = { id: 1 };
  });

  it("should return the list of checked out users for a book", async () => {
    mockConnection.query.mockImplementation((query, callback) => {
      if (query.includes("SELECT name from")) {
        callback(null, mockUsers);
      }
    });
    const users = await bookService.getCheckedOutUsers(
      mockConnection,
      mockBook,
    );
    assert.strictEqual(users, mockUsers);
  });

  it("should handle errors and return null", async () => {
    const errorMessage = "Fake database error";
    mockConnection.query.mockImplementation((query, callback) => {
      if (query.includes("SELECT name from")) {
        callback(new Error(errorMessage), null);
      }
    });

    const users = await bookService.getCheckedOutUsers(
      mockConnection,
      mockBook,
    );
    assert.strictEqual(users, null);
  });
});

describe("getUserIdByUsername", () => {
  let mockConnection;

  beforeEach(() => {
    mockConnection = {
      query: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return user ID list when query succeeds", async () => {
    const mockUsername = "user1,user2";
    const mockQueryResult = [{ id: 1 }, { id: 2 }];

    mockConnection.query.mockImplementationOnce((query, callback) => {
      if (
        query.includes(
          `SELECT id FROM ${DB_NAME}.${TABLE_NAME_USERS} WHERE name IN (${mockUsername})`,
        )
      ) {
        callback(null, mockQueryResult);
      }
    });

    const userIdList = await bookService.getUserIdByUsername(
      mockConnection,
      mockUsername,
    );

    expect(userIdList).toEqual(mockQueryResult);
    expect(mockConnection.query).toHaveBeenCalled();
  });

  it("should return null when query fails", async () => {
    const mockUsername = "user1,user2";
    const errorMessage = "Fake database error";

    mockConnection.query.mockImplementationOnce((query, callback) => {
      if (
        query.includes(
          `SELECT id FROM ${DB_NAME}.${TABLE_NAME_USERS} WHERE name IN (${mockUsername})`,
        )
      ) {
        callback(new Error(errorMessage), null);
      }
    });

    const userIdList = await bookService.getUserIdByUsername(
      mockConnection,
      mockUsername,
    );

    expect(userIdList).toBeNull();
    expect(mockConnection.query).toHaveBeenCalled();
  });
});

describe("addBookRequest", () => {
  let mockConnection;
  let mockMessage;
  let bookRequest;
  beforeEach(() => {
    mockMessage = {
      author: {
        id: "1",
      },
    };
    mockConnection = {
      query: sinon.stub().callsArgWith(1, null, { insertId: 1 }),
    };
    bookRequest = "New Book link or title";
  });

  it("should add user info to the database successfully", async () => {
    const beginTransactionStub = sinon.stub(transactions, "beginTransaction");
    const commitTransactionStub = sinon.stub(transactions, "commitTransaction");
    const rollbackTransactionStub = sinon.stub(
      transactions,
      "rollbackTransaction",
    );

    await bookService.addBookRequest(mockConnection, bookRequest, mockMessage);

    assert.ok(beginTransactionStub.calledOnce);
    assert.ok(commitTransactionStub.calledOnce);
    assert.ok(!rollbackTransactionStub.called);

    beginTransactionStub.restore();
    commitTransactionStub.restore();
    rollbackTransactionStub.restore();
  });

  it("should handle errors and rollback transaction", async () => {
    const beginTransactionStub = sinon.stub(transactions, "beginTransaction");
    const commitTransactionStub = sinon.stub(transactions, "commitTransaction");
    const rollbackTransactionStub = sinon.stub(
      transactions,
      "rollbackTransaction",
    );
    mockConnection.query.callsArgWith(1, new Error("Fake database error"));

    await bookService.addBookRequest(mockConnection, bookRequest, mockMessage);

    assert.ok(beginTransactionStub.calledOnce);
    assert.ok(!commitTransactionStub.called);
    assert.ok(rollbackTransactionStub.calledOnce);

    beginTransactionStub.restore();
    commitTransactionStub.restore();
    rollbackTransactionStub.restore();
  });
});

describe("updateBookRequestStatus", () => {
  let mockConnection;
  let bookRequestId;
  let bookRequestStatus;

  beforeEach(() => {
    mockConnection = {
      query: sinon.stub().callsArgWith(1, null, { insertId: 1 }),
    };
    bookRequestId = 1;
    bookRequestStatus = "approved";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should update book request status successfully", async () => {
    const beginTransactionStub = sinon.stub(transactions, "beginTransaction");
    const commitTransactionStub = sinon.stub(transactions, "commitTransaction");
    const rollbackTransactionStub = sinon.stub(
      transactions,
      "rollbackTransaction",
    );

    await bookService.updateBookRequestStatus(
      mockConnection,
      bookRequestId,
      bookRequestStatus,
    );

    assert.ok(beginTransactionStub.calledOnce);
    assert.ok(commitTransactionStub.calledOnce);
    assert.ok(!rollbackTransactionStub.called);

    beginTransactionStub.restore();
    commitTransactionStub.restore();
    rollbackTransactionStub.restore();
  });

  it("should handle errors and rollback transaction", async () => {
    const beginTransactionStub = sinon.stub(transactions, "beginTransaction");
    const commitTransactionStub = sinon.stub(transactions, "commitTransaction");
    const rollbackTransactionStub = sinon.stub(
      transactions,
      "rollbackTransaction",
    );
    mockConnection.query.callsArgWith(1, new Error("Fake database error"));

    await bookService.updateBookRequestStatus(
      mockConnection,
      bookRequestId,
      bookRequestStatus,
    );

    assert.ok(beginTransactionStub.calledOnce);
    assert.ok(!commitTransactionStub.calledOnce);
    assert.ok(rollbackTransactionStub.called);

    beginTransactionStub.restore();
    commitTransactionStub.restore();
    rollbackTransactionStub.restore();
  });
});
