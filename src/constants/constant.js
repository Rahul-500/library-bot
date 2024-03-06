exports.MENU_OPTIONS = 'Menu:\n1. Display all available books\n2. My Books'
exports.ADMIN_OPTIONS = 'Menu:\n1. Display all available books\n2. My Books\n3. Add Book\n4. Remove Book'
exports.QUERY = 'SELECT * FROM library.books WHERE quantity_available > 0';
exports.ERROR_FETCHING_BOOKS = "Error fetching available books. Please try again later.";
exports.ERROR_FETCHING_USER = "Error fetching user. Please try again later.";
exports.NO_BOOKS_FOUND = 'No available books found.';
exports.AVAILABEL_BOOKS = "Available Books:";
exports.USE_START_COMMAND_MESSAGE = 'Please start with `/start` before using other commands.';
exports.ERROR_DURING_USER_CHECK = "An error occurred during user check. Please try again later.";
exports.CHECKED_BOOK_SUCCUESSFULLY_MESSAGE = "Book successfully checked out:"
exports.ERROR_CHECKED_OUT_MESSAGE = 'Error during checkout. Please try again.'
exports.GET_AVAILABLE_BEFORE_CHECKOUT_MESSAGE = 'Please use `/1` command to get the list of available books before using `/checkout`.'
exports.ALREADY_CHECKED_OUT_BOOK_MESSAGE = "You already have checked out this book return it to checkout again."
exports.NO_CHECKED_OUT_BOOK_MESSAGE = "No checked out books"
exports.MY_BOOKS = "My books"
exports.GET_AVAILABLE_BEFORE_RETURN_MESSAGE = "Please use `/2` command to get the list of checked out books before using `/return`."
exports.CANNOT_RETURN_BOOK_MESSAGE = "Unable to return. You have not yet checked out this book."
exports.RETURN_BOOK_SUCCUESSFULLY_MESSAGE = "Book successfully returned. Thank you!"
exports.ERROR_RETURN_MESSAGE = 'Error during return. Please try again.'
exports.BOOK_WITH_THAT_ID_NOT_FOUND_MESSAGE = "The book with that ID was not found."
exports.INVALID_COMMAND = "Invalid command.!"
exports.BOOK_DETAILS_PROMPT_MESSAGE = 'Please provide book details in the following format: Title; Author; Published Year; Quantity Available or Enter `exit` to cancel'
exports.ADD_BOOK_DETAILS_RECEIVED_MESSAGE = "Book details received. Adding the book to the database...";
exports.INVALID_DETAILS_MESSAGE = "Please try again by entering `/3` command as the provided data is in incorrect format.";
exports.UNEXPECTED_ERROR_MESSAGE = "An unexpected error occurred while processing the command.";
exports.ADMIN_COMMANDS = `**Admin Commands:**\n1. \`/3\`: Add a new book to the library.\n2. \`/4\`: Remove a book from the library\n\n`;
exports.USER_COMMANDS = `**Available Commands:**\n1. \`/start\`: Start the bot.\n2. \`/1\`: Get available books.\n3. \`/checkout [Book ID]\`: Checkout a book by providing its ID.\n4. \`/2\`: Get a list of books checked out by the user.\n5. \`/return [Book ID]\`: Return a checked-out book by providing its ID.\n\n**Note:**\n- Ensure to get available books (\`/1\`) before checking out.\n- Ensure to get checked out books (\`/2\`) before returning.`;
exports.DELETE_BOOK_PROMPT_MESSAGE = "Please provide book details in the following format: Id; quantity or Enter `exit` to cancel"
exports.INVALID_BOOK_ID_MESSAGE = 'Invalid book ID. Please provide a valid ID from the list of available books.';
exports.DELETE_BOOK_DETAILS_RECEIVED_MESSAGE = "Book details received. Deleting the book to the database...";
exports.QUANTITY_NOT_IN_LIMIT_MESSAGE = 'Invalid quantity. Please provide a quantity within the specified limit. Please try again by entering `/4` command';
exports.WELCOME_MESSAGE = 'Welcome to the Book Library'
exports.HELP_MESSAGE = 'Type `!help` to get a list of commands'
exports.FOOTER_TEXT = 'Enjoy your time in the Book Library!'
exports.EMBED_COLOR = 0x0099FF
exports.MENU_TITLE = '📚 Book Library Menu'
exports.SORRY_MESSAGE = 'Sorry, no books are currently available.'
exports.COLLECTOR_TIMEOUT_MESSAGE = "You took too long to provide the book details. Please start over if you'd like to add a book."
exports.EXIT_ADD_MESSAGE = 'Exited from add book' 
exports.EXIT_REMOVE_MESSAGE = 'Exited from remove book' 
exports.INVALID_DELETE_DETAILS_MESSAGE = "Please try again by entering `/4` command as the provided data is in incorrect format."