const { checkoutBook: checkedOutBookCommand} = require('../../../src/controllers/commands/checkoutBook');
const constants = require('../../../src/constants/constant');

jest.mock('../../../src/constants/constant');
jest.mock('../../../src/controllers/commands/checkoutBook');

const { checkoutBook } = require('../../../src/controllers/menuoptions/checkoutBook');

describe('checkoutBook', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should reply with message if bookMap is empty', async () => {
    const mockMessage = { reply: jest.fn() };
    const mockConnection = jest.fn();
    const mockBookMap = new Map();
    const mockClient = jest.fn();

    mockBookMap.size = 0;
    await checkoutBook(mockMessage, mockConnection, mockBookMap, mockClient);

    expect(mockMessage.reply).toHaveBeenCalledWith(constants.GET_AVAILABLE_BEFORE_CHECKOUT_MESSAGE);
    expect(checkedOutBookCommand).not.toHaveBeenCalled();
  });

  it('should call checkoutBook function if bookMap is not empty', async () => {
    const mockMessage = { reply: jest.fn() };
    const mockConnection = jest.fn();
    const mockBookMap = new Map([
        ['key', 'value'],
    ]);
    const mockClient = jest.fn();

    await checkoutBook(mockMessage, mockConnection, mockBookMap, mockClient);

    expect(checkedOutBookCommand).toHaveBeenCalledWith(mockMessage, mockConnection, mockBookMap, mockClient);
});

});
