const menuController = require("../../src/controllers/menuController");
const commandsController = require("../../src/controllers/commandsController");
const validateUser = require("../../src/service/validateUser");
const constants = require("../../src/constants/constant");
const display = require("../../src/utils/display");

describe("menu", () => {
  let mockMessage;
  let mockConnection;
  let bookMap;
  let checkedOutBooks;
  beforeEach(() => {
    mockMessage = {
      reply: jest.fn(),
      author: { username: "TestUser", bot: false },
      content: "",
    };

    mockConnection = {
      query: jest.fn(),
      rollback: jest.fn(),
      beginTransaction: jest.fn(),
      commit: jest.fn(),
    };
    bookMap = new Map();
    checkedOutBooks = new Map();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("On /menu start method should be invoked", async () => {
    const command = "/menu";
    commandsController.start = jest.fn();
    validateUser.checkForExistingUser = jest.fn();
    mockMessage.content = command;
    display.welcomeMessage = jest.fn();
    validateUser.checkForExistingUser.mockResolvedValue(true);

    let dependencies = {
      message: mockMessage,
      commandsController,
      connection: mockConnection,
      validateUser,
      bookMap,
      display,
    };

    commandsController.start.mockImplementationOnce((message, connection) => {
      return Promise.resolve([]);
    });
    await menuController.menu(dependencies);

    expect(commandsController.start).toHaveBeenCalledWith(
      mockMessage,
      mockConnection,
    );
    expect(display.welcomeMessage).toHaveBeenCalledWith(
      mockMessage,
      validateUser,
    );
  });

  test("On /available-books display availableBooks method should be invoked", async () => {
    const command = "/available-books";

    commandsController.getAvailableBooks = jest.fn();
    commandsController.getAvailableBooks.mockImplementationOnce(
      (message, connection, bookMap) => {
        return Promise.resolve([]);
      },
    );

    display.availableBooks = jest.fn();
    mockMessage.content = command;

    let dependencies = {
      message: mockMessage,
      commandsController,
      connection: mockConnection,
      validateUser,
      bookMap,
      display,
    };

    await menuController.menu(dependencies);
    expect(commandsController.getAvailableBooks).toHaveBeenCalledWith(
      mockMessage,
      mockConnection,
      bookMap,
    );
    expect(display.availableBooks).toHaveBeenCalled();
  });

  test("On /available-books display availableBooks method should not be invoked", async () => {
    const command = "/available-books";

    commandsController.getAvailableBooks = jest.fn();
    commandsController.getAvailableBooks.mockImplementationOnce(
      (message, connection, bookMap) => {
        return Promise.resolve(null);
      },
    );

    display.availableBooks = jest.fn();
    mockMessage.content = command;

    let dependencies = {
      message: mockMessage,
      commandsController,
      connection: mockConnection,
      validateUser,
      bookMap,
      display,
    };

    await menuController.menu(dependencies);
    expect(commandsController.getAvailableBooks).toHaveBeenCalledWith(
      mockMessage,
      mockConnection,
      bookMap,
    );
    expect(display.availableBooks).not.toHaveBeenCalled();
  });

  test("On /my-books getUserBooks method should be invoked", async () => {
    commandsController.getUserBooks = jest.fn();
    commandsController.getUserBooks.mockImplementationOnce(
      (message, connection, checkedOutBooks) => {
        return Promise.resolve([]);
      },
    );
    display.userBooks = jest.fn();

    const command = "/my-books";
    mockMessage.content = command;

    let dependencies = {
      message: mockMessage,
      commandsController,
      connection: mockConnection,
      validateUser,
      checkedOutBooks,
      display,
    };

    await menuController.menu(dependencies);

    expect(commandsController.getUserBooks).toHaveBeenCalledWith(
      mockMessage,
      mockConnection,
      checkedOutBooks,
    );
    expect(display.userBooks).toHaveBeenCalled();
  });

  test("On /my-books getUserBooks method should not be invoked", async () => {
    commandsController.getUserBooks = jest.fn();
    commandsController.getUserBooks.mockImplementationOnce(
      (message, connection, checkedOutBooks) => {
        return Promise.resolve(null);
      },
    );
    display.userBooks = jest.fn();

    const command = "/my-books";
    mockMessage.content = command;

    let dependencies = {
      message: mockMessage,
      commandsController,
      connection: mockConnection,
      validateUser,
      checkedOutBooks,
      display,
    };

    await menuController.menu(dependencies);

    expect(commandsController.getUserBooks).toHaveBeenCalledWith(
      mockMessage,
      mockConnection,
      checkedOutBooks,
    );
    expect(display.userBooks).not.toHaveBeenCalled();
  });

  test("should reply with GET_AVAILABLE_BEFORE_CHECKOUT_MESSAGE if bookMap is empty", async () => {
    const command = "/checkout 1";
    mockMessage.content = command;
    commandsController.checkoutBook = jest.fn();

    await menuController.menu({
      message: mockMessage,
      commandsController,
      connection: mockConnection,
      validateUser,
      bookMap,
    });

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining(constants.GET_AVAILABLE_BEFORE_CHECKOUT_MESSAGE),
    );
    expect(commandsController.checkoutBook).not.toHaveBeenCalled();
  });

  test("should invoke checkoutBook if bookMap is not empty and command matches checkoutPattern", async () => {
    const mockCommand = "/checkout 1";
    mockMessage.content = mockCommand;
    commandsController.reut = jest.fn();

    bookMap.set(1, {
      id: 1,
      title: "Sample Book",
      author: "Sample Author",
      published_year: 2022,
      quantity_available: 5,
    });

    await menuController.menu({
      message: mockMessage,
      commandsController,
      connection: mockConnection,
      validateUser,
      bookMap,
    });

    expect(mockMessage.reply).not.toHaveBeenCalledWith(
      expect.stringContaining(constants.GET_AVAILABLE_BEFORE_CHECKOUT_MESSAGE),
    );
    expect(commandsController.checkoutBook).toHaveBeenCalled()
  });

  test("should reply with GET_AVAILABLE_BEFORE_RETURN_MESSAGE if checkedOutBooks is empty", async () => {
    const command = "/return 1";
    mockMessage.content = command;
    commandsController.returnBook = jest.fn();

    await menuController.menu({
      message: mockMessage,
      commandsController,
      connection: mockConnection,
      validateUser,
      checkedOutBooks,
    });

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining(constants.GET_AVAILABLE_BEFORE_RETURN_MESSAGE),
    );
    expect(commandsController.returnBook).not.toHaveBeenCalled();
  });

  test("should invoke returnBook if checkedOutBooks is not empty and command matches returnPattern", async () => {
    const mockCommand = "/return 1";
    const client = {}
    mockMessage.content = mockCommand;
    commandsController.returnBook = jest.fn();

    checkedOutBooks.set(1, { id: 1, title: "Sample Book" });

    await menuController.menu({
      message: mockMessage,
      client,
      commandsController,
      connection: mockConnection,
      validateUser,
      checkedOutBooks,
    });

    expect(mockMessage.reply).not.toHaveBeenCalledWith(
      expect.stringContaining(constants.GET_AVAILABLE_BEFORE_RETURN_MESSAGE),
    );
    expect(commandsController.returnBook).toHaveBeenCalledWith(
      mockMessage,
      client,
      mockConnection,
      checkedOutBooks,
    );
  });
  test("should invoke addBook for admin with command /add-book", async () => {
    const mockCommand = "/add-book";
    mockMessage.content = mockCommand;
    commandsController.addBook = jest.fn();
    const checkedOutBooks = new Map();
    const userEventsMap = new Map();
    const validateUser = {
      isAdmin: jest.fn().mockReturnValue(true),
      checkForExistingUser: jest.fn().mockReturnValue(true),
    };

    await menuController.menu({
      message: mockMessage,
      commandsController,
      connection: mockConnection,
      validateUser,
      bookMap,
      checkedOutBooks,
      userEventsMap,
    });

    expect(validateUser.isAdmin).toHaveBeenCalledWith(mockMessage);
    expect(commandsController.addBook).toHaveBeenCalledWith(
      mockMessage,
      mockConnection,
      userEventsMap,
    );
  });

  test("should not invoke addBook for non-admin with command /add-book", async () => {
    const mockCommand = "/add-book";
    mockMessage.content = mockCommand;
    commandsController.addBook = jest.fn();
    const checkedOutBooks = new Map();
    const messageCreateHandler = jest.fn();
    const client = {};
    const validateUser = {
      isAdmin: jest.fn().mockReturnValue(false),
      checkForExistingUser: jest.fn().mockReturnValue(true),
    };

    await menuController.menu({
      message: mockMessage,
      commandsController,
      connection: mockConnection,
      validateUser,
      bookMap,
      checkedOutBooks,
      messageCreateHandler,
      client,
    });

    expect(validateUser.isAdmin).toHaveBeenCalledWith(mockMessage);
    expect(commandsController.addBook).not.toHaveBeenCalledWith(
      mockMessage,
      mockConnection,
      messageCreateHandler,
      client,
    );
  });
  test("should call helpCommand when command is !help", async () => {
    const mockCommand = "!help";
    mockMessage.content = mockCommand;
    commandsController.help = jest.fn();
    const checkedOutBooks = new Map();
    const messageCreateHandler = jest.fn();
    const client = {};
    const validateUser = {
      isAdmin: jest.fn().mockReturnValue(true),
      checkForExistingUser: jest.fn().mockReturnValue(true),
    };
    await menuController.menu({
      message: mockMessage,
      commandsController,
      connection: mockConnection,
      validateUser,
      bookMap,
      checkedOutBooks,
      messageCreateHandler,
      client,
    });

    expect(commandsController.help).toHaveBeenCalledWith(mockMessage, true);
  });

  test("should invoke deleteBook for admin with command /delete-book", async () => {
    const mockCommand = "/delete-book";
    mockMessage.content = mockCommand;
    commandsController.deleteBook = jest.fn();
    const checkedOutBooks = new Map();
    const userEventsMap = new Map();
    display.availableBooksWithQuantity = jest.fn();
    const validateUser = {
      isAdmin: jest.fn().mockReturnValue(true),
      checkForExistingUser: jest.fn().mockReturnValue(true),
    };

    commandsController.getAvailableBooks.mockImplementationOnce(
      (message, connection, checkedOutBooks) => {
        return Promise.resolve([]);
      },
    );

    await menuController.menu({
      message: mockMessage,
      commandsController,
      connection: mockConnection,
      validateUser,
      bookMap,
      checkedOutBooks,
      userEventsMap,
      display,
    });

    expect(validateUser.isAdmin).toHaveBeenCalledWith(mockMessage);
    expect(display.availableBooksWithQuantity).toHaveBeenCalled();
    expect(commandsController.deleteBook).toHaveBeenCalledWith(
      mockMessage,
      mockConnection,
      bookMap,
      userEventsMap,
    );
  });

  test("should not invoke deleteBook for non-admin with command /delete-book", async () => {
    const mockCommand = "/delete-book";
    mockMessage.content = mockCommand;
    commandsController.deleteBook = jest.fn();
    const checkedOutBooks = new Map();
    const messageCreateHandler = jest.fn();
    const client = {};
    const validateUser = {
      isAdmin: jest.fn().mockReturnValue(false),
      checkForExistingUser: jest.fn().mockReturnValue(true),
    };

    await menuController.menu({
      message: mockMessage,
      commandsController,
      connection: mockConnection,
      validateUser,
      bookMap,
      checkedOutBooks,
      messageCreateHandler,
      client,
    });

    expect(validateUser.isAdmin).toHaveBeenCalledWith(mockMessage);
    expect(commandsController.deleteBook).not.toHaveBeenCalledWith(
      mockMessage,
      mockConnection,
      bookMap,
      messageCreateHandler,
      client,
    );
  });

  test("On /library-history, libraryHistory method should be invoked", async () => {
    const command = "/library-history";
    display.libraryHistory = jest.fn();
    mockMessage.content = command;
    const validateUser = {
      isAdmin: jest.fn().mockReturnValue(true),
      checkForExistingUser: jest.fn().mockReturnValue(true),
    };
    commandsController.getLibraryHistory = jest.fn();
    commandsController.getLibraryHistory.mockImplementationOnce(
      (message, connection) => {
        return Promise.resolve([]);
      },
    );

    let dependencies = {
      message: mockMessage,
      commandsController,
      connection: mockConnection,
      validateUser,
      display,
    };

    await menuController.menu(dependencies);
    expect(commandsController.getLibraryHistory).toHaveBeenCalledWith(
      mockMessage,
      mockConnection,
    );
    expect(display.libraryHistory).toHaveBeenCalled();
  });

  test("On /library-history, libraryHistory method should not be invoked", async () => {
    const command = "/library-history";
    display.libraryHistory = jest.fn();
    mockMessage.content = command;
    const validateUser = {
      isAdmin: jest.fn().mockReturnValue(true),
      checkForExistingUser: jest.fn().mockReturnValue(true),
    };
    commandsController.getLibraryHistory = jest.fn();
    commandsController.getLibraryHistory.mockImplementationOnce(
      (message, connection) => {
        return Promise.resolve(null);
      },
    );

    let dependencies = {
      message: mockMessage,
      commandsController,
      connection: mockConnection,
      validateUser,
      display,
    };

    await menuController.menu(dependencies);
    expect(commandsController.getLibraryHistory).toHaveBeenCalledWith(
      mockMessage,
      mockConnection,
    );
    expect(display.libraryHistory).not.toHaveBeenCalled();
  });

  test("On /update-book, updateBook method should be invoked", async () => {
    const command = "/update-book";
    display.books = jest.fn();
    mockMessage.content = command;
    const validateUser = {
      isAdmin: jest.fn().mockReturnValue(true),
      checkForExistingUser: jest.fn().mockReturnValue(true),
    };
    commandsController.getAvailableBooks = jest.fn();
    commandsController.getAvailableBooks.mockImplementationOnce(
      (message, connection, bookMap) => {
        return Promise.resolve([]);
      },
    );
    commandsController.updateBook = jest.fn();

    let dependencies = {
      message: mockMessage,
      commandsController,
      connection: mockConnection,
      validateUser,
      display,
    };

    await menuController.menu(dependencies);
    expect(commandsController.updateBook).toHaveBeenCalled();
  });

  test("On /update-book, updateBook method should not be invoked", async () => {
    const command = "/update-book";
    display.books = jest.fn();
    mockMessage.content = command;
    const validateUser = {
      isAdmin: jest.fn().mockReturnValue(false),
      checkForExistingUser: jest.fn().mockReturnValue(true),
    };
    commandsController.getAvailableBooks = jest.fn();
    commandsController.updateBook = jest.fn();

    let dependencies = {
      message: mockMessage,
      commandsController,
      connection: mockConnection,
      validateUser,
      display,
    };

    await menuController.menu(dependencies);
    expect(commandsController.updateBook).not.toHaveBeenCalled();
  });

  test("On /request-new-book, requestBook method should be invoked", async () => {
    const command = "/request-new-book";
    mockMessage.content = command;

    const userEventsMap = new Map();
    const client = {};
    const validateUser = {
      isAdmin: jest.fn().mockReturnValue(false),
      checkForExistingUser: jest.fn().mockReturnValue(true),
    };

    commandsController.requestBook = jest.fn();

    let dependencies = {
      message: mockMessage,
      commandsController,
      connection: mockConnection,
      validateUser,
      userEventsMap,
      client,
    };

    await menuController.menu(dependencies);
    expect(commandsController.requestBook).toHaveBeenCalledWith(
      client,
      mockMessage,
      mockConnection,
      userEventsMap,
    );
  });

  test("On /view-book-requests, processBookRequest method should not be invoked", async () => {
    const command = "/view-book-requests";
    const userEventsMap = new Map();
    display.newBookRequests = jest.fn();
    mockMessage.content = command;
    const validateUser = {
      isAdmin: jest.fn().mockReturnValue(false),
      checkForExistingUser: jest.fn().mockReturnValue(false),
    };
    commandsController.getNewBookRequests = jest.fn();
    commandsController.processBookRequest = jest.fn();

    let dependencies = {
      message: mockMessage,
      commandsController,
      connection: mockConnection,
      validateUser,
      display,
      userEventsMap,
    };

    await menuController.menu(dependencies);
    expect(commandsController.processBookRequest).not.toHaveBeenCalled();
  });
});
