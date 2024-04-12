require("dotenv").config();
const { DB_NAME } = process.env;

exports.getUserQuery = async (connection, id) => {
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