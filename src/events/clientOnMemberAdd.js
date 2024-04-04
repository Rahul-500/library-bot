const { EmbedBuilder } = require("discord.js");

exports.clientOnMemberAdd = (client) => {
    client.on('guildMemberAdd', (member) => {
        const welcomeMessage = `Welcome to the Book Library, ${member.displayName}! 📚\n`
            + `We're thrilled to have you join us in our literary haven.\n`
            + `Feel free to explore our collection of books and engage with fellow book enthusiasts.\n`
            + `Type \`!help\` to get a list of commands and discover all the exciting features we offer.\n`
            + `Enjoy your time in the Book Library! 📖🌟`;

        const embed = new EmbedBuilder()
            .setDescription(welcomeMessage)
            .setColor('#0099ff')
     
        member.send({ embeds: [embed] })
            .then(() => console.log(`Sent welcome message to ${member.user.tag}`))
            .catch(console.error);
    });
}