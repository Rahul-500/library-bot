const { isAdmin } = require('../../src/middleware/validateAdmin');
const dotenv = require('dotenv');

jest.mock('dotenv', () => ({
    config: jest.fn(),
}));

describe('isAdmin', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    it('should return false if the user is not in the BOT_OWNER_USER_NAMES list', () => {
        dotenv.config.mockReturnValueOnce({ BOT_OWNER_USER_NAME: 'user1,user2,user3' });
        const message = { author: { username: 'other_user' } };

        const result = isAdmin(message);

        expect(result).toBe(false);
    });

    it('should return false if BOT_OWNER_USER_NAME environment variable is not set', () => {
        dotenv.config.mockReturnValueOnce({});
        const message = { author: { username: 'any_user' } };

        const result = isAdmin(message);

        expect(result).toBe(false);
    });
});
