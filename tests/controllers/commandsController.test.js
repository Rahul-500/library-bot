const { start } = require("../../src/controllers/commandsController");
const { EventEmitter } = require("events");
const {
  getAvailableBooks,
  checkoutBook,
  getUserBooks,
  returnBook,
  addBook,
  deleteBook,
  help,
  getLibraryHistory,
  updateBook,
  requestBook,
  processBookRequest,
  processCheckoutRequest,
  searchBooks,
  processReturnRequest,
} = require("../../src/controllers/commandsController");
const constants = require("../../src/constants/constant");
describe("/start command", () => {
  let mockMessage;
  let mockConnection;

  beforeEach(() => {
    mockMessage = {
      reply: jest.fn(),
      author: { id: "123", username: "TestUser" },
    };

    mockConnection = {
      query: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("start should not call addUserInfo method for existing user", () => {
    const mockResults = [{ id: "123", name: "TestUser" }];

    mockConnection.query.mockImplementation((query, callback) => {
      if (query.includes("SELECT * FROM")) {
        callback(null, mockResults);
      }
    });
    start(mockMessage, mockConnection);
    expect(mockConnection.query).not.toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO"),
    );
  });

  test("start should call addUserInfo method for new user", async () => {
    const mockResults = [];

    mockConnection.query.mockImplementation((query, callback) => {
      if (query.includes("SELECT * FROM")) {
        callback(null, mockResults);
      }
    });

    await start(mockMessage, mockConnection);

    expect(mockConnection.query).toHaveBeenCalledWith(
      expect.stringContaining("SELECT * FROM"),
      expect.any(Function),
    );
  });

  test('should reply with "Error fetching available books" when there is an error', async () => {
    const mockError = new Error("Test error");

    mockConnection.query.mockImplementationOnce((query, callback) => {
      callback(mockError, null);
    });

    await start(mockMessage, mockConnection);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.ERROR_FETCHING_USER,
    );
  });
});

describe("getAvailableBooks", () => {
  let mockMessage;
  let mockConnection;
  let bookMap = new Map();
  beforeEach(() => {
    mockMessage = {
      reply: jest.fn(),
    };

    mockConnection = {
      query: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    bookMap.clear();
  });

  test("should return books when there are books", async () => {
    const mockResults = [
      { id: 1, title: "Book 1", quantity_available: 3 },
      { id: 2, title: "Book 2", quantity_available: 5 },
    ];

    mockConnection.query.mockImplementationOnce((query, callback) => {
      callback(null, mockResults);
    });

    const books = await getAvailableBooks(mockMessage, mockConnection, bookMap);

    expect(books).not.toBeNull();
  });

  test("should return null when there are no books", async () => {
    const mockResults = [];

    mockConnection.query.mockImplementationOnce((query, callback) => {
      callback(null, mockResults);
    });

    const books = await getAvailableBooks(mockMessage, mockConnection);

    expect(books).toBeNull();
  });

  test('should reply with "Error fetching available books" when there is an error', async () => {
    const mockError = new Error("Test error");

    mockConnection.query.mockImplementationOnce((query, callback) => {
      callback(mockError, null);
    });

    await getAvailableBooks(mockMessage, mockConnection);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.ERROR_FETCHING_BOOKS,
    );
  });
});

describe("checkoutBook function", () => {
  let mockMessage;
  let mockConnection;
  let mockBookMap;
  let mockClient;

  beforeEach(() => {
    mockMessage = {
      author: { id: "test", username: "TestUser" },
      content: "/checkout 1",
      reply: jest.fn(),
    };

    mockConnection = {
      query: jest.fn(),
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
    };

    mockBookMap = new Map();
    mockBookMap.set(1, { id: 1, quantity_available: 1 });

    mockClient = {
      users: {
        fetch: jest.fn(() => ({ username: "Admin" })),
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should handle book not found", async () => {
    mockBookMap.clear();

    await checkoutBook(mockMessage, mockConnection, mockBookMap, mockClient);

    expect(mockMessage.reply).toHaveBeenCalledWith(constants.BOOK_WITH_THAT_ID_NOT_FOUND_MESSAGE);
  });

  test("should handle error validating checked out users", async () => {
    mockConnection.query.mockImplementationOnce((query, callback) => {
      callback(new Error('Error'), null);
    });

    await checkoutBook(mockMessage, mockConnection, mockBookMap, mockClient);

    expect(mockMessage.reply).toHaveBeenCalledWith(constants.ERROR_VALIDATING_CHECKED_OUT_BOOK_MESSAGE);
  });

  test("should handle already checked out book", async () => {
    mockConnection.query.mockImplementationOnce((query, callback) => {
      callback(null, [{ name: "TestUser" }]);
    });

    await checkoutBook(mockMessage, mockConnection, mockBookMap, mockClient);

    expect(mockMessage.reply).toHaveBeenCalledWith(constants.ALREADY_CHECKED_OUT_BOOK_MESSAGE);
  });

  test("should handle book currently not available", async () => {
    mockBookMap.set(1, { id: 1, quantity_available: 0 });
    mockConnection.query.mockImplementationOnce((query, callback) => {
      callback(null, []);
    });
    await checkoutBook(mockMessage, mockConnection, mockBookMap, mockClient);

    expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining("None"));
  });

  test("should checkout a book if it is available", async () => {
    mockConnection.query.mockImplementationOnce((query, callback) => {
      callback(null, []);
    });
    mockConnection.query.mockImplementationOnce((query, callback) => {
      callback(null, [{ id: '12345' }]);
    });
    mockConnection.query.mockImplementationOnce((query, callback) => {
      callback(null, []);
    });
    mockConnection.beginTransaction.mockImplementation((callback) => {
      callback(null);
    });
    mockConnection.commit.mockImplementation((callback) => {
      callback(null);
    });

    await checkoutBook(mockMessage, mockConnection, mockBookMap, mockClient);

    expect(mockMessage.reply).toHaveBeenCalled();
  });
});

describe("getUserBooks", () => {
  let mockMessage;
  let mockConnection;
  let checkedOutBooks = new Map();

  beforeEach(() => {
    mockMessage = {
      reply: jest.fn(),
      author: { id: "1" },
    };

    mockConnection = {
      query: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    checkedOutBooks.clear();
  });

  test(`should return user's checked-out books when there are books`, async () => {
    const mockResults = [
      { id: 1, title: "Book 1" },
      { id: 2, title: "Book 2" },
    ];

    mockConnection.query.mockImplementationOnce((query, callback) => {
      callback(null, mockResults);
    });

    const books = await getUserBooks(
      mockMessage,
      mockConnection,
      checkedOutBooks,
    );

    expect(books).not.toBeNull();
  });

  test('should reply with "No checked-out books found" when there are no books', async () => {
    const mockResults = [];

    mockConnection.query.mockImplementationOnce((query, callback) => {
      callback(null, mockResults);
    });

    await getUserBooks(mockMessage, mockConnection, checkedOutBooks);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.NO_CHECKED_OUT_BOOK_MESSAGE,
    );
  });

  test('should reply with "Error fetching checked-out books" when there is an error', async () => {
    const mockError = new Error("Test error");

    mockConnection.query.mockImplementationOnce((query, callback) => {
      callback(mockError, null);
    });

    await getUserBooks(mockMessage, mockConnection, checkedOutBooks);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.ERROR_FETCHING_BOOKS,
    );
  });
});

describe("returnBook function", () => {
  let mockMessage;
  let mockConnection;
  let mockCheckedOutBooks;
  let mockClient;

  beforeEach(() => {
    mockMessage = {
      author: { id: "test", username: "TestUser" },
      content: "/return 1",
      reply: jest.fn(),
    };

    mockConnection = {
      query: jest.fn(),
    };

    mockCheckedOutBooks = new Map();
    mockCheckedOutBooks.set(1, { id: 1, bookTitle: "Book 1" }); // Example data

    mockClient = {
      users: {
        fetch: jest.fn(() => ({ username: "Admin" })),
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should handle book not found in checked out books", async () => {
    mockCheckedOutBooks.clear();

    await returnBook(mockMessage, mockClient, mockConnection, mockCheckedOutBooks);

    expect(mockMessage.reply).toHaveBeenCalledWith(constants.BOOK_WITH_THAT_ID_NOT_FOUND_MESSAGE);
  });

  test("should handle error validating return", async () => {
    mockConnection.query.mockImplementationOnce((query, callback) => {
      callback(new Error('Database error'), null);
    });

    await returnBook(mockMessage, mockClient, mockConnection, mockCheckedOutBooks);

    expect(mockMessage.reply).toHaveBeenCalledWith(constants.UNEXPECTED_RETURN_BOOK_ERROR_MESSAGE);
  });

  test("should handle book already checked out", async () => {
    mockConnection.query.mockImplementationOnce((query, callback) => {
      callback(null, [{ bookCount: 0 }]);
    });

    await returnBook(mockMessage, mockClient, mockConnection, mockCheckedOutBooks);

    expect(mockMessage.reply).toHaveBeenCalledWith(constants.CANNOT_RETURN_BOOK_MESSAGE);
  });
});


describe("addBook function", () => {
  let mockMessage;
  let mockConnection;

  beforeEach(() => {
    mockMessage = {
      author: { id: "test" },
      reply: jest.fn(),
      channel: {
        createMessageCollector: jest.fn(),
      },
    };

    mockConnection = {
      query: jest.fn(),
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should handle book details collection and add book to the database", async () => {
    const mockUserResponse = { content: "Title; Author; 2022; 5" };

    const userEventsMap = new Map();
    userEventsMap.set("test", { messageCreate: true });

    const collector = new EventEmitter();
    collector.stop = jest.fn();

    mockMessage.channel.createMessageCollector.mockReturnValueOnce(collector);

    jest.spyOn(collector, "on").mockImplementation((event, callback) => {
      if (event === "collect") {
        callback(mockUserResponse);
      }
    });

    mockConnection.beginTransaction.mockImplementation((callback) => {
      callback(null);
    });
    mockConnection.query.mockResolvedValueOnce([{ insertId: 5 }]);
    mockConnection.commit.mockResolvedValue();

    await addBook(mockMessage, mockConnection, userEventsMap);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.BOOK_DETAILS_PROMPT_MESSAGE,
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.ADD_BOOK_DETAILS_RECEIVED_MESSAGE,
    );
  });

  test("should handle parsing errors during book details collection", async () => {
    const mockUserResponse = {
      content: "Title; Author; 2022; invalidQuantity",
    };
    const userEventsMap = new Map();
    userEventsMap.set("test", { messageCreate: true });
    const collector = new EventEmitter();
    collector.stop = jest.fn();

    mockMessage.channel.createMessageCollector.mockReturnValueOnce(collector);

    jest.spyOn(collector, "on").mockImplementation((event, callback) => {
      if (event === "collect") {
        callback(mockUserResponse);
      }
    });

    await addBook(mockMessage, mockConnection, userEventsMap);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.INVALID_DETAILS_MESSAGE,
    );
  });
});
describe("deleteBook function", () => {
  let mockMessage;
  let mockConnection;
  let mockBookMap;
  let mockClient;
  let mockMessageCreateHandler;

  beforeEach(() => {
    mockMessage = {
      author: { id: "test" },
      reply: jest.fn(),
      channel: {
        createMessageCollector: jest.fn(),
      },
    };

    mockConnection = {
      query: jest.fn(),
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
    };

    mockBookMap = new Map();
    mockBookMap.set(1, { title: "Book 1", quantity_available: 5 });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should handle book deletion", async () => {
    const mockUserResponse = { content: "1; 2" };
    const userEventsMap = new Map();
    userEventsMap.set("test", { messageCreate: true });

    const collector = new EventEmitter();
    collector.stop = jest.fn();

    mockMessage.channel.createMessageCollector.mockReturnValueOnce(collector);

    jest.spyOn(collector, "on").mockImplementation((event, callback) => {
      if (event === "collect") {
        callback(mockUserResponse);
      }
    });

    await deleteBook(mockMessage, mockConnection, mockBookMap, userEventsMap);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.DELETE_BOOK_PROMPT_MESSAGE,
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.DELETE_BOOK_DETAILS_RECEIVED_MESSAGE,
    );
  });

  test("should handle parsing errors during book deletion", async () => {
    const mockUserResponse = { content: "invalidID; invalidQuantity" };
    const userEventsMap = new Map();
    userEventsMap.set("test", { messageCreate: true });
    const collector = new EventEmitter();
    collector.stop = jest.fn();

    mockMessage.channel.createMessageCollector.mockReturnValueOnce(collector);

    jest.spyOn(collector, "on").mockImplementation((event, callback) => {
      if (event === "collect") {
        callback(mockUserResponse);
      }
    });

    await deleteBook(mockMessage, mockConnection, mockBookMap, userEventsMap);
    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.INVALID_DELETE_DETAILS_MESSAGE,
    );
  });
});

describe("help function", () => {
  let mockMessage;

  beforeEach(() => {
    mockMessage = {
      reply: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should send help message for admin", () => {
    const isAdmin = true;

    help(mockMessage, isAdmin);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining("Admin Commands"),
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining("/add-book"),
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining("Available Commands"),
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining("/start"),
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining("/available-books"),
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining("/checkout [Book ID]"),
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining("/my-books"),
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining("/return [Book ID]"),
    );
  });

  test("should send help message for non-admin", () => {
    const isAdmin = false;

    help(mockMessage, isAdmin);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.not.stringContaining("Admin Commands"),
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.not.stringContaining("/add-book"),
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining("Available Commands"),
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining("/start"),
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining("/available-books"),
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining("/checkout [Book ID]"),
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining("/my-books"),
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining("/return [Book ID]"),
    );
  });
});

describe("getLibraryHistory function", () => {
  let mockMessage;
  let mockConnection;

  beforeEach(() => {
    mockMessage = {
      reply: jest.fn(),
    };

    mockConnection = {
      query: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return library history when query is successful", async () => {
    const mockResults = [
      {
        name: "User1",
        title: "Book1",
        checked_out: "2022-01-01",
        returned: "2022-01-10",
      },
      {
        name: "User2",
        title: "Book2",
        checked_out: "2022-02-01",
        returned: "2022-02-10",
      },
    ];

    mockConnection.query.mockImplementationOnce((query, callback) => {
      callback(null, mockResults);
    });

    const result = await getLibraryHistory(mockMessage, mockConnection);

    expect(mockConnection.query).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Function),
    );
    expect(result).toEqual(mockResults);
    expect(mockMessage.reply).not.toHaveBeenCalled();
  });

  test("should handle error and reply with an error message", async () => {
    const mockError = new Error("Database error");

    mockConnection.query.mockImplementationOnce((query, callback) => {
      callback(mockError, null);
    });

    const result = await getLibraryHistory(mockMessage, mockConnection);

    expect(mockConnection.query).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Function),
    );
    expect(result).toBeNull();
    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.ERROR_FETCHING_LIBRARY_HISTORY,
    );
  });
});

describe("updateBook function", () => {
  let mockMessage;
  let mockConnection;
  let mockBooks;
  let mockUserEventsMap;

  beforeEach(() => {
    mockMessage = {
      author: { id: "test" },
      reply: jest.fn(),
      channel: {
        createMessageCollector: jest.fn(),
      },
    };

    mockConnection = {
      query: jest.fn(),
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
    };

    mockBooks = new Map();
    mockBooks.set(1, {
      id: 1,
      title: "Test Book",
      author: "Test Author",
      published_year: 2022,
      quantity_available: 5,
    });

    mockUserEventsMap = new Map();
    mockUserEventsMap.set("test", { messageCreate: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should handle updating book details successfully", async () => {
    const mockUserResponseForCollector = { content: "1" };
    const mockUserResponseForUpdateCollector = {
      content: "New Title; New Author; 2023; 10",
    };
    const collector = new EventEmitter();
    const updateCollector = new EventEmitter();
    collector.stop = jest.fn();
    updateCollector.stop = jest.fn();

    mockMessage.channel.createMessageCollector
      .mockReturnValueOnce(collector)
      .mockReturnValueOnce(updateCollector);

    jest.spyOn(collector, "on").mockImplementation((event, callback) => {
      if (event === "collect") {
        callback(mockUserResponseForCollector);
      }
    });

    jest.spyOn(updateCollector, "on").mockImplementation((event, callback) => {
      if (event === "collect") {
        callback(mockUserResponseForUpdateCollector);
      }
    });
    mockConnection.beginTransaction.mockImplementation((callback) => {
      callback(null);
    });
    mockConnection.query.mockResolvedValueOnce([]);
    mockConnection.commit.mockResolvedValue();

    await updateBook(mockMessage, mockConnection, mockBooks, mockUserEventsMap);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.UPDATE_BOOK_ID_PROMPT_MESSAGE,
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.UPDATE_BOOK_PROMPT_MESSAGE,
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.UPDATE_BOOK_DETAILS_RECEIVED_MESSAGE,
    );
  });

  test("should handle updating book details with invalid book ID", async () => {
    const mockUserResponseForCollector = { content: "99" };
    const collector = new EventEmitter();
    collector.stop = jest.fn();

    mockMessage.channel.createMessageCollector.mockReturnValueOnce(collector);

    jest.spyOn(collector, "on").mockImplementation((event, callback) => {
      if (event === "collect") {
        callback(mockUserResponseForCollector);
      }
    });

    await updateBook(mockMessage, mockConnection, mockBooks, mockUserEventsMap);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.UPDATE_BOOK_ID_PROMPT_MESSAGE,
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.INVALID_BOOK_ID_MESSAGE,
    );
  });

  test("should handle updating book details with invalid update details", async () => {
    const mockUserResponseForCollector = { content: "1" };
    const mockUserResponseForUpdateCollector = {
      content: "New Title; New Author; 2023; invalidQuantity",
    };
    const collector = new EventEmitter();
    const updateCollector = new EventEmitter();
    collector.stop = jest.fn();
    updateCollector.stop = jest.fn();

    mockMessage.channel.createMessageCollector
      .mockReturnValueOnce(collector)
      .mockReturnValueOnce(updateCollector);

    jest.spyOn(collector, "on").mockImplementation((event, callback) => {
      if (event === "collect") {
        callback(mockUserResponseForCollector);
      }
    });

    jest.spyOn(updateCollector, "on").mockImplementation((event, callback) => {
      if (event === "collect") {
        callback(mockUserResponseForUpdateCollector);
      }
    });

    await updateBook(mockMessage, mockConnection, mockBooks, mockUserEventsMap);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.UPDATE_BOOK_PROMPT_MESSAGE,
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.INVALID_UPDATE_DETAILS_MESSAGE,
    );
  });
});

describe("requestBook function", () => {
  let mockMessage;
  let mockConnection;
  let mockUserEventsMap;
  let mockCollector;

  beforeEach(() => {
    mockMessage = {
      author: { id: "test" },
      reply: jest.fn(),
      channel: {
        createMessageCollector: jest.fn(),
      },
    };

    mockConnection = {
      query: jest.fn(),
      rollback: jest.fn(),
      beginTransaction: jest.fn(),
      commit: jest.fn(),
    };

    mockUserEventsMap = new Map();
    mockUserEventsMap.set("test", { messageCreate: true });

    mockCollector = {
      on: jest.fn(),
      stop: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should handle requesting a new book successfully", async () => {
    const mockUserResponse = { content: "Sample Book Title" };
    const collector = new EventEmitter();
    collector.stop = jest.fn();
    mockMessage.channel.createMessageCollector.mockReturnValueOnce(collector);
    jest.spyOn(collector, "on").mockImplementation((event, callback) => {
      if (event === "collect") {
        callback(mockUserResponse);
      }
    });

    await requestBook(null, mockMessage, mockConnection, mockUserEventsMap);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      "Enter the title or link of the book",
    );
  });

  test("should throw error with message unexpected request new book", async () => {
    const mockUserResponse = { content: "exit" };
    const collector = new EventEmitter();
    collector.stop = jest.fn();
    mockMessage.channel.createMessageCollector.mockReturnValueOnce(collector);

    jest.spyOn(collector, "on").mockImplementation((event, callback) => {
      if (event === "collect") {
        callback(mockUserResponse);
      }
    });

    await requestBook(null, mockMessage, mockConnection, mockUserEventsMap);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.EXIT_REQUEST_BOOK_MESSAGE,
    );
  });
});

describe("processBookRequest function", () => {
  let mockMessage;
  let mockConnection;
  let mockBookRequests;
  let mockUserEventsMap;
  let mockClient;

  beforeEach(() => {
    mockMessage = {
      author: { id: "test" },
      reply: jest.fn(),
      channel: {
        createMessageCollector: jest.fn(),
      },
    };

    mockConnection = {
      query: jest.fn(),
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
    };

    mockBookRequests = [
      { id: 1, user_id: "user1", description: "Book 1 Request" },
      { id: 2, user_id: "user2", description: "Book 2 Request" },
    ];

    mockUserEventsMap = new Map();
    mockUserEventsMap.set("test", { messageCreate: true });

    mockClient = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should handle book request approval", async () => {
    const mockUserResponse = { content: "/approve 1" };
    const collector = new EventEmitter();
    collector.stop = jest.fn();

    mockMessage.channel.createMessageCollector.mockReturnValueOnce(collector);

    jest.spyOn(collector, "on").mockImplementation((event, callback) => {
      if (event === "collect") {
        callback(mockUserResponse);
      }
    });
    mockConnection.beginTransaction.mockImplementationOnce((callback) => {
      callback(null);
    });
    mockConnection.query.mockImplementationOnce((query, callback) => {
      callback(null, mockBookRequests);
    });
    mockConnection.commit.mockImplementationOnce((callback) => {
      callback(null);
    });
    await processBookRequest(
      mockClient,
      mockMessage,
      mockConnection,
      mockBookRequests,
      mockUserEventsMap,
    );

    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.CHANGE_BOOK_REQUEST_STATUS_MESSAGE,
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.CHANGE_OF_STATUS_RECEIVED,
    );
  });

  test("should handle book request decline", async () => {
    const mockUserResponse = { content: "/decline 2" };
    const collector = new EventEmitter();
    collector.stop = jest.fn();

    mockMessage.channel.createMessageCollector.mockReturnValueOnce(collector);

    jest.spyOn(collector, "on").mockImplementation((event, callback) => {
      if (event === "collect") {
        callback(mockUserResponse);
      }
    });
    mockConnection.beginTransaction.mockImplementationOnce((callback) => {
      callback(null);
    });
    mockConnection.query.mockImplementationOnce((query, callback) => {
      callback(null, mockBookRequests);
    });
    mockConnection.commit.mockImplementationOnce((callback) => {
      callback(null);
    });
    await processBookRequest(
      mockClient,
      mockMessage,
      mockConnection,
      mockBookRequests,
      mockUserEventsMap,
    );

    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.CHANGE_BOOK_REQUEST_STATUS_MESSAGE,
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.CHANGE_OF_STATUS_RECEIVED,
    );
  });

  test("should handle invalid input format", async () => {
    const mockUserResponse = { content: "invalidInput" };
    const collector = new EventEmitter();
    collector.stop = jest.fn();

    mockMessage.channel.createMessageCollector.mockReturnValueOnce(collector);

    jest.spyOn(collector, "on").mockImplementation((event, callback) => {
      if (event === "collect") {
        callback(mockUserResponse);
      }
    });

    await processBookRequest(
      mockClient,
      mockMessage,
      mockConnection,
      mockBookRequests,
      mockUserEventsMap,
    );

    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.CHANGE_BOOK_REQUEST_STATUS_MESSAGE,
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.INVALID_CHANGE_OF_APPROVAL_DETAILS_MESSAGE,
    );
    expect(mockMessage.reply).toHaveBeenCalledTimes(2);
  });

  test("should handle nonexistent book request", async () => {
    const mockUserResponse = { content: "/approve 3" };
    const collector = new EventEmitter();
    collector.stop = jest.fn();

    mockMessage.channel.createMessageCollector.mockReturnValueOnce(collector);

    jest.spyOn(collector, "on").mockImplementation((event, callback) => {
      if (event === "collect") {
        callback(mockUserResponse);
      }
    });

    await processBookRequest(
      mockClient,
      mockMessage,
      mockConnection,
      mockBookRequests,
      mockUserEventsMap,
    );

    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.CHANGE_BOOK_REQUEST_STATUS_MESSAGE,
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.INVALID_REQUEST_ID_MESSAGE,
    );
    expect(mockMessage.reply).toHaveBeenCalledTimes(2);
  });

  test("should handle collector 'end' event", async () => {
    const mockUserResponse = { content: "exit" };
    const collector = new EventEmitter();
    collector.stop = jest.fn();

    mockMessage.channel.createMessageCollector.mockReturnValueOnce(collector);

    jest.spyOn(collector, "on").mockImplementation((event, callback) => {
      if (event === "collect") {
        callback(mockUserResponse);
      } else if (event === "end") {
        callback();
      }
    });

    await processBookRequest(
      mockClient,
      mockMessage,
      mockConnection,
      mockBookRequests,
      mockUserEventsMap,
    );

    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.CHANGE_BOOK_REQUEST_STATUS_MESSAGE,
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.EXIT_VIEW_BOOK_MESSAGE,
    );
    expect(mockMessage.reply).toHaveBeenCalledTimes(2);
  });
});

describe("processCheckoutRequest function", () => {
  let mockMessage;
  let mockConnection;
  let mockCheckoutRequests;
  let mockUserEventsMap;
  let mockClient;

  beforeEach(() => {
    mockMessage = {
      author: { id: "test" },
      reply: jest.fn(),
      channel: {
        createMessageCollector: jest.fn(),
      },
    };

    mockConnection = {
      query: jest.fn(),
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
    };

    mockCheckoutRequests = [
      { id: 1, user_id: "user1", description: "Checkout Request 1" },
      { id: 2, user_id: "user2", description: "Checkout Request 2" },
    ];

    mockUserEventsMap = new Map();
    mockUserEventsMap.set("test", { messageCreate: true });

    mockClient = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should handle invalid input format", async () => {
    const mockUserResponse = { content: "invalidInput" };
    const collector = new EventEmitter();
    collector.stop = jest.fn();

    mockMessage.channel.createMessageCollector.mockReturnValueOnce(collector);

    jest.spyOn(collector, "on").mockImplementation((event, callback) => {
      if (event === "collect") {
        callback(mockUserResponse);
      }
    });

    await processCheckoutRequest(
      mockClient,
      mockMessage,
      mockConnection,
      mockCheckoutRequests,
      mockUserEventsMap,
    );

    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.CHANGE_CHECKOUT_REQUEST_STATUS_MESSAGE,
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.INVALID_CHANGE_OF_APPROVAL_FOR_CHECKOUT_DETAILS_MESSAGE,
    );
    expect(collector.stop).toHaveBeenCalled();
  });

  test("should handle nonexistent checkout request", async () => {
    const mockUserResponse = { content: "/approve 3" };
    const collector = new EventEmitter();
    collector.stop = jest.fn();

    mockMessage.channel.createMessageCollector.mockReturnValueOnce(collector);

    jest.spyOn(collector, "on").mockImplementation((event, callback) => {
      if (event === "collect") {
        callback(mockUserResponse);
      }
    });

    await processCheckoutRequest(
      mockClient,
      mockMessage,
      mockConnection,
      mockCheckoutRequests,
      mockUserEventsMap,
    );

    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.CHANGE_CHECKOUT_REQUEST_STATUS_MESSAGE,
    );
    expect(mockMessage.reply).toHaveBeenCalledWith(
      constants.INVALID_CHECKOUT_REQUEST_ID_MESSAGE,
    );
    expect(collector.stop).toHaveBeenCalled();
  });
});

describe("searchBooks function", () => {
  let mockMessage;
  let mockConnection;
  let mockUserEventsMap;
  let mockCollector;
  let mockBookMap;

  beforeEach(() => {
    mockMessage = {
      author: { id: "test" },
      reply: jest.fn(),
      channel: {
        createMessageCollector: jest.fn(),
      },
    };

    mockConnection = {
      query: jest.fn(),
    };

    mockUserEventsMap = new Map();
    mockUserEventsMap.set("test", { messageCreate: true });

    mockCollector = new EventEmitter();
    mockCollector.stop = jest.fn();

    mockBookMap = new Map();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should handle exit command and return empty array", async () => {
    const mockUserResponse = { content: "exit" };
    const collector = new EventEmitter();
    collector.stop = jest.fn();
    mockMessage.channel.createMessageCollector.mockReturnValueOnce(collector);

    jest.spyOn(collector, "on").mockImplementation((event, callback) => {
      if (event === "collect") {
        callback(mockUserResponse);
      }
    });

    const booksPromise = searchBooks(mockMessage, mockConnection, mockUserEventsMap, mockBookMap);

    await booksPromise;

    expect(mockMessage.reply).toHaveBeenCalledWith(constants.EXIT_SEARCH_BOOK_MESSAGE);
    expect(mockBookMap.size).toBe(0);
  });
});

describe("processReturnRequest function", () => {
  let mockMessage;
  let mockConnection;
  let mockReturnRequests;
  let mockUserEventsMap;
  let mockClient;

  beforeEach(() => {
    mockMessage = {
      author: { id: "test" },
      reply: jest.fn(),
      channel: {
        createMessageCollector: jest.fn(),
      },
    };

    mockConnection = {
      query: jest.fn(),
    };

    mockReturnRequests = [
      { id: 1, user_id: "user1", description: "Return Request 1" },
      { id: 2, user_id: "user2", description: "Return Request 2" },
    ];

    mockUserEventsMap = new Map();
    mockUserEventsMap.set("test", { messageCreate: true });

    mockClient = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should handle exit command", async () => {
    const mockUserResponse = { content: "exit" };
    const collector = new EventEmitter();
    collector.stop = jest.fn();

    mockMessage.channel.createMessageCollector.mockReturnValueOnce(collector);

    jest.spyOn(collector, "on").mockImplementation((event, callback) => {
      if (event === "collect") {
        callback(mockUserResponse);
      }
    });

    await processReturnRequest(
      mockClient,
      mockMessage,
      mockConnection,
      mockReturnRequests,
      mockUserEventsMap,
    );

    expect(mockMessage.reply).toHaveBeenCalledWith(constants.EXIT_VIEW_RETURN_MESSAGE);
    expect(collector.stop).toHaveBeenCalled();
  });

  test("should handle invalid input format", async () => {
    const mockUserResponse = { content: "invalidInput" };
    const collector = new EventEmitter();
    collector.stop = jest.fn();

    mockMessage.channel.createMessageCollector.mockReturnValueOnce(collector);

    jest.spyOn(collector, "on").mockImplementation((event, callback) => {
      if (event === "collect") {
        callback(mockUserResponse);
      }
    });

    await processReturnRequest(
      mockClient,
      mockMessage,
      mockConnection,
      mockReturnRequests,
      mockUserEventsMap,
    );

    expect(mockMessage.reply).toHaveBeenCalledWith(constants.CHANGE_RETURN_REQUEST_STATUS_MESSAGE);
    expect(mockMessage.reply).toHaveBeenCalledWith(constants.INVALID_CHANGE_OF_APPROVAL_FOR_RETURN_DETAILS_MESSAGE);
    expect(collector.stop).toHaveBeenCalled();
  });

  test("should handle nonexistent return request", async () => {
    const mockUserResponse = { content: "/approve 3" };
    const collector = new EventEmitter();
    collector.stop = jest.fn();

    mockMessage.channel.createMessageCollector.mockReturnValueOnce(collector);

    jest.spyOn(collector, "on").mockImplementation((event, callback) => {
      if (event === "collect") {
        callback(mockUserResponse);
      }
    });

    await processReturnRequest(
      mockClient,
      mockMessage,
      mockConnection,
      mockReturnRequests,
      mockUserEventsMap,
    );

    expect(mockMessage.reply).toHaveBeenCalledWith(constants.CHANGE_RETURN_REQUEST_STATUS_MESSAGE);
    expect(mockMessage.reply).toHaveBeenCalledWith(constants.INVALID_RETURN_REQUEST_ID_MESSAGE);
    expect(collector.stop).toHaveBeenCalled();
  });
});
