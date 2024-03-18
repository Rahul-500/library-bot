require('dotenv').config()
const { getUserIdByUsername, getOverdueBooks } = require('../service/databaseService')
const constants = require("../constants/constant");

exports.checkOverdueBooks = async (dependencies) => {
  const { connection, client } = dependencies;
  const overdueBooks = await getOverdueBooks(connection)
  overdueBooks.forEach(async (book) => {
    const userId = book.user_id;
    const bookTitle = book.title;

    try {
      const user = await client.users.fetch(userId);
      user.send(
        `Reminder: The book "${bookTitle}" you checked out is overdue. Please return it as soon as possible.`
      );
    } catch (error) { }
  });
};


exports.notifyAdminNewBookRequest = async (client, message, connection, bookRequest) => {
  try {
    const botOwnerUsernames = process.env.BOT_OWNER_USER_NAME.split(',').map(username => `'${username.trim()}'`);
    const usernamesString = botOwnerUsernames.join(',');
    const userIdList = await getUserIdByUsername(connection, usernamesString);
    if (userIdList == null) throw new Error("Error")
    let isNotified = false;
    await userIdList.forEach(async (userId) => {
      try {
        const user = await client.users.fetch(userId.id);
      
        user.send(`Book request by ${message.author.username} : ${bookRequest}`);
        isNotified = true
      } catch (error) { }
    });
    if (!isNotified) {
      message.reply(constants.ERROR_SENDING_TO_ADMIN_MESSAGE);
      return;
    }
    message.reply(constants.SUCCESSFULL_SENDING_TO_ADMIN_MESSAGE);

  } catch (error) {
    message.reply(constants.UNEXPECTED_REQUEST_NEW_BOOK_ERROR_MESSAGE);
  }
}; 