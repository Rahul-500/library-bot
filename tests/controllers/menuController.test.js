const menuController = require("../../src/controllers/menuController");
const constants = require("../../src/constants/constant");
const commandsController = require("../../src/controllers/commandsController");
const display = require("../../src/utils/display")
const validateAdmin = require("../../src/middleware/validateAdmin")
const validateUser = require("../../src/middleware/validateUser")
const databaseService = require("../../src/service/databaseService");

jest.mock('../../src/controllers/commandsController');
jest.mock("../../src/utils/display");
jest.mock("../../src/service/databaseService");
jest.mock("../../src/middleware/validateUser")
jest.mock("../../src/middleware/validateAdmin")




describe('menu function', () => {
  let mockMessage
  beforeEach(() => {
    mockMessage = { author: { bot: false } };
    validateUser.createUserIfNotExists.mockReturnValue(true)
  })
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should return early if message author is a bot', async () => {
    mockMessage.author.bot = true;
    await menuController.menu({ message: mockMessage });
    expect(validateUser.createUserIfNotExists).not.toHaveBeenCalled();
  });
});

describe('getAvailableBooks', () => {
  let mockMessage
  beforeEach(() => {
    mockMessage = { author: { bot: false } };
    validateUser.createUserIfNotExists.mockReturnValue(true)
  })
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call getAvailableBooks and display available books if command is '/available-books'", async () => {
    mockMessage.content = "/available-books";
    const mockDependencies = {
      message: mockMessage,
      connection: jest.fn(),
      bookMap: new Map(),
      checkedOutBooks: new Map(),
      userEventsMap: new Map(),
      client: jest.fn(),
    };
    const mockBooks = [
      { id: 1, title: "Book 1" },
      { id: 2, title: "Book 2" },
    ]
    commandsController.getAvailableBooks.mockReturnValue(mockBooks);

    await menuController.menu(mockDependencies);

    expect(commandsController.getAvailableBooks).toHaveBeenCalled();
    expect(display.availableBooks).toHaveBeenCalledWith(mockMessage, mockBooks);
  });
})

describe('getUserBooks', () => {
  let mockMessage
  beforeEach(() => {
    mockMessage = { author: { bot: false } };
    validateUser.createUserIfNotExists.mockReturnValue(true)
  })
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should call getUserBooks and display my books if command is '/my-books'", async () => {
    mockMessage.content = "/my-books";
    const mockDependencies = {
      message: mockMessage,
      connection: jest.fn(),
      checkedOutBooks: new Map(),
    };
    const mockBooks = [
      { id: 1, title: "Book 1" },
      { id: 2, title: "Book 2" },
    ]
    commandsController.getUserBooks.mockReturnValue(mockBooks);

    await menuController.menu(mockDependencies);

    expect(commandsController.getUserBooks).toHaveBeenCalled();
    expect(display.userBooks).toHaveBeenCalledWith(mockMessage, mockBooks);
  });
});

describe('checkoutBook', () => {
  let mockMessage;

  beforeEach(() => {
    mockMessage = { author: { bot: false }, reply: jest.fn() };
    validateUser.createUserIfNotExists.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should reply with GET_AVAILABLE_BEFORE_CHECKOUT_MESSAGE if bookMap is empty", async () => {
    mockMessage.content = "/checkout 1";
    const mockDependencies = {
      message: mockMessage,
      connection: jest.fn(),
      bookMap: new Map(),
      checkedOutBooks: new Map(),
      userEventsMap: new Map(),
      client: jest.fn(),
    };

    await menuController.menu(mockDependencies);

    expect(mockMessage.reply).toHaveBeenCalledWith(constants.GET_AVAILABLE_BEFORE_CHECKOUT_MESSAGE);
  });

  it("should perform checkout if bookMap is not empty", async () => {
    mockMessage.content = "/checkout 1";
    const mockDependencies = {
      message: mockMessage,
      connection: jest.fn(),
      bookMap: new Map([[1, { id: 1, title: "Book 1" }]]),
      checkedOutBooks: new Map(),
      userEventsMap: new Map(),
      client: jest.fn(),
    };

    await menuController.menu(mockDependencies);

    expect(commandsController.checkoutBook).toHaveBeenCalledWith(mockMessage, mockDependencies.connection, mockDependencies.bookMap, mockDependencies.client);
  });

  it("should perform not invoke checkoutBook on invalid checkout pattern", async () => {
    mockMessage.content = "/checkout  a";
    const mockDependencies = {
      message: mockMessage,
      connection: jest.fn(),
      bookMap: new Map([[1, { id: 1, title: "Book 1" }]]),
      checkedOutBooks: new Map(),
      userEventsMap: new Map(),
      client: jest.fn(),
    };

    await menuController.menu(mockDependencies);

    expect(commandsController.checkoutBook).not.toHaveBeenCalled()
  });
});

describe('processReturnRequestsCommand', () => {
  let mockMessage;
  beforeEach(() => {
    mockMessage = { author: { bot: false }, reply: jest.fn() };
    validateAdmin.isAdmin.mockReturnValue(true);
    validateUser.createUserIfNotExists.mockReturnValue(true);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should reply with help message if user is not admin', async () => {
    validateAdmin.isAdmin.mockReturnValue(false);
    mockMessage.content = '/view-return-requests';

    await menuController.menu({ message: mockMessage });

    expect(mockMessage.reply).toHaveBeenCalledWith(constants.HELP_MESSAGE);
    expect(display.returnRequests).not.toHaveBeenCalled();
    expect(commandsController.processReturnRequest).not.toHaveBeenCalled();
  });

  it('should call display.returnRequests and commandsController.processReturnRequest if user is admin', async () => {
    mockMessage.content = '/view-return-requests';
    const mockClient = jest.fn();
    const mockDependencies = {
      message: mockMessage,
      connection: jest.fn(),
      userEventsMap: new Map(),
      client: mockClient,
    };
    const mockReturnRequests = [
      { id: 1, userId: 'user123', bookId: 'book456' },
      { id: 2, userId: 'user789', bookId: 'book101' },
    ];

    databaseService.getReturnRequests.mockResolvedValue(mockReturnRequests);

    await menuController.menu(mockDependencies);

    expect(databaseService.getReturnRequests).toHaveBeenCalledWith(mockDependencies.connection);
    expect(display.returnRequests).toHaveBeenCalledWith(mockMessage, mockReturnRequests);
    expect(commandsController.processReturnRequest).toHaveBeenCalledWith(mockClient, mockMessage, mockDependencies.connection, mockReturnRequests, mockDependencies.userEventsMap);
  });
});

describe('searchBooks', () => {
  let mockMessage;
  let mockBooks
  beforeEach(() => {
    mockMessage = { author: { bot: false }, reply: jest.fn(), content: "/search" };
    validateUser.createUserIfNotExists.mockReturnValue(true);
    mockBooks = [
      { id: 1, title: "Book 1" },
      { id: 2, title: "Book 2" },
    ];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should display available books if books are found", async () => {
    const mockDependencies = {
      message: mockMessage,
      connection: jest.fn(),
      bookMap: new Map(),
      checkedOutBooks: new Map(),
      userEventsMap: new Map(),
      client: jest.fn(),
    };
    commandsController.searchBooks.mockResolvedValue(mockBooks);

    await menuController.menu(mockDependencies);

    expect(commandsController.searchBooks).toHaveBeenCalledWith(
      mockMessage,
      mockDependencies.connection,
      mockDependencies.userEventsMap,
      mockDependencies.bookMap
    );
    expect(display.availableBooks).toHaveBeenCalledWith(mockMessage, mockBooks);
  });

  it("should not display available books if no books are found", async () => {
    const mockDependencies = {
      message: mockMessage,
      connection: jest.fn(),
      bookMap: new Map(),
      checkedOutBooks: new Map(),
      userEventsMap: new Map(),
      client: jest.fn(),
    };

    commandsController.searchBooks.mockResolvedValue(null);

    await menuController.menu(mockDependencies);

    expect(commandsController.searchBooks).toHaveBeenCalledWith(
      mockMessage,
      mockDependencies.connection,
      mockDependencies.userEventsMap,
      mockDependencies.bookMap
    );
    expect(display.availableBooks).not.toHaveBeenCalled();
  });
});

describe('requestBook', () => {
  let mockMessage;

  beforeEach(() => {
    mockMessage = { author: { bot: false }, reply: jest.fn(), content: "/request-new-book" };
    validateUser.createUserIfNotExists.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should reply with HELP_MESSAGE for admin users", async () => {
    const mockDependencies = {
      message: mockMessage,
      connection: jest.fn(),
      bookMap: new Map(),
      checkedOutBooks: new Map(),
      userEventsMap: new Map(),
      client: jest.fn(),
    };
    validateAdmin.isAdmin.mockReturnValue(true);

    await menuController.menu(mockDependencies);

    expect(mockMessage.reply).toHaveBeenCalledWith(constants.HELP_MESSAGE);
    expect(commandsController.requestBook).not.toHaveBeenCalled();
  });

  it("should call requestBook for non-admin users", async () => {
    const mockDependencies = {
      message: mockMessage,
      connection: jest.fn(),
      bookMap: new Map(),
      checkedOutBooks: new Map(),
      userEventsMap: new Map(),
      client: jest.fn(),
    };
    validateAdmin.isAdmin.mockReturnValue(false);

    await menuController.menu(mockDependencies);

    expect(mockMessage.reply).not.toHaveBeenCalled();
    expect(commandsController.requestBook).toHaveBeenCalledWith(
      mockDependencies.client,
      mockMessage,
      mockDependencies.connection,
      mockDependencies.userEventsMap
    );
  });
});

describe('addBook', () => {
  let mockMessage;

  beforeEach(() => {
    mockMessage = { author: { bot: false }, reply: jest.fn(), content: "/add-book" };
    validateUser.createUserIfNotExists.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should reply with HELP_MESSAGE for non-admin users", async () => {
    const mockDependencies = {
      message: mockMessage,
      connection: jest.fn(),
      bookMap: new Map(),
      checkedOutBooks: new Map(),
      userEventsMap: new Map(),
      client: jest.fn(),
    };
    validateAdmin.isAdmin.mockReturnValue(false);

    await menuController.menu(mockDependencies);

    expect(mockMessage.reply).toHaveBeenCalledWith(constants.HELP_MESSAGE);
    expect(commandsController.addBook).not.toHaveBeenCalled();
  });

  it("should call addBook for admin users", async () => {
    const mockDependencies = {
      message: mockMessage,
      connection: jest.fn(),
      bookMap: new Map(),
      checkedOutBooks: new Map(),
      userEventsMap: new Map(),
      client: jest.fn(),
    };
    validateAdmin.isAdmin.mockReturnValue(true);

    await menuController.menu(mockDependencies);

    expect(mockMessage.reply).not.toHaveBeenCalled();
    expect(commandsController.addBook).toHaveBeenCalledWith(
      mockMessage,
      mockDependencies.connection,
      mockDependencies.userEventsMap
    );
  });
});

describe('processUpdateBookCommand', () => {
  let mockMessage;
  beforeEach(() => {
    mockMessage = { author: { bot: false }, reply: jest.fn() };
    validateAdmin.isAdmin.mockReturnValue(true);
    validateUser.createUserIfNotExists.mockReturnValue(true);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should reply with help message if user is not admin', async () => {
    validateAdmin.isAdmin.mockReturnValue(false);
    mockMessage.content = '/update-book';

    await menuController.menu({ message: mockMessage });

    expect(mockMessage.reply).toHaveBeenCalledWith(constants.HELP_MESSAGE);
    expect(display.books).not.toHaveBeenCalled();
    expect(commandsController.getAvailableBooks).not.toHaveBeenCalled();
    expect(commandsController.updateBook).not.toHaveBeenCalled();
  });

  it('should call commandsController.getAvailableBooks, display.books, and commandsController.updateBook if user is admin', async () => {
    mockMessage.content = '/update-book';
    const mockDependencies = {
      message: mockMessage,
      connection: jest.fn(),
      bookMap: new Map(),
      userEventsMap: new Map(),
    };
    const mockAvailableBooks = [
      { id: 1, title: 'Book 1' },
      { id: 2, title: 'Book 2' },
    ];
    const mockUpdatedBook = { id: 1, title: 'Updated Book' };

    commandsController.getAvailableBooks.mockResolvedValue(mockAvailableBooks);

    await menuController.menu(mockDependencies);

    expect(commandsController.getAvailableBooks).toHaveBeenCalledWith(mockMessage, mockDependencies.connection, mockDependencies.bookMap);
    expect(display.books).toHaveBeenCalledWith(mockMessage, mockAvailableBooks);
    expect(commandsController.updateBook).toHaveBeenCalledWith(mockMessage, mockDependencies.connection, mockDependencies.bookMap, mockDependencies.userEventsMap);
  });
});


describe('viewBookRequests', () => {
  let mockMessage;

  beforeEach(() => {
    mockMessage = { author: { bot: false }, reply: jest.fn(), content: "/view-book-requests" };
    validateUser.createUserIfNotExists.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should reply with HELP_MESSAGE for non-admin users", async () => {
    const mockDependencies = {
      message: mockMessage,
      connection: jest.fn(),
      bookMap: new Map(),
      checkedOutBooks: new Map(),
      userEventsMap: new Map(),
      client: jest.fn(),
    };
    validateAdmin.isAdmin.mockReturnValue(false);

    await menuController.menu(mockDependencies);

    expect(mockMessage.reply).toHaveBeenCalledWith(constants.HELP_MESSAGE);
    expect(databaseService.getNewBookRequests).not.toHaveBeenCalled();
    expect(display.newBookRequests).not.toHaveBeenCalled();
    expect(commandsController.processBookRequest).not.toHaveBeenCalled();
  });

  it("should process book requests for admin users", async () => {
    const mockDependencies = {
      message: mockMessage,
      connection: jest.fn(),
      bookMap: new Map(),
      checkedOutBooks: new Map(),
      userEventsMap: new Map(),
      client: jest.fn(),
    };
    const mockNewBookRequests = [{ id: 1, title: "Book 1" }, { id: 2, title: "Book 2" }];
    validateAdmin.isAdmin.mockReturnValue(true);
    databaseService.getNewBookRequests.mockReturnValue(mockNewBookRequests);

    await menuController.menu(mockDependencies);

    expect(databaseService.getNewBookRequests).toHaveBeenCalledWith(mockDependencies.connection);
    expect(display.newBookRequests).toHaveBeenCalledWith(mockMessage, mockNewBookRequests);
    expect(commandsController.processBookRequest).toHaveBeenCalledWith(
      mockDependencies.client,
      mockMessage,
      mockDependencies.connection,
      mockNewBookRequests,
      mockDependencies.userEventsMap
    );
  });
});

describe('viewCheckoutRequests', () => {
  let mockMessage;

  beforeEach(() => {
    mockMessage = { author: { bot: false }, reply: jest.fn(), content: "/view-checkout-requests" };
    validateUser.createUserIfNotExists.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should reply with HELP_MESSAGE for non-admin users", async () => {
    const mockDependencies = {
      message: mockMessage,
      connection: jest.fn(),
      bookMap: new Map(),
      checkedOutBooks: new Map(),
      userEventsMap: new Map(),
      client: jest.fn(),
    };
    validateAdmin.isAdmin.mockReturnValue(false);

    await menuController.menu(mockDependencies);

    expect(mockMessage.reply).toHaveBeenCalledWith(constants.HELP_MESSAGE);
    expect(databaseService.getCheckoutRequests).not.toHaveBeenCalled();
    expect(display.checkoutRequests).not.toHaveBeenCalled();
    expect(commandsController.processCheckoutRequest).not.toHaveBeenCalled();
  });

  it("should process checkout requests for admin users", async () => {
    const mockDependencies = {
      message: mockMessage,
      connection: jest.fn(),
      bookMap: new Map(),
      checkedOutBooks: new Map(),
      userEventsMap: new Map(),
      client: jest.fn(),
    };
    const mockCheckoutRequests = [{ id: 1, title: "Book 1" }, { id: 2, title: "Book 2" }];
    validateAdmin.isAdmin.mockReturnValue(true);
    databaseService.getCheckoutRequests.mockReturnValue(mockCheckoutRequests);

    await menuController.menu(mockDependencies);

    expect(databaseService.getCheckoutRequests).toHaveBeenCalledWith(mockDependencies.connection);
    expect(display.checkoutRequests).toHaveBeenCalledWith(mockMessage, mockCheckoutRequests);
    expect(commandsController.processCheckoutRequest).toHaveBeenCalledWith(
      mockDependencies.client,
      mockMessage,
      mockDependencies.connection,
      mockCheckoutRequests,
      mockDependencies.userEventsMap
    );
  });
});

describe('viewLibraryHistory', () => {
  let mockMessage;

  beforeEach(() => {
    mockMessage = { author: { bot: false }, reply: jest.fn(), content: "/library-history" };
    validateUser.createUserIfNotExists.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should reply with HELP_MESSAGE for non-admin users", async () => {
    const mockDependencies = {
      message: mockMessage,
      connection: jest.fn(),
      bookMap: new Map(),
      checkedOutBooks: new Map(),
      userEventsMap: new Map(),
      client: jest.fn(),
    };
    validateAdmin.isAdmin.mockReturnValue(false);

    await menuController.menu(mockDependencies);

    expect(mockMessage.reply).toHaveBeenCalledWith(constants.HELP_MESSAGE);
    expect(commandsController.getLibraryHistory).not.toHaveBeenCalled();
    expect(display.libraryHistory).not.toHaveBeenCalled();
  });

  it("should display library history for admin users", async () => {
    const mockDependencies = {
      message: mockMessage,
      connection: jest.fn(),
      bookMap: new Map(),
      checkedOutBooks: new Map(),
      userEventsMap: new Map(),
      client: jest.fn(),
    };
    const mockLibraryHistory = [{ id: 1, title: "Book 1" }, { id: 2, title: "Book 2" }];
    validateAdmin.isAdmin.mockReturnValue(true);
    commandsController.getLibraryHistory.mockResolvedValue(mockLibraryHistory);

    await menuController.menu(mockDependencies);

    expect(commandsController.getLibraryHistory).toHaveBeenCalledWith(
      mockMessage,
      mockDependencies.connection
    );
    expect(display.libraryHistory).toHaveBeenCalledWith(mockMessage, mockLibraryHistory);
  });
});

describe('processDeleteBookCommand', () => {
  let mockMessage;
  beforeEach(() => {
    mockMessage = { author: { bot: false }, reply: jest.fn() };
    validateAdmin.isAdmin.mockReturnValue(true);
    validateUser.createUserIfNotExists.mockReturnValue(true);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should reply with help message if user is not admin', async () => {
    validateAdmin.isAdmin.mockReturnValue(false);
    mockMessage.content = '/delete-book';

    await menuController.menu({ message: mockMessage });

    expect(mockMessage.reply).toHaveBeenCalledWith(constants.HELP_MESSAGE);
    expect(display.availableBooksWithQuantity).not.toHaveBeenCalled();
    expect(commandsController.getAvailableBooks).not.toHaveBeenCalled();
    expect(commandsController.deleteBook).not.toHaveBeenCalled();
  });

  it('should call commandsController.getAvailableBooks, display.availableBooksWithQuantity, and commandsController.deleteBook if user is admin', async () => {
    mockMessage.content = '/delete-book';
    const mockDependencies = {
      message: mockMessage,
      connection: jest.fn(),
      bookMap: new Map(),
      userEventsMap: new Map(),
    };
    const mockAvailableBooks = [
      { id: 1, title: 'Book 1' },
      { id: 2, title: 'Book 2' },
    ];
    const mockDeletedBook = { id: 1, title: 'Deleted Book' };

    commandsController.getAvailableBooks.mockResolvedValue(mockAvailableBooks);

    commandsController.deleteBook.mockResolvedValue(mockDeletedBook);

    await menuController.menu(mockDependencies);

    expect(commandsController.getAvailableBooks).toHaveBeenCalledWith(mockMessage, mockDependencies.connection, mockDependencies.bookMap);
    expect(display.availableBooksWithQuantity).toHaveBeenCalledWith(mockMessage, mockAvailableBooks);
    expect(commandsController.deleteBook).toHaveBeenCalledWith(mockMessage, mockDependencies.connection, mockDependencies.bookMap, mockDependencies.userEventsMap);
  });
});

describe('defaultCase', () => {
  let mockMessage;

  beforeEach(() => {
    mockMessage = { author: { bot: false }, reply: jest.fn(), content: "/invalid-command" };
    validateUser.createUserIfNotExists.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should reply with HELP_MESSAGE for any invalid command", async () => {
    const mockDependencies = {
      message: mockMessage,
      connection: jest.fn(),
      bookMap: new Map(),
      checkedOutBooks: new Map(),
      userEventsMap: new Map(),
      client: jest.fn(),
    };

    await menuController.menu(mockDependencies);

    expect(mockMessage.reply).toHaveBeenCalledWith(constants.HELP_MESSAGE);
  });
});

describe('processHelpCommand', () => {
  let mockMessage;
  beforeEach(() => {
    mockMessage = { author: { bot: false } };
    validateAdmin.isAdmin.mockReturnValue(true);
    validateUser.createUserIfNotExists.mockReturnValue(true);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call commandsController.help with isAdmin true', async () => {
    mockMessage.content = '!help';
    const mockDependencies = {
      message: mockMessage,
    };

    await menuController.menu(mockDependencies);

    expect(commandsController.help).toHaveBeenCalledWith(mockMessage, true);
  });
});

