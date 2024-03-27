require("dotenv").config();
const { connect } = require("./src/database");
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const { menu } = require("./src/controllers/menuController");
const commandsController = require("./src/controllers/commandsController");
const validateUser = require("./src/service/validateUser");
const display = require("./src/utils/display");
const { checkOverdueBooks } = require("./src/service/notifier");

const bookMap = new Map();
const checkedOutBooks = new Map();
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel, Partials.Message],
});
const userEventsMap = new Map();

const connectToDb = async () => {
  try {
    const connection = await connect();
    console.error("Connection successful to MySQL database");
    return connection;
  } catch (error) {
    console.error("Error connecting to MySQL database:", error);
    return null;
  }
}

const startBot = async () => {
  const connection = await connectToDb();
  if (!connection) {
    process.exit(-1);
  }

  client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
    checkOverdueBooks({ connection, client });
  });

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
      commandsController,
      connection,
      validateUser,
      bookMap,
      checkedOutBooks,
      display,
      userEventsMap,
      client,
    };
    menu(dependencies);
  };

  client.on("messageCreate", messageCreateHandler);

  client.login(process.env.DISCORD_TOKEN);
}

startBot();