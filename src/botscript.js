require('dotenv').config();
const { connect } = require('./database');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { menu } = require('./controllers/menuController');
const commandsController = require('../src/controllers/commandsController');
const validateUser = require('../src/service/validateUser');
const bookMap = new Map();
const checkedOutBooks = new Map();
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel, Partials.Message]
});
connect()
    .then((connection) => {
        client.on('ready', () => {
            console.log(`Logged in as ${client.user.tag}!`);
        });

        const messageCreateHandler = (message) => {
            if (!message.channel.type) {
                return;
            }
            
            const dependencies = {
                message,
                commandsController,
                connection,
                validateUser,
                bookMap,
                checkedOutBooks,
                messageCreateHandler,
                client
            }
            menu(dependencies)
        }

        client.on('messageCreate', messageCreateHandler);

        client.login(process.env.DISCORD_TOKEN);
    })
    .catch((error) => {
        console.error('Error connecting to MySQL database:', error);
    });
