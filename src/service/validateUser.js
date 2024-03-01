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
                console.log("User does not exist");
                resolve(false);
            } else {
                console.log("User exists");
                resolve(true);
            }
        });
    });
};
