require("dotenv").config();
const transactions = require("../../service/transactions");
const { DB_NAME } = process.env;

exports.updateBookRequestStatusQuery = async (
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