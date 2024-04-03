const { availableBooks } = require('../../../src/controllers/menuoptions/availableBooks');
const constants = require('../../../src/constants/constant');
const { getAvailableBooks } = require('../../../src/controllers/commands/getAvailableBooks');
const display = require('../../../src/utils/display');

jest.mock('../../../src/controllers/commands/getAvailableBooks');
jest.mock('../../../src/utils/display', () => ({
  availableBooks: jest.fn(),
}));

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
    expect(display.availableBooks).toHaveBeenCalledWith(mockMessage, availableBooksResult);
  });

  test('should not call display function if getAvailableBooks returns null', async () => {
    const mockMessage = { author: { id: '1234567890' } };
    const mockConnection = {};
    const mockBookMap = new Map();

    getAvailableBooks.mockResolvedValue(null);

    await availableBooks(mockMessage, mockConnection, mockBookMap);

    expect(getAvailableBooks).toHaveBeenCalledWith(mockMessage, mockConnection, mockBookMap);
    expect(display.availableBooks).not.toHaveBeenCalled();
  });
});
