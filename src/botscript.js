require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const bookCommands = require('./commands/bookCommands');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

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
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
