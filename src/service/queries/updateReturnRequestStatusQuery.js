require("dotenv").config();
const transactions = require("../../service/transactions");
const { DB_NAME } = process.env;
const { returnBookWithIdQuery } = require("./returnBookWithIdQuery")
const { deleteReturnRequestQuery } = require("./deleteReturnRequestQuery");

exports.updateReturnRequestStatusQuery = async (
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
      const checkout = await returnBookWithIdQuery(connection, userId, bookId);
      const deleteRequest = await deleteReturnRequestQuery(
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