const { Client, GatewayIntentBits, Partials } = require("discord.js");

exports.clientLogin = async () => {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.DirectMessageTyping,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.GuildMembers
        ],
        partials: [Partials.Channel, Partials.Message],
    });

    await client.login(process.env.DISCORD_TOKEN);

    return client
}