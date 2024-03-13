const { DB_NAME, TABLE_NAME_BOOKS, TABLE_NAME_ISSUED_BOOKS } = process.env;



exports.checkOverdueBooks = async (dependencies) => {
  const { connection, client } = dependencies;
  intervalId = setInterval(async () => {
    try {
      const currentDate = new Date();

      const QUERY = `
                SELECT ib.*, b.title
                FROM ${DB_NAME}.${TABLE_NAME_ISSUED_BOOKS} ib
                JOIN ${DB_NAME}.${TABLE_NAME_BOOKS} b ON ib.book_id = b.id
                WHERE ib.checked_out < DATE_SUB(NOW(), INTERVAL 30 DAY)
            `;
      const queryPromise = new Promise((resolve, reject) => {
        connection.query(QUERY, (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
      });
      const overdueBooks = await queryPromise;
      overdueBooks.forEach(async (book) => {
        const userId = book.user_id;
        const bookTitle = book.title;

        try {
          const user = await client.users.fetch(userId);

          user.send(
            `Reminder: The book "${bookTitle}" you checked out is overdue. Please return it as soon as possible.`
          );
        } catch (error) {}
      });
    } catch (error) {}
  }, 24 * 60 * 60 * 1000);
};