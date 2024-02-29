async function handleStart(message) {
    message.reply(`Welcome to the Book Library, ${message.author.username}!`);
    message.reply('Menu:\n1. Display all available books');
}

module.exports = {
    handleStart,
};
