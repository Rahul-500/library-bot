require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const {menu} = require('./controllers/menuController')
const commandsController=require('../src/controllers/commandsController')
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', (message) => menu(message,commandsController));

client.login(process.env.DISCORD_TOKEN);

