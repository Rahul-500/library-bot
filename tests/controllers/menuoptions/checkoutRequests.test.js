const constants = require('../../../src/constants/constant');
const { isAdmin } = require('../../../src/middleware/validateAdmin');
const { getCheckoutRequests } = require('../../../src/service/databaseService');
const display = require('../../../src/utils/display');
const { processCheckoutRequest } = require('../../../src/controllers/commands/processCheckoutRequest');

jest.mock('../../../src/constants/constant');
jest.mock('../../../src/middleware/validateAdmin');
jest.mock('../../../src/service/databaseService');
jest.mock('../../../src/utils/display');
jest.mock('../../../src/controllers/commands/processCheckoutRequest');

const { checkoutRequests } = require('../../../src/controllers/menuoptions/checkoutRequests'); 

describe('checkoutRequests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should reply with help message if user is not admin', async () => {
    isAdmin.mockReturnValue(false);
    const mockMessage = { reply: jest.fn() };
    const mockConnection = jest.fn();
    const mockUserEventsMap = new Map();

    await checkoutRequests(null, mockMessage, mockConnection, mockUserEventsMap);

    expect(mockMessage.reply).toHaveBeenCalledWith(constants.HELP_MESSAGE);
    expect(getCheckoutRequests).not.toHaveBeenCalled();
    expect(display.checkoutRequests).not.toHaveBeenCalled();
    expect(processCheckoutRequest).not.toHaveBeenCalled();
  });

  it('should call getCheckoutRequests, display.checkoutRequests, and processCheckoutRequest if user is admin', async () => {
    isAdmin.mockReturnValue(true);
    const mockMessage = {};
    const mockConnection = jest.fn();
    const mockUserEventsMap = new Map();
    const mockCheckoutRequests = [
      { id: 1, bookId: 'book123', userId: 'user456' },
      { id: 2, bookId: 'book789', userId: 'user012' },
    ];

    getCheckoutRequests.mockResolvedValue(mockCheckoutRequests);

    await checkoutRequests(null, mockMessage, mockConnection, mockUserEventsMap);

    expect(getCheckoutRequests).toHaveBeenCalledWith(mockConnection);
    expect(display.checkoutRequests).toHaveBeenCalledWith(mockMessage, mockCheckoutRequests);
    expect(processCheckoutRequest).toHaveBeenCalledWith(null, mockMessage, mockConnection, mockCheckoutRequests, mockUserEventsMap);
  });
});
