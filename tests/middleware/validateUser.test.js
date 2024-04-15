const { createUserIfNotExists } = require('../../src/middleware/validateUser');
const { addUserInfoQuery } = require('../../src/service/queries/addUserInfoQuery');
const { checkForExistingUserQuery } = require('../../src/service/queries/checkForExistingUserQuery');

jest.mock('../../src/service/queries/addUserInfoQuery');
jest.mock('../../src/service/queries/checkForExistingUserQuery');

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

    checkForExistingUserQuery.mockReturnValue(false);
    addUserInfoQuery.mockReturnValue(true);

    const result = await createUserIfNotExists(mockMessage, mockConnection);

    expect(result).toBe(true);
    expect(checkForExistingUserQuery).toHaveBeenCalledWith(mockMessage, mockConnection);
    expect(addUserInfoQuery).toHaveBeenCalledWith(mockMessage.author.id, mockMessage.author.username, mockConnection);
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

    checkForExistingUserQuery.mockReturnValue(true);

    const result = await createUserIfNotExists(mockMessage, mockConnection);

    expect(result).toBe(true);
    expect(checkForExistingUserQuery).toHaveBeenCalledWith(mockMessage, mockConnection);
    expect(addUserInfoQuery).not.toHaveBeenCalled();
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

    checkForExistingUserQuery.mockReturnValue(false);
    addUserInfoQuery.mockRejectedValue(new Error("User creation failed"));

    const result = await createUserIfNotExists(mockMessage, mockConnection);

    expect(result).toBe(false);
    expect(checkForExistingUserQuery).toHaveBeenCalledWith(mockMessage, mockConnection);
    expect(addUserInfoQuery).toHaveBeenCalledWith(mockMessage.author.id, mockMessage.author.username, mockConnection);
  });
});
