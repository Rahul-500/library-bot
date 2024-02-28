require('dotenv').config();

const axios = require('axios');
const { Client, GatewayIntentBits } = require('discord.js'); // Fix here

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] }); // Fix here

client.on('ready', () => {
    console.log('bot is ready');
});

client.on('messageCreate', async (message) => { // Fix here
    if (message.content === 'ping') {
        message.reply({
            content: 'pong',
        });
    } 
});

client.login(process.env.DISCORD_TOKEN);
