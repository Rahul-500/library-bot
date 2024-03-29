### Library Discord Bot

This Discord bot serves as a virtual library manager within your Discord server, enabling users to perform various actions related to books.

#### Admin Commands

- `/add-book`: Add a new book to the library.
- `/delete-book`: Remove a book from the library.
- `/update-book`: Update an existing book in the library.
- `/library-history`: Display the history of library activities.
- `/view-book-requests`: Show all pending book requests.
- `/view-checkout-requests`: View pending book checkout requests.

#### User Commands

- `/start`: Initialize the bot and activate it in the server.
- `/available-books`: See a list of books available in the library.
- `/checkout [Book ID]`: Check out a book by providing its ID.
- `/my-books`: View a list of books checked out by the user.
- `/return [Book ID]`: Return a checked-out book by providing its ID.
- `/request-new-book`: Request a new book to be added to the library.
- `!help`: Get help and see available commands.

**Note:** Always check available books (`/available-books`) before checking out, and check checked-out books (`/my-books`) before returning.

### Getting Started

#### Installation

1. Clone the repository to your local machine.
2. Ensure you have Docker installed.
3. Navigate to the project directory in your terminal.

#### Starting the Application

To start the application, run the following command:

```bash
docker-compose --env-file .env up --build -d
```

This command will start two containers named `library-bot` and `mysql`, which are responsible for running the application and the MySQL database, respectively.

#### Usage

1. Activate the bot in your Discord server using the `/start` command.
2. Interact with the bot using the available commands mentioned in the readme.

#### Managing Database Migrations

If you need to up or down specific database migrations:

1. Access the container using the following command:

    ```bash
    docker exec -it library-bot bash
    ```

2. To up all the migrations, use:

    ```bash
    db-migrate up
    ```

3. To up a specific migration file, use:

    ```bash
    db-migrate up --file <migration_file_name>
    ```

#### Stopping the Application

To stop the application and remove the containers, run:

```bash
docker-compose down
```

Please ensure Docker is properly configured and running on your local machine before starting the application.
