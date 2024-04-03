const { updateBookRequestStatus } = require("../../service/databaseService");
const { notifyUserAboutBookRequest } = require("../../service/notifier");
const constants = require("../../constants/constant")

exports.processBookRequest = async (
    client,
    message,
    connection,
    bookRequests,
    userEventsMap,
  ) => {
    try {
      const bookRequestsMap = new Map();
      let count = 1;
      bookRequests.forEach((request, index) => {
        bookRequestsMap.set(count++, request);
      });
      const authorId = message.author.id;
  
      await message.reply(constants.CHANGE_BOOK_REQUEST_STATUS_MESSAGE);
  
      const collector = message.channel.createMessageCollector();
  
      userEventsMap.get(authorId).messageCreate = false;
  
      const regexPatternForApprove = /^\/approve\s\d{1,}$/;
      const regexPatternForDecline = /^\/decline\s\d{1,}$/;
  
      collector.on("collect", async (response) => {
        if (response.content.toLowerCase() === "exit") {
          message.reply(constants.EXIT_VIEW_BOOK_MESSAGE);
          collector.stop();
          return;
        }
        if (
          !regexPatternForApprove.test(response.content) &&
          !regexPatternForDecline.test(response.content)
        ) {
          message.reply(constants.INVALID_CHANGE_OF_APPROVAL_DETAILS_MESSAGE);
          collector.stop();
          return;
        }
  
        const parsedVirtualId = parseInt(response.content.split(" ")[1]);
        const updateStatusTo =
          response.content.split(" ")[0] === "/approve" ? "approved" : "declined";
        const bookRequest = bookRequestsMap.get(parsedVirtualId);
  
        if (!bookRequestsMap.has(parsedVirtualId)) {
          message.reply(constants.INVALID_REQUEST_ID_MESSAGE);
        } else {
          message.reply(constants.CHANGE_OF_STATUS_RECEIVED);
          const updatedResult = await updateBookRequestStatus(
            connection,
            bookRequest.id,
            updateStatusTo,
          );
          if (!updatedResult) {
            message.reply(constants.ERROR_CHANGING_BOOK_REQUEST_STATUS_MESSAGE);
          } else {
            message.reply(
              constants.SUCCESSFULL_UPDATE_BOOK_REQUEST_STATUS_MESSAGE,
            );
            const userId = bookRequest.user_id;
            await notifyUserAboutBookRequest(
              client,
              userId,
              updateStatusTo,
              bookRequest.description,
            );
          }
        }
  
        collector.stop();
      });
  
      collector.on("end", () => {
        userEventsMap.get(authorId).messageCreate = true;
      });
    } catch (error) {
      message.reply(
        constants.UNEXPECTED_CHANGING_BOOK_REQUEST_STATUS_ERROR_MESSAGE,
      );
      collector.stop();
    }
  };