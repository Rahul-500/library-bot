const { getUserBooks:commandGetUserBooks } = require("../../../src/controllers/commands/getUserBooks");
const constants = require('../../../src/constants/constant');
const { getUserBooksQuery } = require("../../../src/service/queries/getUserBooksQuery");

jest.mock("../../../src/service/queries/getUserBooksQuery")

describe("getUserBooks function", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return user's checked out books if available", async () => {
    const mockMessage = {
      author: { id: "1234567890" },
      reply: jest.fn(),
    };

    const mockConnection = {};
    const mockCheckedOutBooks = new Map();
    const mockBooks = [
      { id: 1, title: "Book 1" },
      { id: 2, title: "Book 2" },
    ];
    getUserBooksQuery.mockResolvedValue(mockBooks);

    const result = await commandGetUserBooks(mockMessage, mockConnection, mockCheckedOutBooks);

    expect(mockMessage.reply).not.toHaveBeenCalledWith(constants.NO_CHECKED_OUT_BOOK_MESSAGE);
    expect(mockCheckedOutBooks.size).toBe(mockBooks.length);
    expect(result).toEqual(mockBooks);
  });

  test("should reply with no checked out books message if user has no checked out books", async () => {
    const mockMessage = {
      author: { id: "1234567890" },
      reply: jest.fn(),
    };

    const mockConnection = {};
    const mockCheckedOutBooks = new Map();
    getUserBooksQuery.mockResolvedValue([]);

    await commandGetUserBooks(mockMessage, mockConnection, mockCheckedOutBooks);

    expect(mockMessage.reply).toHaveBeenCalledWith(constants.NO_CHECKED_OUT_BOOK_MESSAGE);
    expect(mockCheckedOutBooks.size).toBe(0);
  });

  test("should reply with error message if there's an error fetching user's books", async () => {
    const mockMessage = {
      author: { id: "1234567890" },
      reply: jest.fn(),
    };

    const mockConnection = {};
    const mockCheckedOutBooks = new Map();
    getUserBooksQuery.mockRejectedValue(new Error("Error fetching books"));

    await commandGetUserBooks(mockMessage, mockConnection, mockCheckedOutBooks);

    expect(mockMessage.reply).toHaveBeenCalledWith(constants.ERROR_FETCHING_BOOKS);
    expect(mockCheckedOutBooks.size).toBe(0);
  });
});
