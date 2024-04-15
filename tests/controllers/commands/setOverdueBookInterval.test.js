const {
    setOverdueBookInterval: setOverdueBookIntervalCommand
} = require('../../../src/controllers/commands/setOverdueBookInterval');
const constants = require('../../../src/constants/constant');
const {
    checkOverdueBooks
} = require('../../../src/service/notifier');
const { getOverdueBookIntervalQuery } = require('../../../src/service/queries/getOverdueBookIntervalQuery');
const { setOverdueBookIntervalQuery } = require('../../../src/service/queries/setOverdueBookIntervalQuery');

jest.mock('../../../src/service/queries/getOverdueBookIntervalQuery');
jest.mock('../../../src/service/queries/setOverdueBookIntervalQuery');
jest.mock('../../../src/service/notifier', () => ({
    checkOverdueBooks: jest.fn(),
}));

global.setInterval = jest.fn();

describe('setOverdueBookInterval function', () => {
    let mockIntervalId;

    beforeAll(() => {
        mockIntervalId = setInterval(() => { }, 1000);
    });

    afterAll(() => {
        clearInterval(mockIntervalId);
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        global.setInterval.mockClear();
    });

    test('should set overdue book interval and reply with success message', async () => {
        const mockMessage = {
            content: '/set-overduebook-interval 24',
            reply: jest.fn(),
        };

        const mockConnection = {};
        const mockClient = {};
        const mockResult = [{ setting_value: 24 }];

        getOverdueBookIntervalQuery.mockResolvedValue(mockResult);

        await setOverdueBookIntervalCommand(mockConnection, mockClient, mockMessage);

        expect(setOverdueBookIntervalQuery).toHaveBeenCalledWith(mockConnection, 24);
        expect(mockMessage.reply).toHaveBeenCalledWith(constants.SUCCESSFULL_SET_OVERDUE_BOOK_INTERVAL_MESSAGE);
        expect(getOverdueBookIntervalQuery).toHaveBeenCalled();
        expect(global.setInterval).toHaveBeenCalled();
    });

    test('should handle error and reply with error message', async () => {
        const mockMessage = {
            content: '/set-overduebook-interval 24',
            reply: jest.fn(),
        };

        const mockConnection = {};
        const mockClient = {};

        setOverdueBookIntervalQuery.mockRejectedValue(new Error('Database error'));

        await setOverdueBookIntervalCommand(mockConnection, mockClient, mockMessage);

        expect(mockMessage.reply).toHaveBeenCalledWith(constants.ERROR_SET_OVERDUE_BOOK_INTERVAL_MESSAGE);
    });
});
