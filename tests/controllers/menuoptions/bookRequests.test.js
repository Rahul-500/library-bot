const { isAdmin } = require('../../../src/middleware/validateAdmin');
const { getNewBookRequests } = require("../../../src/service/databaseService");
const { processBookRequest } = require("../../../src/controllers/commands/processBookRequest");
const constants = require('../../../src/constants/constant');
const { bookRequests } = require('../../../src/controllers/menuoptions/bookRequests');
const { displayNewBookRequests } = require('../../../src/utils/display/displayNewBookRequests');

jest.mock("../../../src/middleware/validateAdmin");
jest.mock("../../../src/service/databaseService");
jest.mock("../../../src/utils/display");
jest.mock("../../../src/controllers/commands/processBookRequest")
jest.mock('../../../src/constants/constant');
jest.mock('../../../src/utils/display/displayNewBookRequests')

describe('bookRequests', () => {
  let mockClient, mockMessage, mockConnection, mockUserEventsMap;
  
  beforeEach(() => {
    mockClient = jest.fn();
    mockMessage = { author: { bot: false }, reply: jest.fn() };
    mockConnection = jest.fn();
    mockUserEventsMap = new Map();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should reply with help message if user is not admin', async () => {
    isAdmin.mockReturnValue(false);

    await bookRequests(mockClient, mockMessage, mockConnection, mockUserEventsMap);

    expect(mockMessage.reply).toHaveBeenCalledWith(constants.HELP_MESSAGE);
    expect(getNewBookRequests).not.toHaveBeenCalled();
    expect(displayNewBookRequests).not.toHaveBeenCalled();
    expect(processBookRequest).not.toHaveBeenCalled();
  });

  it('should call getNewBookRequests, display.newBookRequests, and processBookRequest if user is admin', async () => {
    isAdmin.mockReturnValue(true);
    const mockNewBookRequests = [
      { id: 1, title: 'Book 1' },
      { id: 2, title: 'Book 2' },
    ];

    getNewBookRequests.mockResolvedValue(mockNewBookRequests);

    await bookRequests(mockClient, mockMessage, mockConnection, mockUserEventsMap);

    expect(getNewBookRequests).toHaveBeenCalledWith(mockConnection);
    expect(displayNewBookRequests).toHaveBeenCalledWith(mockMessage, mockNewBookRequests);
    expect(processBookRequest).toHaveBeenCalledWith(mockClient, mockMessage, mockConnection, mockNewBookRequests, mockUserEventsMap);
  });
});
