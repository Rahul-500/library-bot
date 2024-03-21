const constants = require("../../src/constants/constant");
const {
  notifyAdminNewBookRequest,
  notifyUserAboutBookRequest,
  notifyAdminCheckoutRequest,
  notifyUserAboutCheckoutRequest,
  notifyAdminReturnBookRequest,
  notifyUserAboutReturnRequest
} = require("../../src/service/notifier");

describe("notifyAdminNewBookRequest", () => {
  let mockConnection;
  let mockClient;
  let mockUser;
  beforeEach(() => {
    mockConnection = {
      query: jest.fn(),
    };

    mockUser = {
      send: jest.fn(),
    };
    mockClient = {
      users: {
        fetch: jest.fn().mockResolvedValue(mockUser),
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should notify admin and reply with success message", async () => {
    const message = {
      author: {
        username: "TestUser",
      },
      reply: jest.fn(),
    };
    const bookRequest = "Test book request";
    const userIdList = [{ id: "123" }, { id: "456" }];

    mockConnection.query.mockImplementationOnce((query, callback) => {
      callback(null, userIdList);
    });

    await notifyAdminNewBookRequest(
      mockClient,
      message,
      mockConnection,
      bookRequest,
    );

    expect(message.reply).toHaveBeenCalled();
  });

  it("should handle error when userIdList is null", async () => {
    const message = {
      author: {
        username: "TestUser",
      },
      reply: jest.fn(),
    };
    const bookRequest = "Test book request";
    mockConnection.query.mockImplementationOnce((query, callback) => {
      callback(null, null);
    });

    await notifyAdminNewBookRequest(
      mockClient,
      message,
      mockConnection,
      bookRequest,
    );

    expect(mockClient.users.fetch).not.toHaveBeenCalled();
    expect(message.reply).toHaveBeenCalledWith(
      constants.UNEXPECTED_REQUEST_NEW_BOOK_ERROR_MESSAGE,
    );
  });
});

describe("notifyUserAboutBookRequest", () => {
  let mockClient;
  let mockUser;
  const userId = "1234567890";
  const status = "approved";
  const description = "Book Title";

  beforeEach(() => {
    mockUser = {
      send: jest.fn().mockResolvedValue(undefined),
    };
    mockClient = {
      users: {
        fetch: jest.fn().mockResolvedValue(mockUser),
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should send notification to user about book request status", async () => {
    await notifyUserAboutBookRequest(mockClient, userId, status, description);

    expect(mockClient.users.fetch).toHaveBeenCalledWith(userId);
    expect(mockUser.send).toHaveBeenCalledWith(
      `The book \`${description}\` you requested has been marked as \`${status}\``,
    );
  });

  test("should handle error if fetching user fails", async () => {
    mockClient.users.fetch.mockRejectedValue(new Error("Failed to fetch user"));

    await notifyUserAboutBookRequest(mockClient, userId, status, description);

    expect(mockClient.users.fetch).toHaveBeenCalledWith(userId);
    expect(mockUser.send).not.toHaveBeenCalled();
  });
});

describe("notifyAdminCheckoutRequest", () => {
  let mockConnection;
  let mockClient;
  let mockUser;
  beforeEach(() => {
    mockConnection = {
      query: jest.fn(),
    };

    mockUser = {
      send: jest.fn(),
    };
    mockClient = {
      users: {
        fetch: jest.fn().mockResolvedValue(mockUser),
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should notify admin and reply with success message", async () => {
    const message = {
      author: {
        username: "TestUser",
      },
      reply: jest.fn(),
    };
    const book = [
      {
        id: 1,
        title: "Dummy Book 1",
        author: "Dummy Author 1",
        published_year: 2020,
        quantity_available: 5
      }
    ]
    const userIdList = [{ id: "123" }, { id: "456" }];

    mockConnection.query.mockImplementationOnce((query, callback) => {
      callback(null, userIdList);
    });

    await notifyAdminCheckoutRequest(
      message,
      mockConnection,
      mockClient,
      book,
    );

    expect(message.reply).toHaveBeenCalled();
  });

  it("should handle error when userIdList is null", async () => {
    const message = {
      author: {
        username: "TestUser",
      },
      reply: jest.fn(),
    };
    const book = [];
    mockConnection.query.mockImplementationOnce((query, callback) => {
      callback(null, null);
    });

    await notifyAdminCheckoutRequest(
      message,
      mockConnection,
      mockClient,
      book,
    );

    expect(mockClient.users.fetch).not.toHaveBeenCalled();
    expect(message.reply).toHaveBeenCalledWith(
      constants.UNEXPECTED_CHECKOUT_BOOK_ERROR_MESSAGE,
    );
  });
});

describe("notifyUserAboutCheckoutRequest", () => {
  let mockClient;
  let mockUser;

  beforeEach(() => {
    mockUser = {
      send: jest.fn(),
    };
    mockClient = {
      users: {
        fetch: jest.fn().mockResolvedValue(mockUser),
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should notify the user about the checkout request status", async () => {
    const checkoutRequest = {
      user_id: "123",
      title: "Dummy Book 1",
    };
    const status = "Pending";

    await notifyUserAboutCheckoutRequest(mockClient, checkoutRequest, status);

    expect(mockClient.users.fetch).toHaveBeenCalledWith("123");
    expect(mockUser.send).toHaveBeenCalledWith(
      `The book titled \`${checkoutRequest.title}\` that you checked out has been marked as \`${status}\``
    );
  });

  it("should handle errors and not send a message if user fetching fails", async () => {
    const checkoutRequest = {
      user_id: "456",
      title: "Dummy Book 2",
    };
    const status = "Approved";

    mockClient.users.fetch.mockRejectedValue(new Error("Fake error"));

    await notifyUserAboutCheckoutRequest(mockClient, checkoutRequest, status);

    expect(mockClient.users.fetch).toHaveBeenCalledWith("456");
    expect(mockUser.send).not.toHaveBeenCalled();
  });
});

describe("notifyAdminReturnBookRequest", () => {
  let mockConnection;
  let mockClient;
  let mockUser;
  beforeEach(() => {
    mockConnection = {
      query: jest.fn(),
    };

    mockUser = {
      send: jest.fn(),
    };
    mockClient = {
      users: {
        fetch: jest.fn().mockResolvedValue(mockUser),
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should notify admin and reply with success message", async () => {
    const message = {
      author: {
        username: "TestUser",
      },
      reply: jest.fn(),
    };
    const book = [
      {
        id: 1,
        title: "Dummy Book 1",
        author: "Dummy Author 1",
        published_year: 2020,
        quantity_available: 5
      }
    ]
    const userIdList = [{ id: "123" }, { id: "456" }];

    mockConnection.query.mockImplementationOnce((query, callback) => {
      callback(null, userIdList);
    });

    await notifyAdminReturnBookRequest(
      message,
      mockConnection,
      mockClient,
      book,
    );

    expect(message.reply).toHaveBeenCalled();
  });

  it("should handle error when userIdList is null", async () => {
    const message = {
      author: {
        username: "TestUser",
      },
      reply: jest.fn(),
    };
    const book = [];
    mockConnection.query.mockImplementationOnce((query, callback) => {
      callback(null, null);
    });

    await notifyAdminReturnBookRequest(
      message,
      mockConnection,
      mockClient,
      book,
    );

    expect(mockClient.users.fetch).not.toHaveBeenCalled();
    expect(message.reply).toHaveBeenCalledWith(
      constants.UNEXPECTED_RETURN_BOOK_ERROR_MESSAGE,
    );
  });
});

describe("notifyUserAboutReturnRequest", () => {
  let mockClient;
  let mockUser;

  beforeEach(() => {
    mockUser = {
      send: jest.fn(),
    };
    mockClient = {
      users: {
        fetch: jest.fn().mockResolvedValue(mockUser),
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should notify the user about the return request status", async () => {
    const returnRequest = {
      user_id: "123",
      title: "Dummy Book 1",
    };
    const status = "Pending";

    await notifyUserAboutReturnRequest(mockClient, returnRequest, status);

    expect(mockClient.users.fetch).toHaveBeenCalledWith("123");
    expect(mockUser.send).toHaveBeenCalledWith(
      `The book titled \`${returnRequest.title}\` that you initiated return has been marked as \`${status}\``
    );
  });

  it("should handle errors and not send a message if user fetching fails", async () => {
    const returnRequest = {
      user_id: "456",
      title: "Dummy Book 2",
    };
    const status = "Approved";

    mockClient.users.fetch.mockRejectedValue(new Error("Fake error"));

    await notifyUserAboutReturnRequest(mockClient, returnRequest, status);

    expect(mockClient.users.fetch).toHaveBeenCalledWith("456");
    expect(mockUser.send).not.toHaveBeenCalled();
  });
});