const { searchBooks } = require('../../../src/controllers/commands/searchBooks');
const { search } = require('../../../src/controllers/menuoptions/search'); 
const { displayAvailableBooks } = require('../../../src/utils/display/displayAvailableBooks');

jest.mock('../../../src/utils/display/displayAvailableBooks');
jest.mock('../../../src/controllers/commands/searchBooks');

describe('search', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call display.availableBooks with found books', async () => {
    const mockMessage = {};
    const mockConnection = jest.fn();
    const mockUserEventsMap = new Map();
    const mockBookMap = new Map();
    const mockBooksFound = [
      { id: 1, title: 'Book 1' },
      { id: 2, title: 'Book 2' },
    ];

    searchBooks.mockResolvedValue(mockBooksFound);

    await search(mockMessage, mockConnection, mockUserEventsMap, mockBookMap);

    expect(searchBooks).toHaveBeenCalledWith(mockMessage, mockConnection, mockUserEventsMap, mockBookMap);
    expect(displayAvailableBooks).toHaveBeenCalledWith(mockMessage, mockBooksFound);
  });

  it('should not call display.availableBooks if no books are found', async () => {
    const mockMessage = {};
    const mockConnection = jest.fn();
    const mockUserEventsMap = new Map();
    const mockBookMap = new Map();

    searchBooks.mockResolvedValue(null);

    await search(mockMessage, mockConnection, mockUserEventsMap, mockBookMap);

    expect(searchBooks).toHaveBeenCalledWith(mockMessage, mockConnection, mockUserEventsMap, mockBookMap);
    expect(displayAvailableBooks).not.toHaveBeenCalled();
  });
});
