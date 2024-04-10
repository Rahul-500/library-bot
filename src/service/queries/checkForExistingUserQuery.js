require("dotenv").config();
const { DB_NAME } = process.env;

exports.checkForExistingUserQuery = async (message, connection) => {
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
