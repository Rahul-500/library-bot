const { formatDate } = require("../../src/utils/formatDate");

describe("formatDate", () => {
    it("should format a date correctly", () => {
        const inputDate = "2022-04-15";
        const expectedOutput = "Apr 15, 2022";
        const formattedDate = formatDate(inputDate);
        expect(formattedDate).toEqual(expectedOutput);
    });

    it("should return an empty string if input date is invalid", () => {
        const invalidDate = "Invalid Date";
        const formattedDate = formatDate(invalidDate);
        expect(formattedDate).toEqual("");
    });
});
