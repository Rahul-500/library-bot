const constants = require("../constants/constant");
const { EmbedBuilder } = require("discord.js");
const { pagination } = require("../utils/pagination");

exports.welcomeMessage = (message, validateUser) => {
  const menuOptions = validateUser.isAdmin(message)
    ? constants.ADMIN_OPTIONS
    : constants.MENU_OPTIONS;
  const welcomeMessage = `${constants.WELCOME_MESSAGE}, ${message.author.username}!`;

  const embed = new EmbedBuilder()
    .setColor(constants.EMBED_COLOR)
    .setTitle(constants.MENU_TITLE)
    .setDescription(welcomeMessage)
    .addFields(
      { name: "Options", value: menuOptions, inline: false },
      { name: "How to use", value: constants.HELP_MESSAGE },
    )
    .setFooter({ text: constants.FOOTER_TEXT });

  message.reply({ embeds: [embed] });
};

exports.availableBooks = async (message, books, page = pagination) => {
  if (books.length === 0) {
    const embed = new EmbedBuilder()
      .setTitle(constants.NO_BOOKS_FOUND)
      .setColor("#FF0000")
      .setDescription(constants.SORRY_MESSAGE);

    message.reply({ embeds: [embed] });
    return;
  }
  const itemsPerPage = constants.itemsPerPage;
  const totalPages = Math.ceil(books.length / itemsPerPage);
  const embeds = [];

  for (let i = 0; i < books.length; i += itemsPerPage) {
    const currentBooks = books.slice(i, i + itemsPerPage);
    const fields = currentBooks.map((book, index) => ({
      name: `**ID: ${i + index + 1}**`,
      value: `**Title:** ${book.title}\n**Author:** ${book.author}`,
      inline: false,
    }));

    const embed = new EmbedBuilder()
      .setTitle(
        `${constants.AVAILABEL_BOOKS} (Page ${Math.floor(i / itemsPerPage) + 1}/${totalPages})`,
      )
      .setColor("#00FF00")
      .addFields(fields);

    embeds.push(embed);
  }

  await page(message, embeds);
};

exports.books = async (message, books, page = pagination) => {
  if (books.length === 0) {
    const embed = new EmbedBuilder()
      .setTitle(constants.NO_BOOKS_FOUND)
      .setColor("#FF0000")
      .setDescription(constants.SORRY_MESSAGE);

    message.reply({ embeds: [embed] });
    return;
  }
  const itemsPerPage = constants.itemsPerPage;
  const totalPages = Math.ceil(books.length / itemsPerPage);
  const embeds = [];

  for (let i = 0; i < books.length; i += itemsPerPage) {
    const currentBooks = books.slice(i, i + itemsPerPage);
    const fields = currentBooks.map((book, index) => ({
      name: `**ID: ${i + index + 1}**`,
      value: `**Title:** ${book.title}\n**Author:** ${book.author}\n**Published Year:** ${book.published_year}\n**Quantity:** ${book.quantity_available}`,
      inline: false,
    }));

    const embed = new EmbedBuilder()
      .setTitle(
        `${constants.AVAILABEL_BOOKS} (Page ${Math.floor(i / itemsPerPage) + 1}/${totalPages})`,
      )
      .setColor("#00FF00")
      .addFields(fields);

    embeds.push(embed);
  }

  await page(message, embeds);
};

exports.userBooks = async (message, books, page = pagination) => {
  if (books.length === 0) {
    const embed = new EmbedBuilder()
      .setTitle(constants.NO_BOOKS_FOUND)
      .setColor("#FF0000")
      .setDescription(constants.SORRY_MESSAGE);

    message.reply({ embeds: [embed] });
    return;
  }

  const itemsPerPage = constants.itemsPerPage;
  const totalPages = Math.ceil(books.length / itemsPerPage);
  const embeds = [];

  for (let i = 0; i < books.length; i += itemsPerPage) {
    const currentBooks = books.slice(i, i + itemsPerPage);
    const fields = currentBooks.map((book, index) => {
      const checkedOutDate = formatDate(book.checked_out);
      return {
        name: `**ID: ${i + index + 1}**`,
        value: `**Title:** ${book.title}\n**Author:** ${book.author}\n**Checked-Out-Date:** ${checkedOutDate}`,
        inline: false,
      };
    });

    const embed = new EmbedBuilder()
      .setTitle(
        `${constants.MY_BOOKS} (Page ${Math.floor(i / itemsPerPage) + 1}/${totalPages})`,
      )
      .setColor(constants.EMBED_COLOR)
      .addFields(fields);

    embeds.push(embed);
  }

  await page(message, embeds);
};

exports.availableBooksWithQuantity = async (
  message,
  books,
  page = pagination,
) => {
  if (books.length === 0) {
    const embed = new EmbedBuilder()
      .setTitle(constants.NO_BOOKS_FOUND)
      .setColor("#FF0000")
      .setDescription(constants.SORRY_MESSAGE);

    message.reply({ embeds: [embed] });
    return;
  }

  const itemsPerPage = constants.itemsPerPage;
  const totalPages = Math.ceil(books.length / itemsPerPage);
  const embeds = [];

  for (let i = 0; i < books.length; i += itemsPerPage) {
    const currentBooks = books.slice(i, i + itemsPerPage);
    let formattedBooks = "";

    currentBooks.forEach((book, index) => {
      formattedBooks += `**ID:**\t${i + index + 1}\n**Title:**\t${book.title}\n**Quantity:**\t${book.quantity_available}\n\n`;
    });

    const embed = new EmbedBuilder()
      .setTitle(
        `${constants.AVAILABEL_BOOKS} (Page ${Math.floor(i / itemsPerPage) + 1}/${totalPages})`,
      )
      .setColor("#00FF00")
      .setDescription(formattedBooks);

    embeds.push(embed);
  }

  await page(message, embeds);
};

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

exports.libraryHistory = async (message, libraryhistory, page = pagination) => {
  if (libraryhistory.length === 0) {
    const embed = new EmbedBuilder()
      .setTitle(constants.NO_HISTORY_FOUND)
      .setColor("#FF0000")
      .setDescription(constants.SORRY_MESSAGE_FOR_NO_HISTORY);

    message.reply({ embeds: [embed] });
    return;
  }

  const itemsPerPage = constants.itemsPerPage;
  const totalPages = Math.ceil(libraryhistory.length / itemsPerPage);
  const embeds = [];

  for (let i = 0; i < libraryhistory.length; i += itemsPerPage) {
    const currentHistory = libraryhistory.slice(i, i + itemsPerPage);
    let formattedLibraryhistory = "";

    currentHistory.forEach((history, index) => {
      const checkedOut = formatDate(history.checked_out);
      const returned = formatDate(history.returned);

      formattedLibraryhistory += `**ID:**\t${i + index + 1}\n**User:**\t${history.name}\n**Book:**\t${history.title}\n**Checked-out:**\t${checkedOut}\n**Returned:**\t${returned}\n\n`;
    });

    const embed = new EmbedBuilder()
      .setTitle(
        `${constants.LIBRARY_HISTORY} (Page ${Math.floor(i / itemsPerPage) + 1}/${totalPages})`,
      )
      .setColor("#00FF00")
      .setDescription(formattedLibraryhistory);

    embeds.push(embed);
  }

  await page(message, embeds);
};

exports.newBookRequests = async (message, bookRequests, page = pagination) => {
  if (bookRequests.length === 0) {
    const embed = new EmbedBuilder()
      .setTitle(constants.NO_BOOK_REQUESTS_FOUND)
      .setColor("#FF0000")
      .setDescription(constants.SORRY_MESSAGE_FOR_NO_BOOK_REQUEST);

    message.reply({ embeds: [embed] });
    return;
  }
  const itemsPerPage = constants.itemsPerPage;
  const totalPages = Math.ceil(bookRequests.length / itemsPerPage);
  const embeds = [];

  for (let i = 0; i < bookRequests.length; i += itemsPerPage) {
    const currentBookRequests = bookRequests.slice(i, i + itemsPerPage);
    const fields = currentBookRequests.map((bookRequest, index) => ({
      name: `**ID:** ${i + index + 1}`,
      value: `**Name:** ${bookRequest.name}\n**Request:** ${bookRequest.description}\n**Status:** ${bookRequest.status}`,
      inline: false,
    }));

    const embed = new EmbedBuilder()
      .setTitle(
        `${constants.BOOK_REQUESTS} (Page ${Math.floor(i / itemsPerPage) + 1}/${totalPages})`,
      )
      .setColor("#00FF00")
      .addFields(fields);

    embeds.push(embed);
  }

  await page(message, embeds);
};

exports.checkoutRequests = async (message, checkoutRequests, page = pagination) => {
  if (checkoutRequests.length === 0) {
    const embed = new EmbedBuilder()
      .setTitle(constants.NO_CHECKOUT_REQUEST_FOUND)
      .setColor("#FF0000")
      .setDescription(constants.SORRY_MESSAGE_FOR_NO_CHECKOUT_REQUEST);

    message.reply({ embeds: [embed] });
    return;
  }
  const itemsPerPage = constants.itemsPerPage;
  const totalPages = Math.ceil(checkoutRequests.length / itemsPerPage);
  const embeds = [];

  for (let i = 0; i < checkoutRequests.length; i += itemsPerPage) {
    const currentCheckoutRequest = checkoutRequests.slice(i, i + itemsPerPage);
    const fields = currentCheckoutRequest.map((checkoutRequest, index) => ({
      name: `**ID:** ${i + index + 1}`,
      value: `**Name:** ${checkoutRequest.name}\n**Title:** ${checkoutRequest.title}\n**Status:** ${checkoutRequest.status}`,
      inline: false,
    }));

    const embed = new EmbedBuilder()
      .setTitle(
        `${constants.CHECKOUT_REQUESTS} (Page ${Math.floor(i / itemsPerPage) + 1}/${totalPages})`,
      )
      .setColor("#00FF00")
      .addFields(fields);

    embeds.push(embed);
  }

  await page(message, embeds);
};

exports.returnRequests = async (message, returnRequests, page = pagination) => {
  if (returnRequests.length === 0) {
    const embed = new EmbedBuilder()
      .setTitle(constants.NO_RETURN_REQUEST_FOUND)
      .setColor("#FF0000")
      .setDescription(constants.SORRY_MESSAGE_FOR_NO_RETURN_REQUEST);

    message.reply({ embeds: [embed] });
    return;
  }
  const itemsPerPage = constants.itemsPerPage;
  const totalPages = Math.ceil(returnRequests.length / itemsPerPage);
  const embeds = [];

  for (let i = 0; i < returnRequests.length; i += itemsPerPage) {
    const currentReturnRequest = returnRequests.slice(i, i + itemsPerPage);
    const fields = currentReturnRequest.map((returnRequest, index) => ({
      name: `**ID:** ${i + index + 1}`,
      value: `**Name:** ${returnRequest.name}\n**Title:** ${returnRequest.title}\n**Status:** ${returnRequest.status}`,
      inline: false,
    }));

    const embed = new EmbedBuilder()
      .setTitle(
        `${constants.RETURN_REQUESTS} (Page ${Math.floor(i / itemsPerPage) + 1}/${totalPages})`,
      )
      .setColor("#00FF00")
      .addFields(fields);

    embeds.push(embed);
  }

  await page(message, embeds);
}