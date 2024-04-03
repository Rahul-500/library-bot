const { deleteBookWithQuantity } = require("../../service/databaseService");
const constants = require("../../constants/constant")

exports.deleteBook = async (message, connection, bookMap, userEventsMap) => {
    try {
      const authorId = message.author.id;
  
      await message.reply(constants.DELETE_BOOK_PROMPT_MESSAGE);
  
      const collector = message.channel.createMessageCollector();
  
      userEventsMap.get(authorId).messageCreate = false;
  
      const regexPatternForNumber = /^\d+$/;
      collector.on("collect", async (response) => {
        if (response.content.toLowerCase() === "exit") {
          message.reply(constants.EXIT_REMOVE_MESSAGE);
          collector.stop();
          return;
        }
  
        const details = response.content
          .split(";")
          .map((detail) => detail.trim());
        const [virtualId, quantity] = details;
        const parsedVirtualId = parseInt(virtualId);
        const parsedQuantity = parseInt(quantity);
  
        const book = bookMap.get(parsedVirtualId);
  
        if (
          !regexPatternForNumber.test(virtualId) ||
          !regexPatternForNumber.test(quantity)
        ) {
          message.reply(constants.INVALID_DELETE_DETAILS_MESSAGE);
        } else if (!bookMap.has(parsedVirtualId)) {
          message.reply(constants.INVALID_DELETE_BOOK_ID_MESSAGE);
        } else if (parsedQuantity > book.quantity_available) {
          message.reply(constants.QUANTITY_NOT_IN_LIMIT_MESSAGE);
        } else {
          message.reply(constants.DELETE_BOOK_DETAILS_RECEIVED_MESSAGE);
  
          await deleteBookWithQuantity(message, connection, book, parsedQuantity);
        }
  
        collector.stop();
      });
  
      collector.on("end", () => {
        userEventsMap.get(authorId).messageCreate = true;
      });
    } catch (error) {
      message.reply(constants.UNEXPECTED_DELETE_ERROR_MESSAGE);
      collector.stop();
    }
  };
