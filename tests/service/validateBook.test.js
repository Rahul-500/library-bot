const assert = require("assert");
const {
  validateCheckout,
  validateReturn,
} = require("../../src/service/validateBook");

const connection = {
  query: (query, callback) => {
    const mockResult = [{ bookCount: 0 }];
    callback(null, mockResult);
  },
};

describe("Validation Tests", () => {
  describe("validateReturn", () => {
    it("should return false when book is not checked out by the user", async () => {
      const userId = 1;
      const bookId = 2;

      const result = await validateReturn(connection, userId, bookId);

      assert.strictEqual(result, false);
    });
  });
});
