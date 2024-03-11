const display = require('../../src/utils/display');
const constants = require('../../src/constants/constant');
const { EmbedBuilder } = require('discord.js');
const validateUser = require('../../src/service/validateUser')

describe('welcomeMessage', () => {
    let message;


    beforeEach(() => {
        message = {
            author: { username: 'test_user' },
            reply: jest.fn(),
        };

        validateUser.isAdmin = jest.fn()

    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should send a welcome message with menu options for a regular user', () => {
        validateUser.isAdmin.mockReturnValue(false);
        display.welcomeMessage(message, validateUser);


        const menuOptions = constants.MENU_OPTIONS;
        const welcomeMessage = `${constants.WELCOME_MESSAGE}, ${message.author.username}!`;

        const embed = new EmbedBuilder()
            .setColor(constants.EMBED_COLOR)
            .setTitle(constants.MENU_TITLE)
            .setDescription(welcomeMessage)
            .addFields(
                { name: 'Options', value: menuOptions, inline: false },
                { name: 'How to use', value: constants.HELP_MESSAGE }
            )
            .setFooter({ text: constants.FOOTER_TEXT });
        expect(message.reply).toHaveBeenCalledWith({ embeds: [embed] })
    });

    it('should send a welcome message with admin menu options for a admin user', () => {
        validateUser.isAdmin.mockReturnValue(true);
        display.welcomeMessage(message, validateUser);


        const menuOptions = constants.ADMIN_OPTIONS;
        const welcomeMessage = `${constants.WELCOME_MESSAGE}, ${message.author.username}!`;

        const embed = new EmbedBuilder()
            .setColor(constants.EMBED_COLOR)
            .setTitle(constants.MENU_TITLE)
            .setDescription(welcomeMessage)
            .addFields(
                { name: 'Options', value: menuOptions, inline: false },
                { name: 'How to use', value: constants.HELP_MESSAGE }
            )
            .setFooter({ text: constants.FOOTER_TEXT });
        expect(message.reply).toHaveBeenCalledWith({ embeds: [embed] })
    });
});

describe('available books', () => {
    let message;

    beforeEach(() => {
        message = {
            author: { username: 'test_user' },
            reply: jest.fn(),
            channel: { send: jest.fn() }
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should send SORRY_MESSAGE', () => {
        const books = [];
        const embed = new EmbedBuilder()
            .setTitle(constants.NO_BOOKS_FOUND)
            .setColor('#FF0000')
            .setDescription(constants.SORRY_MESSAGE);

        display.availableBooks(message, books);

        expect(message.reply).toHaveBeenCalledWith({ embeds: [embed] });
        expect(message.channel.send).not.toHaveBeenCalled();
    });

    it('should send list of available books', () => {
        const books = [{ title: 'Title', author: 'Author' }];
        let formattedBooks = '';
        books.forEach((book, index) => {
            formattedBooks += `**ID:**\t${index + 1}\n**Title:**\t${book.title}\n**Author:**\t${book.author}\n\n`;
        });

        const embed = new EmbedBuilder()
            .setTitle(constants.AVAILABEL_BOOKS)
            .setColor('#00FF00')
            .setDescription(formattedBooks);

        display.availableBooks(message, books);

        expect(message.reply).not.toHaveBeenCalled();
        expect(message.channel.send).toHaveBeenCalledWith({ embeds: [embed] });
    });
});

describe('user books', () => {
    let message;

    beforeEach(() => {
        message = {
            author: { username: 'test_user' },
            reply: jest.fn()
        };

    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should send SORRY_MESSAGE', () => {
        const books = []
        const embed = new EmbedBuilder()
            .setTitle(constants.NO_BOOKS_FOUND)
            .setColor('#FF0000')
            .setDescription(constants.SORRY_MESSAGE);

        display.userBooks(message, books);

        expect(message.reply).toHaveBeenCalledWith({ embeds: [embed] })
    });

    it('should send list of user books', () => {
        const books = [{ title: 'Title' }]

        const formattedBooks = books.map((book, index) => {
            const checkedOutDate = new Date(book.checked_out).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
    
            return `**ID:**\t${index + 1}\n**Title:**\t${book.title}\n**Author:**\t${book.author}\n**Checked-Out-Date:**\t${checkedOutDate}`;
        }).join('\n');
        
        const embed = new EmbedBuilder()
            .setTitle(constants.MY_BOOKS)
            .setColor(constants.EMBED_COLOR)
            .setDescription(formattedBooks)

        display.userBooks(message, books);

        expect(message.reply).toHaveBeenCalledWith({ embeds: [embed] })
    });
});

describe('get available books with quantity', () => {
    let message;

    beforeEach(() => {
        message = {
            author: { username: 'test_user' },
            reply: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should send SORRY_MESSAGE', () => {
        const books = []
        const embed = new EmbedBuilder()
            .setTitle(constants.NO_BOOKS_FOUND)
            .setColor('#FF0000')
            .setDescription(constants.SORRY_MESSAGE);

        display.availableBooksWithQuantity(message, books);

        expect(message.reply).toHaveBeenCalledWith({ embeds: [embed] })
    });

    it('should send list of avialable books with quantity', () => {
        const books = [{ title: 'Title', quantity_available: 10 }]
        let formattedBooks = '';
        books.forEach((book, index) => {
            formattedBooks += `**ID:**\t${index + 1}\n**Title:**\t${book.title}\n**Quantity:**\t${book.quantity_available}\n\n`;
        });

        const embed = new EmbedBuilder()
            .setTitle(constants.AVAILABEL_BOOKS)
            .setColor('#00FF00')
            .setDescription(formattedBooks)

        display.availableBooksWithQuantity(message, books);

        expect(message.reply).toHaveBeenCalledWith({ embeds: [embed] })
    });
});