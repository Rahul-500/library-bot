require('dotenv').config();
const { connect } = require('./database');
const { Client, GatewayIntentBits } = require('discord.js');
const { menu } = require('./controllers/menuController');
const commandsController = require('../src/controllers/commandsController');
const validateUser = require('../src/service/validateUser');
const bookMap = new Map();
const checkedOutBooks = new Map();
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
connect()
    .then((connection) => {
        client.on('ready', () => {
            console.log(`Logged in as ${client.user.tag}!`);
        });

        client.on('messageCreate', (message) => {
            const dependencies = {
                message,
                commandsController,
                connection,
                validateUser,
                bookMap,
                checkedOutBooks
            }
            menu(dependencies)
        });

        client.login(process.env.DISCORD_TOKEN);
    })
    .catch((error) => {
        console.error('Error connecting to MySQL database:', error);
    });
