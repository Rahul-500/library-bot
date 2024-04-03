const { addBook } = require('../../../src/controllers/menuoptions/addBook');
const constants = require('../../../src/constants/constant');
const { isAdmin } = require('../../../src/middleware/validateAdmin');

jest.mock('../../../src/middleware/validateAdmin');
jest.mock('../../../src/constants/constant');

describe('addBook', () => {
  let mockMessage;
  beforeEach(() => {
    mockMessage = { author: { bot: false }, reply: jest.fn() };
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should reply with help message if user is not admin', async () => {
    isAdmin.mockReturnValue(false);
    const mockConnection = jest.fn();
    const mockUserEventsMap = new Map();

    await addBook(mockMessage, mockConnection, mockUserEventsMap);

    expect(mockMessage.reply).toHaveBeenCalledWith(constants.HELP_MESSAGE);
  });

});
