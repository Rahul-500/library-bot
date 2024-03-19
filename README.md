# Library Discord Bot

This Discord bot serves as a virtual library manager within your Discord server, allowing users to perform various actions related to books.

## Admin Commands

- **/add-book**: Add a new book to the library.
- **/delete-book**: Remove a book from the library.
- **/update-book**: Update an existing book in the library.
- **/library-history**: Display the history of library activities.
- **/view-book-requests**: Show all pending book requests.
- **/view-checkout-requests**: View pending book checkout requests.

## User Commands

- **/start**: Initialize the bot and activate it in the server.
- **/available-books**: See a list of books available in the library.
- **/checkout [Book ID]**: Check out a book by providing its ID.
- **/my-books**: View a list of books checked out by the user.
- **/return [Book ID]**: Return a checked-out book by providing its ID.
- **/request-new-book**: Request a new book to be added to the library.
- **!help**: Get help and see available commands.

## Getting Started

1. **Installation**: Invite the bot to your Discord server and ensure it has the necessary permissions.
   
2. **Activation**: Use the `/start` command to activate the bot in your server.

3. **Usage**: Interact with the bot using the commands mentioned above to manage the virtual library effectively.

## Usage Examples

- `/start`: Activate the bot.
- `/available-books`: See the available books.
- `/checkout 1234`: Check out a specific book.
- `/my-books`: View the books checked out by the user.
- `/return 1234`: Return a checked-out book.
- `/request-new-book`: Request a new book to be added.
- `!help`: Get assistance and see available commands.

**Note**: Always check available books (`/available-books`) before checking out, and check checked-out books (`/my-books`) before returning.
