require("dotenv").config();
const { DB_NAME, TABLE_NAME_USERS } = process.env;
exports.checkForExistingUser = async (message, connection) => {
  const id = message.author.id;
  const QUERY = `SELECT * FROM ${DB_NAME}.${TABLE_NAME_USERS} WHERE id = ${id}`;

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

exports.isAdmin = (message) => {
  const BOT_OWNER_USER_NAMES = (process.env.BOT_OWNER_USER_NAME || "").split(
    ",",
  );

  return BOT_OWNER_USER_NAMES.includes(message.author.username);
};
