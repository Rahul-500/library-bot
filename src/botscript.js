require('dotenv').config();

const axios = require('axios');
const { Client, GatewayIntentBits } = require('discord.js');
const prefix = '/';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.login(process.env.DISCORD_TOKEN);

module.exports = client;