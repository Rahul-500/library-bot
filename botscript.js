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

const startBot = async () => {
  let connection;

  try {
    connection = await connect();
    console.log("Connected to MySQL database successfully!");
  } catch (error) {
    console.error("Error: Failed to connect to MySQL database");
    process.exit(-1);
  }

  client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
    checkOverdueBooks({ connection, client });
  });

  const messageCreateHandler = (message) => {
    if (message.author.bot || !message.guild) return;
    const isGeneralChannelOrThread =
      message.channel.isThread() || message.channel.name === "general";
    if (isGeneralChannelOrThread) return;

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

  await client.login(process.env.DISCORD_TOKEN);
};

startBot();
