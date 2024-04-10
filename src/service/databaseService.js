require("dotenv").config();
const transactions = require("../service/transactions");
const { DB_NAME } = process.env;
const constants = require("../constants/constant");

exports.checkForExistingUser = async (message, connection) => {
  const id = message.author.id;
  const QUERY = `SELECT * FROM ${DB_NAME}.${"users"} WHERE id = ${id}`;

  return new Promise((resolve, reject) => {
    connection.query(QUERY, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      const user = result;
      if (user.length === 0) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

exports.addBookToDatabase = async (message, connection, bookDetails) => {
  const { title, author, published_year, quantity_available } = bookDetails;
  const QUERY = `INSERT INTO ${DB_NAME}.${"books"} (title, author, published_year, quantity_available) VALUES (?, ?, ?, ?)`;
  try {
    await transactions.beginTransaction(connection);

    const queryPromise = new Promise((resolve, reject) => {
      connection.query(
        QUERY,
        [title, author, published_year, quantity_available],
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            message.reply(`Book added successfully! Title: ${title}`);
            resolve(result);
          }
        }
      );
    });

    await queryPromise;

    await transactions.commitTransaction(connection);
  } catch (error) {
    await transactions.rollbackTransaction(connection);
    message.reply(constants.UNEXPECTED_ERROR_PROCESSING_COMMAND_MESSAGE);
  }
};

exports.deleteBookWithQuantity = async (
  message,
  connection,
  book,
  quantity
) => {
  const QUERY = `UPDATE ${"books"} SET quantity_available = quantity_available - ${quantity} where id = ${book.id}`;
  try {
    await transactions.beginTransaction(connection);

    const queryPromise = new Promise((resolve, reject) => {
      connection.query(QUERY, (error, result) => {
        if (error) {
          reject(error);
        } else {
          message.reply(`Book quantity deleted successfully!`);
          resolve(result);
        }
      });
    });

    await queryPromise;

    await transactions.commitTransaction(connection);
  } catch (error) {
    await transactions.rollbackTransaction(connection);
    message.reply(constants.UNEXPECTED_ERROR_PROCESSING_COMMAND_MESSAGE);
  }
};

exports.updateBookDetails = async (
  message,
  connection,
  book,
  title,
  author,
  publishedYear,
  quantity
) => {
  try {
    await transactions.beginTransaction(connection);
    const QUERY = `
                UPDATE ${DB_NAME}.${"books"}
                SET title = '${title}', 
                    author = '${author}', 
                    published_year = ${publishedYear}, 
                    quantity_available = ${quantity}
                WHERE id = ${book.id};
            `;

    const queryPromise = new Promise((resolve, reject) => {
      connection.query(QUERY, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
    const updatedResult = await queryPromise;

    await transactions.commitTransaction(connection);

    message.reply(constants.BOOK_UPDATED_MESSAGE);
  } catch (error) {
    await transactions.rollbackTransaction(connection);
    message.reply(constants.ERROR_UPDATE_BOOK_MESSAGE);
  }
};

exports.addUserInfo = async (id, name, connection) => {
  try {
    await transactions.beginTransaction(connection);

    const QUERY = `
            INSERT INTO ${DB_NAME}.${"users"} (id, name) 
            VALUES (${id}, '${name}');
        `;

    const queryPromise = new Promise((resolve, reject) => {
      connection.query(QUERY, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
    await queryPromise;
    await transactions.commitTransaction(connection);
  } catch (error) {
    await transactions.rollbackTransaction(connection);
  }
};

exports.getCheckedOutUsers = async (connection, book) => {
  try {
    const bookId = book.id;

    const QUERY = `SELECT name from ${DB_NAME}.${"users"} where id IN (SELECT user_id FROM ${DB_NAME}.${"issued_books"} WHERE book_id = ${bookId})`;

    const queryPromise = new Promise((resolve, reject) => {
      connection.query(QUERY, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
    const users = await queryPromise;
    return users;
  } catch (error) {
    return null;
  }
};

exports.getUserIdByUsername = async (connection, username) => {
  const QUERY = `SELECT id FROM ${DB_NAME}.${"users"} WHERE name IN (${username})`;
  try {
    const queryPromise = new Promise((resolve, reject) => {
      connection.query(QUERY, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    const userIdList = await queryPromise;
    return userIdList;
  } catch (error) {
    return null;
  }
};

exports.getNewBookRequests = async (connection) => {
  try {
    const QUERY = `SELECT br.id,br.user_id,u.name,br.description,br.status
        FROM ${DB_NAME}.${"users"} u
        INNER JOIN ${DB_NAME}.book_request_alerts br ON u.id = br.user_id;`;
    const queryPromise = new Promise((resolve, reject) => {
      connection.query(QUERY, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    const newBookRequests = await queryPromise;
    return newBookRequests;
  } catch (error) {
    return null;
  }
};

exports.getOverdueBooks = (connection, timeInterval) => {
  return new Promise((resolve, reject) => {
    try {
      const QUERY = `
              SELECT ib.*, b.title
              FROM ${DB_NAME}.${"issued_books"} ib
              JOIN ${DB_NAME}.${"books"} b ON ib.book_id = b.id
              WHERE ib.checked_out < DATE_SUB(NOW(), INTERVAL ${timeInterval} DAY)
          `;
      connection.query(QUERY, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

exports.setOverdueBookInterval = async (connection, timeInterval) => {
  return new Promise((resolve, reject) => {
    try {
      const QUERY = `
      UPDATE library.app_settings
      SET setting_value = ${timeInterval}
      WHERE setting_name = 'overdue_books_interval'; `;
      connection.query(QUERY, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

exports.getOverdueBookInterval = async (connection) => {
  return new Promise((resolve, reject) => {
    try {
      const QUERY = `
        SELECT setting_value
        FROM library.app_settings
        WHERE setting_name = 'overdue_books_interval'; `;
      connection.query(QUERY, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

exports.addBookRequest = async (connection, bookRequest, message) => {
  try {
    const userId = message.author.id;
    await transactions.beginTransaction(connection);
    const QUERY = `INSERT INTO ${DB_NAME}.book_request_alerts(user_id, description) VALUES('${userId}', '${bookRequest}')`;
    const queryPromise = new Promise((resolve, reject) => {
      connection.query(QUERY, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
    await queryPromise;
    await transactions.commitTransaction(connection);
  } catch (error) {
    await transactions.rollbackTransaction(connection);
  }
};

exports.deleteBookRequest = async (connection, bookRequestId) => {
  const QUERY = `DELETE FROM ${DB_NAME}.book_request_alerts WHERE id=${bookRequestId};`;
  try {
    await transactions.beginTransaction(connection);

    const queryPromise = new Promise((resolve, reject) => {
      connection.query(QUERY, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    const result = await queryPromise;
    await transactions.commitTransaction(connection);
    return result;
  } catch (error) {
    await transactions.rollbackTransaction(connection);
    return null;
  }
};

exports.updateBookRequestStatus = async (
  connection,
  bookRequestId,
  bookRequestStatus
) => {
  try {
    await transactions.beginTransaction(connection);
    const QUERY = `
                UPDATE ${DB_NAME}.book_request_alerts
                SET status = '${bookRequestStatus}' 
                WHERE id = ${bookRequestId};
            `;

    const queryPromise = new Promise((resolve, reject) => {
      connection.query(QUERY, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
    const updatedResult = await queryPromise;
    await transactions.commitTransaction(connection);
    if (bookRequestStatus === "approved") {
      const deleteRequest = await this.deleteBookRequest(
        connection,
        bookRequestId
      );
      if (!deleteRequest) {
        throw new Error("Error: executing the query");
      }
    }
    return updatedResult;
  } catch (error) {
    await transactions.rollbackTransaction(connection);
    return null;
  }
};

exports.addCheckoutRequest = async (connection, userId, bookId) => {
  try {
    const QUERY = `INSERT INTO ${DB_NAME}.checkout_request_alerts  (book_id,user_id) VALUES ('${bookId}', '${userId}')`;
    await transactions.beginTransaction(connection);

    const queryPromise = new Promise((resolve, reject) => {
      connection.query(QUERY, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    const result = await queryPromise;
    await transactions.commitTransaction(connection);

    return result;
  } catch (error) {
    await transactions.rollbackTransaction(connection);
    return null;
  }
};

exports.getCheckoutRequests = async (connection) => {
  try {
    const QUERY = `SELECT cr.id, u.id as user_id, u.name, b.id as book_id, b.title, cr.status FROM ${DB_NAME}.checkout_request_alerts cr JOIN ${DB_NAME}.${"users"} u ON cr.user_id = u.id JOIN ${DB_NAME}.${"books"} b ON cr.book_id = b.id;`;
    const queryPromise = new Promise((resolve, reject) => {
      connection.query(QUERY, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    const newCheckoutRequests = await queryPromise;
    return newCheckoutRequests;
  } catch (error) {
    return null;
  }
};

exports.checkOutBook = async (connection, userId, bookId) => {
  const QUERY = `INSERT INTO ${DB_NAME}.${"issued_books"} (user_id, book_id, checked_out) VALUES ('${userId}', '${bookId}', NOW())`;
  try {
    await transactions.beginTransaction(connection);

    const queryPromise = new Promise((resolve, reject) => {
      connection.query(QUERY, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    const checkout = await queryPromise;
    await transactions.commitTransaction(connection);
    return checkout;
  } catch (error) {
    await transactions.rollbackTransaction(connection);
    return null;
  }
};

exports.deleteCheckoutRequest = async (connection, checkoutRequestId) => {
  const QUERY = `DELETE FROM ${DB_NAME}.checkout_request_alerts WHERE id=${checkoutRequestId};`;
  try {
    await transactions.beginTransaction(connection);

    const queryPromise = new Promise((resolve, reject) => {
      connection.query(QUERY, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    const result = await queryPromise;
    await transactions.commitTransaction(connection);
    return result;
  } catch (error) {
    await transactions.rollbackTransaction(connection);
    return null;
  }
};

exports.updateCheckoutRequestStatus = async (
  connection,
  checkoutRequest,
  checkoutRequestStatus
) => {
  try {
    const checkoutRequestId = checkoutRequest.id;
    const userId = checkoutRequest.user_id;
    const bookId = checkoutRequest.book_id;
    await transactions.beginTransaction(connection);
    const QUERY = `
                  UPDATE ${DB_NAME}.checkout_request_alerts
                  SET status = '${checkoutRequestStatus}' 
                  WHERE id = ${checkoutRequestId};
              `;
    const queryPromise = new Promise((resolve, reject) => {
      connection.query(QUERY, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
    const updatedResult = await queryPromise;
    if (checkoutRequestStatus === "approved") {
      const checkout = await this.checkOutBook(connection, userId, bookId);
      const deleteRequest = await this.deleteCheckoutRequest(
        connection,
        checkoutRequestId
      );
      if (!checkout || !deleteRequest) {
        throw new Error("Error: executing the query");
      }
    }
    await transactions.commitTransaction(connection);
    return updatedResult;
  } catch (error) {
    await transactions.rollbackTransaction(connection);
    return null;
  }
};

exports.getBooksByTitle = async (connection, title) => {
  const QUERY = `SELECT * FROM ${DB_NAME}.${"books"} WHERE LOWER(title) LIKE LOWER('%${title}%')`;
  try {
    const queryPromise = new Promise((resolve, reject) => {
      connection.query(QUERY, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    const books = await queryPromise;
    return books;
  } catch (error) {
    return null;
  }
};

exports.getUser = async (connection, id) => {
  try {
    const QUERY = `SELECT * FROM ${DB_NAME}.${"users"} WHERE id = ${id}`;
    const queryPromise = new Promise((resolve, reject) => {
      connection.query(QUERY, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
    const user = await queryPromise;
    return user;
  } catch (error) {
    return null;
  }
};

exports.getAvailableBooks = async (connection) => {
  try {
    const QUERY = `SELECT * FROM ${DB_NAME}.${"books"}`;
    const queryPromise = new Promise((resolve, reject) => {
      connection.query(QUERY, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
    const books = await queryPromise;
    return books;
  } catch (error) {
    return null;
  }
};

exports.getUserBooks = async (connection, userId) => {
  try {
    const QUERY = `
SELECT b.*, i.checked_out 
FROM ${DB_NAME}.${"books"} AS b
INNER JOIN ${DB_NAME}.${"issued_books"} AS i
ON b.id = i.book_id
WHERE i.user_id = ${userId}
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
    const books = await queryPromise;
    return books;
  } catch (error) {
    return null;
  }
};

exports.returnBookWithId = async (connection, userId, bookId) => {
  try {
    const QUERY = `DELETE FROM ${DB_NAME}.${"issued_books"} WHERE user_id = ${userId} AND book_id = ${bookId}`;
    await transactions.beginTransaction(connection);

    const queryPromise = new Promise((resolve, reject) => {
      connection.query(QUERY, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    await queryPromise;
    await transactions.commitTransaction(connection);
    return true;
  } catch (error) {
    await transactions.rollbackTransaction(connection);
    return null;
  }
};

exports.getLibraryHistory = async (connection) => {
  try {
    const QUERY = `SELECT
    ${"users"}.name,
    ${"books"}.title,
    ${"library_history"}.checked_out,
    ${"library_history"}.returned
FROM
    ${DB_NAME}.${"library_history"}
JOIN
    books ON ${"library_history"}.book_id = ${"books"}.id
JOIN
    users ON ${"library_history"}.user_id = ${"users"}.id;
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
    const libraryHistory = await queryPromise;
    return libraryHistory;
  } catch (error) {
    return null;
  }
};

exports.addReturnRequest = async (connection, userId, bookId) => {
  try {
    const QUERY = `INSERT INTO ${DB_NAME}.return_request_alerts  (book_id,user_id) VALUES ('${bookId}', '${userId}')`;
    await transactions.beginTransaction(connection);

    const queryPromise = new Promise((resolve, reject) => {
      connection.query(QUERY, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    const result = await queryPromise;
    await transactions.commitTransaction(connection);

    return result;
  } catch (error) {
    await transactions.rollbackTransaction(connection);
    return null;
  }
};

exports.getReturnRequests = async (connection) => {
  try {
    const QUERY = `SELECT rr.id, u.id as user_id, u.name, b.id as book_id, b.title, rr.status FROM ${DB_NAME}.return_request_alerts rr JOIN ${DB_NAME}.${"users"} u ON rr.user_id = u.id JOIN ${DB_NAME}.${"books"} b ON rr.book_id = b.id;`;
    const queryPromise = new Promise((resolve, reject) => {
      connection.query(QUERY, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    const newReturnRequests = await queryPromise;
    return newReturnRequests;
  } catch (error) {
    return null;
  }
};

exports.updateReturnRequestStatus = async (
  connection,
  returnRequest,
  returnRequestStatus
) => {
  try {
    const returnRequestId = returnRequest.id;
    const userId = returnRequest.user_id;
    const bookId = returnRequest.book_id;
    await transactions.beginTransaction(connection);
    const QUERY = `
                  UPDATE ${DB_NAME}.return_request_alerts
                  SET status = '${returnRequestStatus}' 
                  WHERE id = ${returnRequestId};
              `;
    const queryPromise = new Promise((resolve, reject) => {
      connection.query(QUERY, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
    const updatedResult = await queryPromise;
    if (returnRequestStatus === "approved") {
      const checkout = await this.returnBookWithId(connection, userId, bookId);
      const deleteRequest = await this.deleteReturnRequest(
        connection,
        returnRequestId
      );
      if (!checkout || !deleteRequest) {
        throw new Error("Error: executing the query");
      }
    }
    await transactions.commitTransaction(connection);
    return updatedResult;
  } catch (error) {
    await transactions.rollbackTransaction(connection);
    return null;
  }
};

exports.deleteReturnRequest = async (connection, returnRequestId) => {
  const QUERY = `DELETE FROM ${DB_NAME}.return_request_alerts WHERE id=${returnRequestId};`;
  try {
    await transactions.beginTransaction(connection);

    const queryPromise = new Promise((resolve, reject) => {
      connection.query(QUERY, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    const result = await queryPromise;
    await transactions.commitTransaction(connection);
    return result;
  } catch (error) {
    await transactions.rollbackTransaction(connection);
    return null;
  }
};

exports.getReturnRequestsForBook = async (connection, bookId) => {
  try {
    const QUERY = `SELECT user_id from ${DB_NAME}.return_request_alerts where book_id = ${bookId} and status = 'pending'`;

    const queryPromise = new Promise((resolve, reject) => {
      connection.query(QUERY, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
    const userIds = await queryPromise;
    return userIds;
  } catch (error) {
    return null;
  }
};

exports.validateReturn = (connection, userId, bookId) => {
  const QUERY = `SELECT COUNT(book_id) AS bookCount
    FROM (
        SELECT book_id
        FROM ${DB_NAME}.${"issued_books"}
        WHERE user_id = ${userId}
        GROUP BY book_id
    ) AS subquery
    WHERE book_id = ${bookId};
    `;
  return new Promise((resolve, reject) => {
    connection.query(QUERY, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result[0].bookCount > 0);
      }
    });
  });
};
