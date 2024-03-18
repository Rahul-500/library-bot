const {
  beginTransaction,
  commitTransaction,
  rollbackTransaction,
} = require("../../src/service/transactions");

describe("Transaction Functions", () => {
  let mockConnection;

  beforeEach(() => {
    mockConnection = {
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("beginTransaction resolves on success", async () => {
    mockConnection.beginTransaction.mockImplementation((callback) => {
      callback(null);
    });

    await expect(beginTransaction(mockConnection)).resolves.toBeUndefined();
    expect(mockConnection.beginTransaction).toHaveBeenCalled();
  });

  test("commitTransaction resolves on success", async () => {
    mockConnection.commit.mockImplementation((callback) => {
      callback(null);
    });

    await expect(commitTransaction(mockConnection)).resolves.toBeUndefined();
    expect(mockConnection.commit).toHaveBeenCalled();
  });

  test("rollbackTransaction resolves on success", async () => {
    mockConnection.rollback.mockImplementation((callback) => {
      callback(null);
    });

    await expect(rollbackTransaction(mockConnection)).resolves.toBeUndefined();
    expect(mockConnection.rollback).toHaveBeenCalled();
  });

  test("beginTransaction rejects on error", async () => {
    mockConnection.beginTransaction.mockImplementationOnce((callback) => {
      callback(new Error("Failed to begin transaction"));
    });

    await expect(beginTransaction(mockConnection)).rejects.toThrow(
      "Failed to begin transaction",
    );
    expect(mockConnection.beginTransaction).toHaveBeenCalled();
  });

  test("commitTransaction rejects on error", async () => {
    mockConnection.commit.mockImplementationOnce((callback) => {
      callback(new Error("Failed to commit transaction"));
    });

    await expect(commitTransaction(mockConnection)).rejects.toThrow(
      "Failed to commit transaction",
    );
    expect(mockConnection.commit).toHaveBeenCalled();
  });

  test("rollbackTransaction rejects on error", async () => {
    mockConnection.rollback.mockImplementationOnce((callback) => {
      callback(new Error("Failed to rollback transaction"));
    });

    await expect(rollbackTransaction(mockConnection)).rejects.toThrow(
      "Failed to rollback transaction",
    );
    expect(mockConnection.rollback).toHaveBeenCalled();
  });
});
