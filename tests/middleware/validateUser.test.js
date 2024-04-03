const { createUserIfNotExists } = require('../../src/middleware/validateUser');
const databaseService = require('../../src/service/databaseService');

jest.mock('../../src/service/databaseService');

describe("createUserIfNotExists", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should create user if not exists", async () => {
    const mockMessage = {
      author: {
        id: "123456789",
        username: "testuser",
      },
      reply: jest.fn(),
    };
    const mockConnection = {};

    databaseService.checkForExistingUser.mockReturnValue(false);
    databaseService.addUserInfo.mockReturnValue(true);

    const result = await createUserIfNotExists(mockMessage, mockConnection);

    expect(result).toBe(true);
    expect(databaseService.checkForExistingUser).toHaveBeenCalledWith(mockMessage, mockConnection);
    expect(databaseService.addUserInfo).toHaveBeenCalledWith(mockMessage.author.id, mockMessage.author.username, mockConnection);
  });

  test("should not create user if already exists", async () => {
    const mockMessage = {
      author: {
        id: "123456789",
        username: "existinguser",
      },
      reply: jest.fn(),     
    };
    const mockConnection = {};

    databaseService.checkForExistingUser.mockReturnValue(true);

    const result = await createUserIfNotExists(mockMessage, mockConnection);

    expect(result).toBe(true);
    expect(databaseService.checkForExistingUser).toHaveBeenCalledWith(mockMessage, mockConnection);
    expect(databaseService.addUserInfo).not.toHaveBeenCalled();
  });

  test("should handle errors during user creation", async () => {
    const mockMessage = {
      author: {
        id: "123456789",
        username: "testuser",
      },
      reply: jest.fn(),     
    };
    const mockConnection = {};

    databaseService.checkForExistingUser.mockReturnValue(false);
    databaseService.addUserInfo.mockRejectedValue(new Error("User creation failed"));

    const result = await createUserIfNotExists(mockMessage, mockConnection);

    expect(result).toBe(false);
    expect(databaseService.checkForExistingUser).toHaveBeenCalledWith(mockMessage, mockConnection);
    expect(databaseService.addUserInfo).toHaveBeenCalledWith(mockMessage.author.id, mockMessage.author.username, mockConnection);
  });
});
