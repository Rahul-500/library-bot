exports.MENU_OPTIONS =
  "Menu:\n1. Available Books\n2. My Books\n3. Request New Book\n4. Search for books";
exports.ADMIN_OPTIONS =
  "Menu:\n1. Available Books\n2. My Books\n3. Add Book\n4. Remove Book\n5. Update Book\n6. Library History\n7. View Book Requests\n8. View Checkout Requests\n9. Search for books\n10. View Return Requests\n11. Set Overdue Book Time Interval";
exports.QUERY = "SELECT * FROM library.books WHERE quantity_available > 0";
exports.ERROR_FETCHING_BOOKS =
  "Error fetching available books. Please try again later.";
exports.ERROR_FETCHING_USER = "Error fetching user. Please try again later.";
exports.NO_BOOKS_FOUND = "No available books found.";
exports.AVAILABEL_BOOKS = "Available Books:";
exports.USE_START_COMMAND_MESSAGE =
  "Please start with `/menu` before using other commands.";
exports.ERROR_DURING_USER_CHECK =
  "An error occurred during user check. Please try again later.";
exports.CHECKED_BOOK_SUCCUESSFULLY_MESSAGE = "Book successfully checked out:";
exports.ERROR_CHECKED_OUT_MESSAGE = "Error during checkout. Please try again.";
exports.GET_AVAILABLE_BEFORE_CHECKOUT_MESSAGE =
  "Please use `/available-books` command to get the list of available books before using `/checkout`.";
exports.ALREADY_CHECKED_OUT_BOOK_MESSAGE =
  "You already have checked out this book return it to checkout again.";
exports.NO_CHECKED_OUT_BOOK_MESSAGE = "No checked out books";
exports.MY_BOOKS = "My books";
exports.GET_AVAILABLE_BEFORE_RETURN_MESSAGE =
  "Please use `/my-books` command to get the list of checked out books before using `/return`.";
exports.CANNOT_RETURN_BOOK_MESSAGE =
  "Unable to return. You have not yet checked out this book.";
exports.RETURN_BOOK_SUCCUESSFULLY_MESSAGE =
  "Book successfully returned. Thank you!";
exports.ERROR_RETURN_MESSAGE = "Error during return. Please try again.";
exports.BOOK_WITH_THAT_ID_NOT_FOUND_MESSAGE =
  "The book with that ID was not found.";
exports.INVALID_COMMAND = "Invalid command.!";
exports.BOOK_DETAILS_PROMPT_MESSAGE =
  "Please provide book details in the following format: Title; Author; Published Year; Quantity Available or Enter `exit` to cancel";
exports.ADD_BOOK_DETAILS_RECEIVED_MESSAGE =
  "Book details received. Adding the book to the database...";
exports.INVALID_DETAILS_MESSAGE =
  "Please try again by entering `/add-book` command as the provided data is in incorrect format.";
exports.UNEXPECTED_ERROR_MESSAGE =
  "An unexpected error occurred while processing the command.";
exports.ADMIN_COMMANDS = `**Admin Commands:**\n1. \`/add-book\`: Add a new book to the library.\n2. \`/delete-book\`: Remove a book from the library.\n3. \`/update-book\`: Update a existing book in the library.\n4. \`/library-history\`: Show library history.\n5. \`/view-book-requests\`: Show all book requests. \n6. \`/view-checkout-requests\`: Show checkout requests. \n7. \`/view-return-requests\`: Show return requests. \n8. \`/set-overduebook-interval [days]\`: Set time interval for overduebook. \n\n`;
exports.USER_COMMANDS = `**Available Commands:**
1. \`/menu\`: Display the menu.
2. \`/available-books\`: Get available books.
3. \`/checkout [Book ID]\`: Checkout a book by providing its ID.
4. \`/my-books\`: Get a list of books checked out by the user.
5. \`/return [Book ID]\`: Return a checked-out book by providing its ID.
6. \`/request-new-book\`: Request a new book by providing its description.
7. \`/search\`: Search for books.

**Note:**
- Ensure to get available books (\`/available-books\`) before checking out.
- Ensure to get checked out books (\`/my-books\`) before returning.`;
exports.DELETE_BOOK_PROMPT_MESSAGE =
  "Please provide book details in the following format: Id; quantity or Enter `exit` to cancel";
exports.INVALID_DELETE_BOOK_ID_MESSAGE =
  "Invalid book ID. Please provide a valid ID from the list of available books. Please try again by entering `/delete-book` command";
exports.DELETE_BOOK_DETAILS_RECEIVED_MESSAGE =
  "Book details received. Deleting the book to the database...";
exports.QUANTITY_NOT_IN_LIMIT_MESSAGE =
  "Invalid quantity. Please provide a quantity within the specified limit. Please try again by entering `/delete-book` command";
exports.WELCOME_MESSAGE = "Welcome to the Book Library";
exports.HELP_MESSAGE = "Type `!help` to get a list of commands";
exports.FOOTER_TEXT = "Enjoy your time in the Book Library!";
exports.EMBED_COLOR = 0x0099ff;
exports.MENU_TITLE = "📚 Book Library Menu";
exports.SORRY_MESSAGE = "Sorry, no books are currently available.";
exports.COLLECTOR_TIMEOUT_MESSAGE =
  "You took too long to provide the book details. Please start over if you'd like to add a book.";
exports.EXIT_ADD_MESSAGE = "Exited from add book";
exports.EXIT_REMOVE_MESSAGE = "Exited from remove book";
exports.INVALID_DELETE_DETAILS_MESSAGE =
  "Please try again by entering `/delete-book` command as the provided data is in incorrect format.";
exports.UNEXPECTED_ADD_ERROR_MESSAGE =
  "An unexpected error occurred while processing the command. Please try again by entering `/add-book` command.";
exports.UNEXPECTED_DELETE_ERROR_MESSAGE =
  "An unexpected error occurred while processing the command. Please try again by entering `/delete-book` command.";
exports.NO_HISTORY_FOUND = "No history found.";
exports.SORRY_MESSAGE_FOR_NO_HISTORY =
  "Sorry, history is currently unavailable.";
exports.LIBRARY_HISTORY = "Library history";
exports.ERROR_FETCHING_LIBRARY_HISTORY = "Error fetching library history.";
exports.itemsPerPage = 5;
exports.UPDATE_BOOK_ID_PROMPT_MESSAGE =
  "Please enter the ID of the book you want to update (type `exit` to cancel)";
exports.EXIT_REMOVE_MESSAGE = "Exiting the book update process";
exports.INVALID_BOOK_ID_MESSAGE =
  "Invalid book ID. Please enter a valid book ID";
exports.BOOK_ID_VALID_MESSAGE =
  "Book ID is valid. You can now enter the details for the update";
exports.UPDATE_BOOK_PROMPT_MESSAGE =
  "Enter the book details in the following format: Title; Author; Published Year; Quantity Available. Leave it blank for no updates or type `exit` to cancel.";
exports.INVALID_UPDATE_DETAILS_MESSAGE =
  "Invalid book details. Please make sure to enter valid information.";
exports.BOOK_UPDATED_MESSAGE = "Book details updated successfully!";
exports.EXIT_UPDATE_MESSAGE = "Exiting the book update process;";
exports.UNEXPECTED_UPDATE_ERROR_MESSAGE =
  "An unexpected error occurred during the book update process. Please try again.";
exports.UPDATE_BOOK_DETAILS_RECEIVED_MESSAGE =
  "Received book details. Updating...";
exports.ERROR_UPDATE_BOOK_MESSAGE =
  "An error occurred while updating the book. Please try again later.";
exports.TIME_INTERVAL_FOR_DUE_NOTIFICATION = 24 * 60 * 60 * 1000;
exports.UNEXPECTED_ERROR_PROCESSING_COMMAND_MESSAGE =
  "An unexpected error occurred while processing the command.";
exports.ERROR_VALIDATING_CHECKED_OUT_BOOK_MESSAGE =
  "Error validating checked-out book. Please try again later.";
exports.BOOK_CURRENTLY_NOT_AVAILABLE_MESSAGE = `Sorry, the book is currently not available. Users who have the book: `;
exports.UNEXPECTED_REQUEST_NEW_BOOK_ERROR_MESSAGE =
  "An unexpected error occurred during the request new book process. Please try again by entering `/request-new-book` command.";
exports.ERROR_SENDING_TO_ADMIN_MESSAGE =
  "Error sending message to admin. Please try again later.";
exports.SUCCESSFULL_SENDING_TO_ADMIN_MESSAGE =
  "Book request notification successfully sent to admin.";
exports.EXIT_REQUEST_BOOK_MESSAGE =
  "Exiting book request. Your request has been canceled.";
exports.NO_BOOK_REQUESTS_FOUND = `No book requests found.`;
exports.SORRY_MESSAGE_FOR_NO_BOOK_REQUEST =
  "Sorry, no book requests are currently available.";
exports.BOOK_REQUESTS = "Book Requests:";
exports.CHANGE_BOOK_REQUEST_STATUS_MESSAGE =
  "Please enter the book request ID to approve or decline (`/approve [id]` or `/decline [id]`). Type `exit` to cancel.";
exports.EXIT_VIEW_BOOK_MESSAGE = "Exiting book request view.";
exports.INVALID_CHANGE_OF_APPROVAL_DETAILS_MESSAGE =
  "Invalid command. Please try again by entering `/view-book-requests` command.";
exports.INVALID_REQUEST_ID_MESSAGE =
  "Invalid book request ID. Please try again by entering `/view-book-requests` command.";
exports.CHANGE_OF_STATUS_RECEIVED =
  "Change of book request status details received.";
exports.UNEXPECTED_CHANGING_BOOK_REQUEST_STATUS_ERROR_MESSAGE =
  "An unexpected error occurred while processing the book request. Please try again later.";
exports.SUCCESSFULL_UPDATE_BOOK_REQUEST_STATUS_MESSAGE =
  "Book Request Status was updated successfully.";
exports.ERROR_CHANGING_BOOK_REQUEST_STATUS_MESSAGE =
  "Error while updating book request status. Please try again later.";
exports.UNEXPECTED_CHECKOUT_BOOK_ERROR_MESSAGE = "An unexpected error occurred during checkout. Please try again by entering `/checkout [id]` command."
exports.NO_CHECKOUT_REQUEST_FOUND = "No Checkout requests found."
exports.SORRY_MESSAGE_FOR_NO_CHECKOUT_REQUEST = "Sorry, no Checkout requests are currently available.";
exports.CHECKOUT_REQUESTS = "Checkout Requests:";
exports.CHANGE_CHECKOUT_REQUEST_STATUS_MESSAGE = "Please enter the book checkout ID to approve or decline (`/approve [id]` or `/decline [id]`). Type `exit` to cancel."
exports.INVALID_CHANGE_OF_APPROVAL_FOR_CHECKOUT_DETAILS_MESSAGE = "Invalid command. Please try again by entering `/view-checkout-requests` command."
exports.EXIT_VIEW_CHECKOUT_MESSAGE = "Exiting book checkout view."
exports.INVALID_CHECKOUT_REQUEST_ID_MESSAGE = "Invalid book checkout ID. Please try again by entering `/view-checkout-requests` command."
exports.CHANGE_OF_CHECKOUT_STATUS_RECEIVED = "Change of book checkout status details received."
exports.ERROR_CHANGING_CHECKOUT_REQUEST_STATUS_MESSAGE = "Error while updating book checkout status. Please try again later."
exports.SUCCESSFULL_UPDATE_CHECKOUT_REQUEST_STATUS_MESSAGE = "Book Checkout Status was updated successfully."
exports.UNEXPECTED_CHANGING_BOOK_CHECKOUT_STATUS_ERROR_MESSAGE = "An unexpected error occurred while processing the book checkout. Please try again later."
exports.EXIT_SEARCH_BOOK_MESSAGE = "Exiting search books."
exports.UNEXPECTED_SEARCH_BOOK_ERROR_MESSAGE = "An unexpected error occurred while searching the book. Please try again by entering `/search` command."
exports.SEARCH_BY_TITLE_PROMPT = "Enter the Title of the book or Enter `exit` to cancel"
exports.SUCCESSFULL_SENDING_TO_ADMIN_RETURN_REQUEST_MESSAGE = "Book return request notification successfully sent to admin."
exports.UNEXPECTED_RETURN_BOOK_ERROR_MESSAGE = "An unexpected error occurred during return. Please try again by entering `/return [id]` command."
exports.NO_RETURN_REQUEST_FOUND = "No Return requests found."
exports.SORRY_MESSAGE_FOR_NO_RETURN_REQUEST = "Sorry, no Return requests are currently available."
exports.RETURN_REQUESTS = "Return Requests:"
exports.CHANGE_RETURN_REQUEST_STATUS_MESSAGE = "Please enter the book return ID to approve or decline (`/approve [id]` or `/decline [id]`). Type `exit` to cancel."
exports.EXIT_VIEW_RETURN_MESSAGE = "Exiting book return view."
exports.INVALID_CHANGE_OF_APPROVAL_FOR_RETURN_DETAILS_MESSAGE = "Invalid command. Please try again by entering `/view-return-requests` command."
exports.INVALID_RETURN_REQUEST_ID_MESSAGE = "Invalid book return ID. Please try again by entering `/view-return-requests` command."
exports.CHANGE_OF_RETURN_STATUS_RECEIVED = "Change of book return status details received."
exports.ERROR_CHANGING_RETURN_REQUEST_STATUS_MESSAGE = "Error while updating book return status. Please try again later."
exports.SUCCESSFULL_UPDATE_RETURN_REQUEST_STATUS_MESSAGE = "Book Return Status was updated successfully."
exports.UNEXPECTED_CHANGING_BOOK_RETURN_STATUS_ERROR_MESSAGE = "An unexpected error occurred while processing the book return. Please try again later."
exports.ERROR_VALIDATING_RETURN_BOOK_MESSAGE = "Error validating return book request. Please try again later."
exports.ALREADY_RETURN_REQUEST_INITIATED_MESSAGE = "Return request has already been initiated for this book"
exports.DEFAULT_RETURN_BOOK_INTERVAL_DAY = 30
exports.SUCCESSFULL_SET_OVERDUE_BOOK_INTERVAL_MESSAGE = 'The overdue book interval has been successfully set.'
exports.ERROR_SET_OVERDUE_BOOK_INTERVAL_MESSAGE = 'An error occurred while setting the overdue book interval. Please try again later.'