require("dotenv").config();
const constants = require("../constants/constant");
const { getUserIdByUsernameQuery } = require("../service/queries/getUserIdByUsernameQuery");
const { getOverdueBooksQuery } = require("../service/queries/getOverdueBooksQuery");
const { addCheckoutRequestQuery } = require("../service/queries/addCheckoutRequestQuery");
const { addReturnRequestQuery } = require("../service/queries/addReturnRequestQuery");

exports.checkOverdueBooks = async (dependencies) => {
  try {
    const { connection, client, timeInterval } = dependencies;
    const overdueBooks = await getOverdueBooksQuery(connection, timeInterval);

    overdueBooks.forEach(async (book) => {
      const userId = book.user_id;
      const bookTitle = book.title;

      try {
        const user = await client.users.fetch(userId);
        user.send(
          `Reminder: The book "${bookTitle}" you checked out is overdue. Please return it as soon as possible.`,
        );
      } catch (error) { }
    });
  } catch (error) { }
};

exports.notifyAdminNewBookRequest = async (
  client,
  message,
  connection,
  bookRequest,
) => {
  try {
    const botOwnerUsernames = process.env.BOT_OWNER_USER_NAME.split(",").map(
      (username) => `'${username.trim()}'`,
    );
    const usernamesString = botOwnerUsernames.join(",");
    const userIdList = await getUserIdByUsernameQuery(connection, usernamesString);
    if (userIdList == null) throw new Error("Error");
    let isNotified = false;
    await userIdList.forEach(async (userId) => {
      try {
        const user = await client.users.fetch(userId.id);

        user.send(
          `Book request by ${message.author.username} : ${bookRequest}`,
        );
        isNotified = true;
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

exports.notifyUserAboutBookRequest = async (
  client,
  userId,
  status,
  description,
) => {
  try {
    const user = await client.users.fetch(userId);
    user.send(
      `The book \`${description}\` you requested has been marked as \`${status}\``,
    );
  } catch (error) { }
};

exports.notifyAdminCheckoutRequest = async (message, connection, client, book) => {
  try {
    const botOwnerUsernames = process.env.BOT_OWNER_USER_NAME.split(",").map(
      (username) => `'${username.trim()}'`,
    );
    const usernamesString = botOwnerUsernames.join(",");
    const userIdList = await getUserIdByUsernameQuery(connection, usernamesString);
    if (userIdList == null) throw new Error("Error");
    let isNotified = false;

    await userIdList.forEach(async (userId) => {
      try {
        const user = await client.users.fetch(userId.id);

        user.send(
          `Book checkout request by \`${message.author.username}\` : \`${book.title}\``,
        );
        isNotified = true;

      } catch (error) { }
    });

    const checkoutRequest = await addCheckoutRequestQuery(connection, message.author.id, book.id)

    if (!isNotified || !checkoutRequest) {
      message.reply(constants.ERROR_SENDING_TO_ADMIN_MESSAGE);
      return;
    }
    message.reply(constants.SUCCESSFULL_SENDING_TO_ADMIN_MESSAGE);
  } catch (error) {
    message.reply(constants.UNEXPECTED_CHECKOUT_BOOK_ERROR_MESSAGE);
  }
}

exports.notifyUserAboutCheckoutRequest = async (
  client,
  checkoutRequest,
  status
) => {
  const userId = checkoutRequest.user_id;
  const title = checkoutRequest.title;
  try {
    const user = await client.users.fetch(userId);
    user.send(
      `The book titled \`${title}\` that you checked out has been marked as \`${status}\``,
    );
  } catch (error) { }
}

exports.notifyAdminReturnBookRequest = async (message, connection, client, book) => {
  try {
    const botOwnerUsernames = process.env.BOT_OWNER_USER_NAME.split(",").map(
      (username) => `'${username.trim()}'`,
    );
    const usernamesString = botOwnerUsernames.join(",");
    const userIdList = await getUserIdByUsernameQuery(connection, usernamesString);
    if (userIdList == null) throw new Error("Error");
    let isNotified = false;

    await userIdList.forEach(async (userId) => {
      try {
        const user = await client.users.fetch(userId.id);

        user.send(
          `Book return request by \`${message.author.username}\` : \`${book.title}\``,
        );
        isNotified = true;

      } catch (error) { }
    });

    const returnRequest = await addReturnRequestQuery(connection, message.author.id, book.id)

    if (!isNotified || !returnRequest) {
      message.reply(constants.ERROR_SENDING_TO_ADMIN_MESSAGE);
      return;
    }
    message.reply(constants.SUCCESSFULL_SENDING_TO_ADMIN_RETURN_REQUEST_MESSAGE);
  } catch (error) {
    message.reply(constants.UNEXPECTED_RETURN_BOOK_ERROR_MESSAGE);
  }
}

exports.notifyUserAboutReturnRequest = async (
  client,
  returnRequest,
  status
) => {
  const userId = returnRequest.user_id;
  const title = returnRequest.title;
  try {
    const user = await client.users.fetch(userId);
    user.send(
      `The book titled \`${title}\` that you initiated return has been marked as \`${status}\``,
    );
  } catch (error) { }
}