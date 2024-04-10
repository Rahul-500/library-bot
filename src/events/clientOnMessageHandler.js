const { menu } = require("../controllers/menuController");
const bookMap = new Map();
const checkedOutBooks = new Map();
const userEventsMap = new Map();

let connection = null;
let client = null;

exports.clientOnMessageHandler = async (existingConnection, existingClient) => {
    connection = existingConnection;
    client = existingClient;

    client.on("messageCreate", messageCreateHandler);
};

const messageCreateHandler = (message) => {

    if (message.author.bot || !message.channel.type) return;
    if (message.guild) {
        const isGeneralChannelOrThread =
            message.channel.isThread() || message.channel.name === "general";
        if (isGeneralChannelOrThread) return;
    }

    const authorId = message.author.id;
    if (!userEventsMap.has(authorId)) {
        userEventsMap.set(authorId, { messageCreate: true });
    }
    if (!userEventsMap.get(authorId).messageCreate) {
        return;
    }

    const dependencies = {
        message,
        connection,
        bookMap,
        checkedOutBooks,
        userEventsMap,
        client,
    };
    menu(dependencies);
};