const { isAdmin } = require("../../../src/middleware/validateAdmin");
const constants = require("../../../src/constants/constant");
const {
  setOverdueBookInterval,
} = require("../../../src/controllers/commands/setOverdueBookInterval");
const {
  setOverdueBookInterval: setOverdueBookIntervalOPtion,
} = require("../../../src/controllers/menuoptions/setOverdueBookInterval");

jest.mock("../../../src/controllers/commands/setOverdueBookInterval", () => ({
  setOverdueBookInterval: jest.fn(),
}));

jest.mock("../../../src/middleware/validateAdmin", () => ({
  isAdmin: jest.fn(),
}));

describe("setOverdueBookInterval function", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should reply with help message if user is not admin", async () => {
    const mockMessage = {
      reply: jest.fn(),
    };
    const mockConnection = {};
    const mockClient = {};
    isAdmin.mockReturnValue(false);

    await setOverdueBookIntervalOPtion(mockConnection, mockClient, mockMessage);

    expect(isAdmin).toHaveBeenCalledWith(mockMessage);
    expect(mockMessage.reply).toHaveBeenCalledWith(constants.HELP_MESSAGE);
  });

  test("should call setOverdueBookInterval if user is admin", async () => {
    const mockMessage = {};
    const mockConnection = {};
    const mockClient = {};
    isAdmin.mockReturnValue(true);

    await setOverdueBookIntervalOPtion(mockConnection, mockClient, mockMessage);

    expect(isAdmin).toHaveBeenCalledWith(mockMessage);
    expect(setOverdueBookInterval).toHaveBeenCalledWith(mockConnection, mockClient, mockMessage);
  });
});
