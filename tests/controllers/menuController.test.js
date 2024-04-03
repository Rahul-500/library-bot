const menuController = require("../../src/controllers/menuController");
const constants = require("../../src/constants/constant");
const display = require("../../src/utils/display")
const validateUser = require("../../src/middleware/validateUser");
const { availableBooks } = require("../../src/controllers/menuoptions/availableBooks");
const { checkoutBook } = require("../../src/controllers/menuoptions/checkoutBook");
const { myBooks } = require("../../src/controllers/menuoptions/myBooks");
const { returnRequests } = require("../../src/controllers/menuoptions/returnRequests");
const { search } = require("../../src/controllers/menuoptions/search");
const { returnBook } = require("../../src/controllers/menuoptions/returnBook");
const { requestBook } = require("../../src/controllers/menuoptions/requestBook");
const { addBook } = require("../../src/controllers/menuoptions/addBook");
const { updateBook } = require("../../src/controllers/menuoptions/updateBook");
const { bookRequests } = require("../../src/controllers/menuoptions/bookRequests");
const { checkoutRequests } = require("../../src/controllers/menuoptions/checkoutRequests");
const { deleteBook } = require("../../src/controllers/menuoptions/deleteBook");
const { libraryHistory } = require("../../src/controllers/menuoptions/libraryHistory");
const { help } = require("../../src/controllers/menuoptions/help");

jest.mock("../../src/controllers/menuoptions/bookRequests", () => ({
  bookRequests: jest.fn(),
}));
jest.mock("../../src/controllers/menuoptions/checkoutRequests", () => ({
  checkoutRequests: jest.fn(),
}));
jest.mock("../../src/controllers/menuoptions/deleteBook", () => ({
  deleteBook: jest.fn(),
}));
jest.mock("../../src/controllers/menuoptions/libraryHistory", () => ({
  libraryHistory: jest.fn(),
}));
jest.mock("../../src/controllers/menuoptions/help", () => ({
  help: jest.fn(),
}));
jest.mock("../../src/controllers/menuoptions/returnBook", () => ({
  returnBook: jest.fn(),
}));
jest.mock("../../src/controllers/menuoptions/requestBook", () => ({
  requestBook: jest.fn(),
}));
jest.mock("../../src/controllers/menuoptions/addBook", () => ({
  addBook: jest.fn(),
}));
jest.mock("../../src/controllers/menuoptions/updateBook", () => ({
  updateBook: jest.fn(),
}));

jest.mock("../../src/controllers/menuoptions/search", () => ({
  search: jest.fn(),
}));

jest.mock("../../src/controllers/menuoptions/returnRequests", () => ({
  returnRequests: jest.fn(),
}));

jest.mock("../../src/controllers/menuoptions/myBooks", () => ({
  myBooks: jest.fn(),
}));

jest.mock("../../src/controllers/menuoptions/checkoutBook", () => ({
  checkoutBook: jest.fn(),
}));

jest.mock("../../src/controllers/menuoptions/availableBooks", () => ({
  availableBooks: jest.fn(),
}));

jest.mock("../../src/middleware/validateUser", () => ({
  createUserIfNotExists: jest.fn(),
}));

jest.mock("../../src/utils/display", () => ({
  menu: jest.fn(),
}));

describe('menu function', () => {
  let mockMessage;

  beforeEach(() => {
    mockMessage = { author: { bot: false }, reply: jest.fn() };
    validateUser.createUserIfNotExists.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call menu for command "/menu"', async () => {
    mockMessage.content = "/menu";
    await menuController.menu({ message: mockMessage });
    expect(display.menu).toHaveBeenCalledWith(mockMessage);
  });

  it('should call availableBooks for command "/available-books"', async () => {
    mockMessage.content = "/available-books";
    const mockDependencies = {
      message: mockMessage,
      connection: jest.fn(),
      bookMap: new Map(),
      checkedOutBooks: new Map(),
      userEventsMap: new Map(),
      client: jest.fn(),
    };
    await menuController.menu(mockDependencies);
    expect(availableBooks).toHaveBeenCalledWith(mockMessage, mockDependencies.connection, mockDependencies.bookMap);
  });

  it('should call checkoutBook for commands matching checkout pattern', async () => {
    mockMessage.content = "/checkout 123";
    const mockDependencies = {
      message: mockMessage,
      connection: jest.fn(),
      bookMap: new Map(),
      checkedOutBooks: new Map(),
      userEventsMap: new Map(),
      client: jest.fn(),
    };
    await menuController.menu(mockDependencies);
    expect(checkoutBook).toHaveBeenCalledWith(mockMessage, mockDependencies.connection, mockDependencies.bookMap, mockDependencies.client);
  });

  it('should call myBooks for command "/my-books"', async () => {
    mockMessage.content = "/my-books";
    const mockDependencies = {
      message: mockMessage,
      connection: jest.fn(),
      checkedOutBooks: new Map(),
    };
    await menuController.menu(mockDependencies);
    expect(myBooks).toHaveBeenCalledWith(mockMessage, mockDependencies.connection, mockDependencies.checkedOutBooks);
  });

  it('should call returnRequests for command "/view-return-requests"', async () => {
    mockMessage.content = "/view-return-requests";
    const mockDependencies = {
      message: mockMessage,
      connection: jest.fn(),
      userEventsMap: new Map(),
      client: jest.fn(),
    };
    await menuController.menu(mockDependencies);
    expect(returnRequests).toHaveBeenCalledWith(mockDependencies.client, mockMessage, mockDependencies.connection, mockDependencies.userEventsMap);
  });

  it('should call search for command "/search"', async () => {
    mockMessage.content = "/search";
    const mockDependencies = {
      message: mockMessage,
      connection: jest.fn(),
      userEventsMap: new Map(),
      bookMap: new Map(),
    };
    await menuController.menu(mockDependencies);
    expect(search).toHaveBeenCalledWith(mockMessage, mockDependencies.connection, mockDependencies.userEventsMap, mockDependencies.bookMap);
  });

  it('should call returnBook for commands matching return pattern', async () => {
    mockMessage.content = "/return 123";
    const mockDependencies = {
      message: mockMessage,
      client: jest.fn(),
      connection: jest.fn(),
      checkedOutBooks: new Map(),
    };
    await menuController.menu(mockDependencies);
    expect(returnBook).toHaveBeenCalledWith(mockMessage, mockDependencies.client, mockDependencies.connection, mockDependencies.checkedOutBooks);
  });

  it('should call requestBook for command "/request-new-book"', async () => {
    mockMessage.content = "/request-new-book";
    const mockDependencies = {
      message: mockMessage,
      client: jest.fn(),
      connection: jest.fn(),
      userEventsMap: new Map(),
    };
    await menuController.menu(mockDependencies);
    expect(requestBook).toHaveBeenCalledWith(mockDependencies.client, mockMessage, mockDependencies.connection, mockDependencies.userEventsMap);
  });

  it('should call addBook for command "/add-book"', async () => {
    mockMessage.content = "/add-book";
    const mockDependencies = {
      message: mockMessage,
      connection: jest.fn(),
      userEventsMap: new Map(),
    };
    await menuController.menu(mockDependencies);
    expect(addBook).toHaveBeenCalledWith(mockMessage, mockDependencies.connection, mockDependencies.userEventsMap);
  });

  it('should call updateBook for command "/update-book"', async () => {
    mockMessage.content = "/update-book";
    const mockDependencies = {
      message: mockMessage,
      connection: jest.fn(),
      bookMap: new Map(),
      userEventsMap: new Map(),
    };
    await menuController.menu(mockDependencies);
    expect(updateBook).toHaveBeenCalledWith(mockMessage, mockDependencies.connection, mockDependencies.bookMap, mockDependencies.userEventsMap);
  });
  it('should call bookRequests for command "/view-book-requests"', async () => {
    mockMessage.content = "/view-book-requests";
    const mockDependencies = {
      message: mockMessage,
      client: jest.fn(),
      connection: jest.fn(),
      userEventsMap: new Map(),
    };
    await menuController.menu(mockDependencies);
    expect(bookRequests).toHaveBeenCalledWith(mockDependencies.client, mockMessage, mockDependencies.connection, mockDependencies.userEventsMap);
  });

  it('should call checkoutRequests for command "/view-checkout-requests"', async () => {
    mockMessage.content = "/view-checkout-requests";
    const mockDependencies = {
      message: mockMessage,
      client: jest.fn(),
      connection: jest.fn(),
      userEventsMap: new Map(),
    };
    await menuController.menu(mockDependencies);
    expect(checkoutRequests).toHaveBeenCalledWith(mockDependencies.client, mockMessage, mockDependencies.connection, mockDependencies.userEventsMap);
  });

  it('should call deleteBook for command "/delete-book"', async () => {
    mockMessage.content = "/delete-book";
    const mockDependencies = {
      message: mockMessage,
      connection: jest.fn(),
      bookMap: new Map(),
      userEventsMap: new Map(),
    };
    await menuController.menu(mockDependencies);
    expect(deleteBook).toHaveBeenCalledWith(mockMessage, mockDependencies.connection, mockDependencies.bookMap, mockDependencies.userEventsMap);
  });

  it('should call libraryHistory for command "/library-history"', async () => {
    mockMessage.content = "/library-history";
    const mockDependencies = {
      message: mockMessage,
      connection: jest.fn(),
    };
    await menuController.menu(mockDependencies);
    expect(libraryHistory).toHaveBeenCalledWith(mockMessage, mockDependencies.connection);
  });

  it('should call help for command "!help"', async () => {
    mockMessage.content = "!help";
    const mockDependencies = {
      message: mockMessage,
    };
    await menuController.menu(mockDependencies);
    expect(help).toHaveBeenCalledWith(mockMessage);
  });

  it('should call message.reply with HELP_MESSAGE for unknown commands', async () => {
    mockMessage.content = "/unknown-command";
    await menuController.menu({ message: mockMessage });
    expect(mockMessage.reply).toHaveBeenCalledWith(constants.HELP_MESSAGE);
  });
});
