exports.beginTransaction = (connection) => {
    return new Promise((resolve, reject) => {
        connection.beginTransaction((error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

exports.commitTransaction = (connection) => {
    return new Promise((resolve, reject) => {
        connection.commit((error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

exports.rollbackTransaction = (connection) => {
    return new Promise((resolve, reject) => {
        connection.rollback((error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}