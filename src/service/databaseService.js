require("dotenv").config();
const transactions = require("../service/transactions");
const { DB_NAME, TABLE_NAME_BOOKS, TABLE_NAME_ISSUED_BOOKS, TABLE_NAME_USERS } =
  process.env;
const constants = require("../constants/constant");
let intervalId = null;

exports.addBookToDatabase = async (message, connection, bookDetails) => {
  const { title, author, published_year, quantity_available } = bookDetails;
  const QUERY = `INSERT INTO ${DB_NAME}.${TABLE_NAME_BOOKS} (title, author, published_year, quantity_available) VALUES (?, ?, ?, ?)`;
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
        },
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
  quantity,
) => {
  const QUERY = `UPDATE ${TABLE_NAME_BOOKS} SET quantity_available = quantity_available - ${quantity} where id = ${book.id}`;
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
  quantity,
) => {
  try {
    await transactions.beginTransaction(connection);
    const QUERY = `
                UPDATE ${DB_NAME}.${TABLE_NAME_BOOKS}
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
            INSERT INTO ${DB_NAME}.${TABLE_NAME_USERS} (id, name) 
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

    const QUERY = `SELECT name from ${DB_NAME}.${TABLE_NAME_USERS} where id IN (SELECT user_id FROM ${DB_NAME}.${TABLE_NAME_ISSUED_BOOKS} WHERE book_id = ${bookId})`;

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
  const QUERY = `SELECT id FROM ${DB_NAME}.${TABLE_NAME_USERS} WHERE name IN (${username})`;
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
        FROM ${DB_NAME}.${TABLE_NAME_USERS} u
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

exports.getOverdueBooks = (connection) => {
  return new Promise((resolve, reject) => {
    const intervalId = setInterval(async () => {
      try {
        const QUERY = `
                    SELECT ib.*, b.title
                    FROM ${DB_NAME}.${TABLE_NAME_ISSUED_BOOKS} ib
                    JOIN ${DB_NAME}.${TABLE_NAME_BOOKS} b ON ib.book_id = b.id
                    WHERE ib.checked_out < DATE_SUB(NOW(), INTERVAL 30 DAY)
                `;
        const queryPromise = new Promise((innerResolve, innerReject) => {
          connection.query(QUERY, (error, results) => {
            if (error) {
              innerReject(error);
            } else {
              innerResolve(results);
            }
          });
        });
        const overdueBooks = await queryPromise;
        clearInterval(intervalId);
        resolve(overdueBooks);
      } catch (error) {
        clearInterval(intervalId);
        reject(error);
      }
    }, constants.TIME_INTERVAL_FOR_DUE_NOTIFICATION);
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
    return result
  } catch (error) {
    await transactions.rollbackTransaction(connection);
    return null
  }
}


exports.updateBookRequestStatus = async (
  connection,
  bookRequestId,
  bookRequestStatus,
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
      const deleteRequest = await this.deleteBookRequest(connection, bookRequestId)
      if (!deleteRequest) {
        throw new Error("Error: executing the query")
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

    return result
  } catch (error) {
    await transactions.rollbackTransaction(connection);
    return null
  }
}

exports.getCheckoutRequests = async (connection) => {
  try {
    const QUERY = `SELECT cr.id, u.id as user_id, u.name, b.id as book_id, b.title, cr.status FROM ${DB_NAME}.checkout_request_alerts cr JOIN ${DB_NAME}.${TABLE_NAME_USERS} u ON cr.user_id = u.id JOIN ${DB_NAME}.${TABLE_NAME_BOOKS} b ON cr.book_id = b.id;`;
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
  const QUERY = `INSERT INTO ${DB_NAME}.${TABLE_NAME_ISSUED_BOOKS} (user_id, book_id, checked_out) VALUES ('${userId}', '${bookId}', NOW())`;
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
    return checkout
  } catch (error) {
    await transactions.rollbackTransaction(connection);
    return null
  }
}

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
    return result
  } catch (error) {
    await transactions.rollbackTransaction(connection);
    return null
  }
}

exports.updateCheckoutRequestStatus = async (
  connection,
  checkoutRequest,
  checkoutRequestStatus) => {
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
      const checkout = await this.checkOutBook(connection, userId, bookId)
      const deleteRequest = await this.deleteCheckoutRequest(connection, checkoutRequestId)
      if (!checkout || !deleteRequest) {
        throw new Error("Error: executing the query")
      }
    }
    await transactions.commitTransaction(connection);
    return updatedResult;
  } catch (error) {
    await transactions.rollbackTransaction(connection);
    return null;
  }
}

exports.getBooksByTitle = async (connection, title) => {
  const QUERY = `SELECT * FROM ${DB_NAME}.${TABLE_NAME_BOOKS} WHERE LOWER(title) LIKE LOWER('%${title}%')`;
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
    const QUERY = `SELECT * FROM ${DB_NAME}.${TABLE_NAME_USERS} WHERE id = ${id}`;
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
    return user
  } catch (error) {
    return null
  }
}

exports.getAvailableBooks = async (connection) => {
  try {
    const QUERY = `SELECT * FROM ${DB_NAME}.${TABLE_NAME_BOOKS}`;
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
    return books
  } catch (error) {
    return null;
  }
}