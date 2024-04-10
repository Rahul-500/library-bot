require("dotenv").config();
const transactions = require("../../service/transactions");
const { DB_NAME } = process.env;

exports.addUserInfoQuery = async (id, name, connection) => {
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