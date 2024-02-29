require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const bookCommands = require('./commands/bookCommands');
const bodyParser = require('body-parser');
const express = require('express')

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const app = express();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith('/')) {
        const args = message.content.slice(1).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        switch (command) {
            case 'start':
                bookCommands.handleStart(message);
                break;
            case '1':
                bookCommands.handleDisplayAllAvailableBooks(message);
                break;
        }
    }
});

client.login(process.env.DISCORD_TOKEN);

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hello from Express!');
});

app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`);
});

