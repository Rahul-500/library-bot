const constants = require("../../src/constants/constant");
const {
  notifyAdminNewBookRequest,
  notifyUserAboutBookRequest,
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

    expect(mockUser.send).toHaveBeenCalledWith(
      "Book request by TestUser : Test book request",
    );
    expect(message.reply).toHaveBeenCalledWith(
      constants.SUCCESSFULL_SENDING_TO_ADMIN_MESSAGE,
    );
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
