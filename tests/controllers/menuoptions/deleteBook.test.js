const constants = require('../../../src/constants/constant');
const { isAdmin } = require('../../../src/middleware/validateAdmin');
const { getAvailableBooks } = require('../../../src/controllers/commands/getAvailableBooks');
const display = require('../../../src/utils/display');
const { deleteBook } = require('../../../src/controllers/commands/deleteBook');

jest.mock('../../../src/constants/constant');
jest.mock('../../../src/middleware/validateAdmin');
jest.mock('../../../src/controllers/commands/getAvailableBooks');
jest.mock('../../../src/utils/display');
jest.mock('../../../src/controllers/commands/deleteBook');

const { deleteBook: deleteBookFunction } = require('../../../src/controllers/menuoptions/deleteBook')

describe('deleteBook', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should reply with help message if user is not admin', async () => {
    isAdmin.mockReturnValue(false);
    const mockMessage = { reply: jest.fn() };
    const mockConnection = jest.fn();
    const mockBookMap = new Map();
    const mockUserEventsMap = new Map();

    await deleteBookFunction(mockMessage, mockConnection, mockBookMap, mockUserEventsMap);

    expect(mockMessage.reply).toHaveBeenCalledWith(constants.HELP_MESSAGE);
    expect(getAvailableBooks).not.toHaveBeenCalled();
    expect(display.availableBooksWithQuantity).not.toHaveBeenCalled();
    expect(deleteBook).not.toHaveBeenCalled();
  });

  it('should call getAvailableBooks, display.availableBooksWithQuantity, and deleteBook if user is admin', async () => {
    isAdmin.mockReturnValue(true);
    const mockMessage = {};
    const mockConnection = jest.fn();
    const mockBookMap = new Map();
    const mockUserEventsMap = new Map();
    const mockBooks = [
      { id: 1, title: 'Book 1' },
      { id: 2, title: 'Book 2' },
    ];

    getAvailableBooks.mockResolvedValue(mockBooks);

    await deleteBookFunction(mockMessage, mockConnection, mockBookMap, mockUserEventsMap);

    expect(getAvailableBooks).toHaveBeenCalledWith(mockMessage, mockConnection, mockBookMap);
    expect(display.availableBooksWithQuantity).toHaveBeenCalledWith(mockMessage, mockBooks);
    expect(deleteBook).toHaveBeenCalledWith(mockMessage, mockConnection, mockBookMap, mockUserEventsMap);
  });
});