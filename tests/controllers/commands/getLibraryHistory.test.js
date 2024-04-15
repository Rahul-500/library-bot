const { getLibraryHistory } = require("../../../src/controllers/commands/getLibraryHistory");
const constants = require('../../../src/constants/constant');
const {getLibraryHistoryQuery} = require('../../../src/service/queries/getLibraryHistoryQuery')
jest.mock("../../../src/service/queries/getLibraryHistoryQuery", () => ({
    getLibraryHistoryQuery: jest.fn(),
}));

describe('getLibraryHistory function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return library history', async () => {
        const mockMessage = { reply: jest.fn() };
        const mockConnection = {};
        const mockLibraryHistory = [{}];

        getLibraryHistoryQuery.mockResolvedValue(mockLibraryHistory);

        const result = await getLibraryHistory(mockMessage, mockConnection);

        expect(getLibraryHistoryQuery).toHaveBeenCalledWith(mockConnection);
        expect(result).toEqual(mockLibraryHistory);
        expect(mockMessage.reply).not.toHaveBeenCalled();
    });

    it('should reply with error message on database query failure', async () => {
        const mockMessage = { reply: jest.fn() };
        const mockConnection = {};

        getLibraryHistoryQuery.mockRejectedValue(new Error('Database error'));

        const result = await getLibraryHistory(mockMessage, mockConnection);

        expect(getLibraryHistoryQuery).toHaveBeenCalledWith(mockConnection);
        expect(result).toBeNull();
        expect(mockMessage.reply).toHaveBeenCalledWith(constants.ERROR_FETCHING_LIBRARY_HISTORY);
    });
});
