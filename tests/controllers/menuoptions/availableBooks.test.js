const { availableBooks } = require('../../../src/controllers/menuoptions/availableBooks');
const { getAvailableBooks } = require('../../../src/controllers/commands/getAvailableBooks');
const { displayAvailableBooks } = require('../../../src/utils/display/displayAvailableBooks');

jest.mock('../../../src/controllers/commands/getAvailableBooks');
jest.mock('../../../src/utils/display/displayAvailableBooks');

describe('availableBooks function', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should call getAvailableBooks and display available books', async () => {
    const mockMessage = { author: { id: '1234567890' } };
    const mockConnection = {};
    const bookMap = new Map();
   
    const availableBooksResult = [
      { id: 1, title: 'Book 1', author: 'Author 1' },
      { id: 2, title: 'Book 2', author: 'Author 2' },
    ];

    getAvailableBooks.mockResolvedValue(availableBooksResult);

    await availableBooks(mockMessage, mockConnection, bookMap);

    expect(getAvailableBooks).toHaveBeenCalledWith(mockMessage, mockConnection, bookMap);
    expect(displayAvailableBooks).toHaveBeenCalledWith(mockMessage, availableBooksResult);
  });

  test('should not call display function if getAvailableBooks returns null', async () => {
    const mockMessage = { author: { id: '1234567890' } };
    const mockConnection = {};
    const mockBookMap = new Map();

    getAvailableBooks.mockResolvedValue(null);

    await availableBooks(mockMessage, mockConnection, mockBookMap);

    expect(getAvailableBooks).toHaveBeenCalledWith(mockMessage, mockConnection, mockBookMap);
    expect(displayAvailableBooks).not.toHaveBeenCalled();
  });
});
