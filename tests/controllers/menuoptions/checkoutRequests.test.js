const constants = require('../../../src/constants/constant');
const { isAdmin } = require('../../../src/middleware/validateAdmin');
const { processCheckoutRequest } = require('../../../src/controllers/commands/processCheckoutRequest');
const { checkoutRequests } = require('../../../src/controllers/menuoptions/checkoutRequests'); 
const { displayCheckoutRequests } = require('../../../src/utils/display/displayCheckoutRequests');
const { getCheckoutRequestsQuery } = require('../../../src/service/queries/getCheckoutRequestsQuery');

jest.mock('../../../src/constants/constant');
jest.mock('../../../src/middleware/validateAdmin');
jest.mock('../../../src/service/queries/getCheckoutRequestsQuery');
jest.mock('../../../src/utils/display/displayCheckoutRequests');
jest.mock('../../../src/controllers/commands/processCheckoutRequest');

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
    expect(getCheckoutRequestsQuery).not.toHaveBeenCalled();
    expect(displayCheckoutRequests).not.toHaveBeenCalled();
    expect(processCheckoutRequest).not.toHaveBeenCalled();
  });

  it('should call getCheckoutRequestsQuery, display.checkoutRequests, and processCheckoutRequest if user is admin', async () => {
    isAdmin.mockReturnValue(true);
    const mockMessage = {};
    const mockConnection = jest.fn();
    const mockUserEventsMap = new Map();
    const mockCheckoutRequests = [
      { id: 1, bookId: 'book123', userId: 'user456' },
      { id: 2, bookId: 'book789', userId: 'user012' },
    ];

    getCheckoutRequestsQuery.mockResolvedValue(mockCheckoutRequests);

    await checkoutRequests(null, mockMessage, mockConnection, mockUserEventsMap);

    expect(getCheckoutRequestsQuery).toHaveBeenCalledWith(mockConnection);
    expect(displayCheckoutRequests).toHaveBeenCalledWith(mockMessage, mockCheckoutRequests);
    expect(processCheckoutRequest).toHaveBeenCalledWith(null, mockMessage, mockConnection, mockCheckoutRequests, mockUserEventsMap);
  });
});
