require("dotenv").config();
const transactions = require("../../service/transactions");
const { DB_NAME } = process.env;

exports.updateCheckoutRequestStatusQuery = async (
    connection,
    checkoutRequest,
    checkoutRequestStatus
  ) => {
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
        const checkout = await this.checkOutBook(connection, userId, bookId);
        const deleteRequest = await this.deleteCheckoutRequest(
          connection,
          checkoutRequestId
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