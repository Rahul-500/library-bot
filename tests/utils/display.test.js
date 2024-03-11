const display = require('../../src/utils/display');
const constants = require('../../src/constants/constant');
const { EmbedBuilder } = require('discord.js');
const validateUser = require('../../src/service/validateUser')
const { pagination, ButtonTypes, ButtonStyles } = require('@devraelfreeze/discordjs-pagination');

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

    it('should send SORRY_MESSAGE', async () => {
        const books = [];
        const embed = new EmbedBuilder()
            .setTitle(constants.NO_BOOKS_FOUND)
            .setColor('#FF0000')
            .setDescription(constants.SORRY_MESSAGE);

        await expect(display.availableBooks(message, books)).resolves.toBeUndefined();

        expect(message.reply).toHaveBeenCalledWith({ embeds: [embed] });
        expect(message.channel.send).not.toHaveBeenCalled();
    });

    it('should send list of available books without pagination', async () => {
        const books = [{ title: 'Title1', author: 'Author1' }];
        const formattedBooks = `**ID:**\t1\n**Title:**\tTitle1\n**Author:**\tAuthor1\n\n`;

        const pagination = jest.fn();

        const embed = new EmbedBuilder()
            .setTitle(`${constants.AVAILABEL_BOOKS} (Page 1/1)`)
            .setColor('#00FF00')
            .addFields([
                {
                    inline: false,
                    name: `**ID: 1**`,
                    value: `**Title:** Title1\n**Author:** Author1`,
                },
            ]);

        await display.availableBooks(message, books, pagination);

        expect(pagination).toHaveBeenCalledWith(message, [embed]);
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

    it('should send list of user books without pagination', async () => {
        const books = [{ title: 'Title', author: 'Author', checked_out: '2022-01-01' }];
        const pagination = jest.fn();
        const formattedBooks = books.map((book, index) => {
            const checkedOutDate = new Date(book.checked_out).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });

            return `**ID:**\t${index + 1}\n**Title:**\t${book.title}\n**Author:**\t${book.author}\n**Checked-Out-Date:**\t${checkedOutDate}`;
        }).join('\n');

        const embed = new EmbedBuilder()
            .setTitle(`${constants.MY_BOOKS} (Page 1/1)`)
            .setColor(constants.EMBED_COLOR)
            .addFields([
                {
                    name: `**ID: 1**`,
                    value: `**Title:** Title\n**Author:** Author\n**Checked-Out-Date:** Jan 1, 2022`,
                    inline: false,
                },
            ]);

        await display.userBooks(message, books, pagination);

        expect(pagination).toHaveBeenCalledWith(message, [embed]);
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

    it('should send list of available books with quantity', async () => {
        const books = [{ title: 'Title', quantity_available: 10 }];
        const pagination = jest.fn();
        let formattedBooks = '';
        books.forEach((book, index) => {
            formattedBooks += `**ID:**\t${index + 1}\n**Title:**\t${book.title}\n**Quantity:**\t${book.quantity_available}\n\n`;
        });

        const embed = new EmbedBuilder()
            .setTitle(`${constants.AVAILABEL_BOOKS} (Page 1/1)`)
            .setColor('#00FF00')
            .setDescription(formattedBooks);

        await display.availableBooksWithQuantity(message, books, pagination);


        expect(pagination).toHaveBeenCalledWith(message, [embed]);
    });

});

describe('library history', () => {
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
        const embed = new EmbedBuilder()
            .setTitle(constants.NO_HISTORY_FOUND)
            .setColor('#FF0000')
            .setDescription(constants.SORRY_MESSAGE_FOR_NO_HISTORY);

        message.reply({ embeds: [embed] });

        const libraryHistory = []

        display.libraryHistory(message, libraryHistory);

        expect(message.reply).toHaveBeenCalledWith({ embeds: [embed] })
    });

    it('should send list of library history', async () => {
        const pagination = jest.fn();
        const libraryhistory = [
            { name: 'User1', title: 'Book1', checked_out: '2022-01-01', returned: '2022-01-10' },
            { name: 'User2', title: 'Book2', checked_out: '2022-02-01', returned: '2022-02-10' },
        ];
        let formattedLibraryhistory = '';

        libraryhistory.forEach((history, index) => {
            const formatDate = (date) => {
                return new Date(date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                });
            }
            const checkedOut = formatDate(history.checked_out);
            const returned = formatDate(history.returned);

            formattedLibraryhistory += `**ID:**\t${index + 1}\n**User:**\t${history.name}\n**Book:**\t${history.title}\n**Checked-out:**\t${checkedOut}\n**Returned:**\t${returned}\n\n`;
        });



        const embed = new EmbedBuilder()
            .setTitle(`${constants.LIBRARY_HISTORY} (Page 1/1)`)
            .setColor('#00FF00')
            .setDescription(formattedLibraryhistory);


        await display.libraryHistory(message, libraryhistory, pagination);
        expect(pagination).toHaveBeenCalledWith(message, [embed]);
    });
});