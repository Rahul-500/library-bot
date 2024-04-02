### Library Discord Bot

This Discord bot serves as a virtual library manager within your Discord server, facilitating various actions related to books.

#### Admin Commands

- `/add-book`: Add a new book to the library.
- `/delete-book`: Remove a book from the library.
- `/update-book`: Update an existing book in the library.
- `/library-history`: Show library history.
- `/view-book-requests`: Show all book requests.
- `/view-checkout-requests`: Show checkout requests.
- `/view-return-requests`: Show return requests.

#### User Commands

- `/start`: Start the bot.
- `/available-books`: Get available books.
- `/checkout [Book ID]`: Checkout a book by providing its ID.
- `/my-books`: Get a list of books checked out by the user.
- `/return [Book ID]`: Return a checked-out book by providing its ID.
- `/request-new-book`: Request a new book by providing its description.
- `/search`: Search for books.

**Note:** Always check available books (`/available-books`) before checking out, and check checked-out books (`/my-books`) before returning.

### Getting Started

#### Installation

1. Clone the repository to your local machine.
2. Ensure you have Docker installed.
3. Create a file named `.env` in the root directory of your project and add the following environment variables with their respective placeholder values:

```plaintext
DISCORD_TOKEN=your_discord_token_here
MYSQL_HOST=your_host_name
MYSQL_USER=your_mysql_user
MYSQL_ROOT_PASSWORD=your_mysql_root_password
MYSQL_DATABASE=your_database_name
BOT_OWNER_USER_NAME=your_bot_owner_username_here
DB_NAME=your_database_name

# Docker compose volume
VOLUME_PATH=your_persistent_volume_path
```

Replace `placeholder_values` with appropriate values.

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
docker-compose --env-file .env down
```

Please ensure Docker is properly configured and running on your local machine before starting the application.
