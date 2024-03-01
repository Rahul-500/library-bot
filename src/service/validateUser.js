exports.checkForExistingUser = async (message, connection) => {
    const id = message.author.id;
    const QUERY = `SELECT * FROM library.users WHERE id = ${id}`;

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
